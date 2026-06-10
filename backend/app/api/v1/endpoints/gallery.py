"""
Gallery management endpoints.
"""
import os
import uuid
import asyncio
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from typing import Annotated
from fastapi import APIRouter, UploadFile, File, HTTPException, status, Depends, Query
from sqlalchemy.orm import Session
from PIL import Image
import io

from slugify import slugify

from app.api.deps import get_db, AdminUser
from app.core.config import settings
from app.core.file_validation import validate_image_content
from app.core.mime_types import get_content_type, is_image, is_video
from app.models.gallery import GalleryItem, GalleryTag, GalleryStatus
from app.schemas.gallery import (
    GalleryItem as GalleryItemSchema,
    GalleryItemBrief,
    GalleryItemCreate,
    GalleryItemUpdate,
    GalleryTag as GalleryTagSchema,
    GalleryTagCreate,
    GalleryTagUpdate,
    GalleryUploadResponse,
)
from app.services.storage import get_storage_service

router = APIRouter(prefix="/gallery", tags=["Gallery"])

# Thread pool executor for CPU-bound PIL operations
_executor = ThreadPoolExecutor(max_workers=4)


def _validate_image_sync(contents: bytes) -> tuple[int, int]:
    """
    Synchronous PIL validation and dimension extraction.

    Runs in executor to prevent blocking the event loop.
    """
    img = Image.open(io.BytesIO(contents))
    img.verify()
    # Re-open to get dimensions (verify() closes the image)
    img = Image.open(io.BytesIO(contents))
    return img.size


def validate_file_extension(filename: str) -> str:
    """Validate and return file extension."""
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )
    return ext


def generate_unique_filename(original_filename: str) -> str:
    """
    Generate a cryptographically unique filename using UUID.

    This prevents:
    - Path traversal attacks
    - Filename guessing
    - Direct URL access to original files

    Format: {uuid4}.{ext}
    """
    ext = original_filename.rsplit(".", 1)[-1].lower() if "." in original_filename else "jpg"
    # Use full UUID4 for maximum uniqueness (no timestamp to prevent enumeration)
    unique_id = uuid.uuid4().hex
    return f"{unique_id}.{ext}"


# ===== Gallery Tags =====

@router.get("/tags", response_model=list[GalleryTagSchema])
def get_gallery_tags(db: Session = Depends(get_db)):
    """Get all gallery tags."""
    return db.query(GalleryTag).order_by(GalleryTag.name).all()


@router.post("/tags", response_model=GalleryTagSchema)
def create_gallery_tag(
    tag: GalleryTagCreate,
    admin: AdminUser,
    db: Session = Depends(get_db)
):
    """Create a new gallery tag."""
    slug = tag.slug or slugify(tag.name)

    # Check if tag with same name or slug exists
    existing = db.query(GalleryTag).filter(
        (GalleryTag.name == tag.name) | (GalleryTag.slug == slug)
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tag with this name or slug already exists"
        )

    db_tag = GalleryTag(
        name=tag.name,
        slug=slug,
        color=tag.color
    )
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag


@router.put("/tags/{tag_id}", response_model=GalleryTagSchema)
def update_gallery_tag(
    tag_id: int,
    tag: GalleryTagUpdate,
    admin: AdminUser,
    db: Session = Depends(get_db)
):
    """Update a gallery tag."""
    db_tag = db.query(GalleryTag).filter(GalleryTag.id == tag_id).first()
    if not db_tag:
        raise HTTPException(status_code=404, detail="Tag not found")

    if tag.name is not None:
        db_tag.name = tag.name
    if tag.slug is not None:
        db_tag.slug = tag.slug
    if tag.color is not None:
        db_tag.color = tag.color

    db.commit()
    db.refresh(db_tag)
    return db_tag


@router.delete("/tags/{tag_id}")
def delete_gallery_tag(
    tag_id: int,
    admin: AdminUser,
    db: Session = Depends(get_db)
):
    """Delete a gallery tag."""
    db_tag = db.query(GalleryTag).filter(GalleryTag.id == tag_id).first()
    if not db_tag:
        raise HTTPException(status_code=404, detail="Tag not found")

    db.delete(db_tag)
    db.commit()
    return {"message": "Tag deleted successfully"}


# ===== Gallery Items =====

@router.get("/items", response_model=list[GalleryItemBrief])
def get_gallery_items(
    tag: str | None = Query(None),
    featured: bool | None = Query(None),
    db: Session = Depends(get_db)
):
    """Get all published gallery items (public)."""
    query = db.query(GalleryItem).filter(GalleryItem.status == GalleryStatus.PUBLISHED)

    if tag:
        query = query.join(GalleryItem.tags).filter(GalleryTag.slug == tag)

    if featured is not None:
        query = query.filter(GalleryItem.is_featured == featured)

    return query.order_by(GalleryItem.order.desc(), GalleryItem.published_at.desc()).all()


@router.get("/items/all", response_model=list[GalleryItemBrief])
def get_all_gallery_items(
    admin: AdminUser,
    tag: str | None = Query(None),
    status_filter: str | None = Query(None, alias="status"),
    db: Session = Depends(get_db)
):
    """Get all gallery items including drafts (admin only)."""
    query = db.query(GalleryItem)

    if status_filter:
        query = query.filter(GalleryItem.status == status_filter)

    if tag:
        query = query.join(GalleryItem.tags).filter(GalleryTag.slug == tag)

    return query.order_by(GalleryItem.order.desc(), GalleryItem.uploaded_at.desc()).all()


@router.get("/items/{item_id}", response_model=GalleryItemSchema)
def get_gallery_item(
    item_id: int,
    db: Session = Depends(get_db)
):
    """Get a single gallery item (public, published only)."""
    item = db.query(GalleryItem).filter(
        GalleryItem.id == item_id,
        GalleryItem.status == GalleryStatus.PUBLISHED
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Gallery item not found")

    return item


@router.get("/items/admin/{item_id}", response_model=GalleryItemSchema)
def get_gallery_item_admin(
    item_id: int,
    admin: AdminUser,
    db: Session = Depends(get_db)
):
    """Get a single gallery item (admin, includes hidden)."""
    item = db.query(GalleryItem).filter(GalleryItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Gallery item not found")
    return item


@router.post("/upload", response_model=GalleryUploadResponse)
async def upload_gallery_image(
    file: Annotated[UploadFile, File()],
    admin: AdminUser,
    db: Session = Depends(get_db)
):
    """
    Upload a file (image or video) to the gallery.

    Security features:
    - UUID-based filenames (prevents guessing)
    - Content type validation
    - File size limits
    - Admin-only access
    """
    # Validate file size
    contents = await file.read()
    if len(contents) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size: {settings.MAX_UPLOAD_SIZE // (1024*1024)}MB"
        )

    # Validate extension
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is required"
        )

    validate_file_extension(file.filename)

    # Generate cryptographically unique filename (prevents URL guessing)
    filename = generate_unique_filename(file.filename)

    # Handle images vs videos
    width, height = None, None

    if is_image(filename):
        # Validate image content (magic bytes)
        validate_image_content(contents, file.filename)

        # Validate and get dimensions (async to prevent event loop blocking)
        try:
            loop = asyncio.get_event_loop()
            width, height = await loop.run_in_executor(
                _executor,
                _validate_image_sync,
                contents
            )
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid image file"
            )
    elif is_video(filename):
        # For videos, we skip PIL validation
        # You could add video-specific validation here if needed
        pass

    # Get proper content type
    content_type = get_content_type(filename)

    # Upload to R2
    storage = get_storage_service()
    url = storage.upload_file(contents, filename, content_type)

    # Create database entry (starts as draft)
    db_item = GalleryItem(
        filename=filename,
        url=url,
        size=len(contents),
        width=width,
        height=height,
        status=GalleryStatus.DRAFT
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)

    return GalleryUploadResponse(
        id=db_item.id,
        filename=db_item.filename,
        url=db_item.url,
        size=db_item.size,
        width=db_item.width,
        height=db_item.height
    )


@router.put("/items/{item_id}", response_model=GalleryItemSchema)
def update_gallery_item(
    item_id: int,
    data: GalleryItemUpdate,
    admin: AdminUser,
    db: Session = Depends(get_db)
):
    """Update gallery item metadata."""
    db_item = db.query(GalleryItem).filter(GalleryItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Gallery item not found")

    # Note: Gallery items don't have user ownership - only admins can update

    if data.caption is not None:
        db_item.caption = data.caption
    if data.description is not None:
        db_item.description = data.description
    if data.alt_text is not None:
        db_item.alt_text = data.alt_text
    if data.status is not None:
        db_item.status = GalleryStatus(data.status)
        # Set published_at timestamp when publishing
        if data.status == 'published' and not db_item.published_at:
            db_item.published_at = datetime.now()
    if data.is_featured is not None:
        db_item.is_featured = data.is_featured
    if data.order is not None:
        db_item.order = data.order

    # Update tags
    if data.tag_ids is not None:
        tags = db.query(GalleryTag).filter(GalleryTag.id.in_(data.tag_ids)).all()
        db_item.tags = tags

    db.commit()
    db.refresh(db_item)
    return db_item


@router.post("/items/{item_id}/publish", response_model=GalleryItemSchema)
def publish_gallery_item(
    item_id: int,
    admin: AdminUser,
    db: Session = Depends(get_db)
):
    """Publish a gallery item."""
    db_item = db.query(GalleryItem).filter(GalleryItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Gallery item not found")

    db_item.status = GalleryStatus.PUBLISHED
    if not db_item.published_at:
        db_item.published_at = datetime.now()

    db.commit()
    db.refresh(db_item)
    return db_item


@router.post("/items/{item_id}/unpublish", response_model=GalleryItemSchema)
def unpublish_gallery_item(
    item_id: int,
    admin: AdminUser,
    db: Session = Depends(get_db)
):
    """Unpublish a gallery item (set to draft)."""
    db_item = db.query(GalleryItem).filter(GalleryItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Gallery item not found")

    db_item.status = GalleryStatus.DRAFT

    db.commit()
    db.refresh(db_item)
    return db_item


@router.delete("/items/{item_id}")
def delete_gallery_item(
    item_id: int,
    admin: AdminUser,
    db: Session = Depends(get_db)
):
    """Delete a gallery item and its file."""
    db_item = db.query(GalleryItem).filter(GalleryItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Gallery item not found")

    # Note: Gallery items don't have user ownership - only admins can delete

    # Delete file from R2
    try:
        storage = get_storage_service()
        if storage.file_exists(db_item.filename):
            storage.delete_file(db_item.filename)
    except Exception as e:
        print(f"Failed to delete file from R2: {e}")

    # Delete database entry
    db.delete(db_item)
    db.commit()

    return {"message": "Gallery item deleted successfully"}
