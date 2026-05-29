"""
File upload endpoint.
"""
import os
import uuid
from datetime import datetime
from typing import Annotated
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from PIL import Image

from app.api.deps import AdminUser
from app.core.config import settings
from app.core.file_validation import validate_image_content
from app.core.mime_types import get_content_type, is_image, is_video
from app.services.storage import get_storage_service

router = APIRouter(prefix="/upload", tags=["Upload"])


def _build_image_list() -> dict:
    """List images from R2 storage."""
    try:
        storage = get_storage_service()
        files = storage.list_files()

        # Filter by allowed extensions
        images = []
        for file_info in files:
            ext = file_info['filename'].rsplit(".", 1)[-1].lower() if "." in file_info['filename'] else ""
            if ext in settings.ALLOWED_EXTENSIONS:
                images.append({
                    "filename": file_info['filename'],
                    "url": file_info['url'],
                    "size": file_info['size'],
                    "uploaded_at": file_info['last_modified'],
                })

        images.sort(key=lambda x: x["uploaded_at"], reverse=True)
        return {"images": images}
    except Exception as e:
        # Fallback to empty list if R2 not configured
        return {"images": []}


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


@router.post("/file")
async def upload_file(
    file: Annotated[UploadFile, File()],
    admin: AdminUser
):
    """
    Upload a file (image or video).

    Security features:
    - UUID-based filenames (prevents guessing)
    - Content type validation
    - File size limits
    - Admin-only access

    Returns the URL path to the uploaded file.
    Admin only.
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

    # Determine if image or video
    if is_image(filename):
        # Validate image content (magic bytes + PIL verification)
        validate_image_content(contents, file.filename)

        try:
            img = Image.open(__import__("io").BytesIO(contents))
            img.verify()
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid image file"
            )
    elif is_video(filename):
        # Basic validation for videos (you could add more sophisticated checks)
        # For now, we trust the extension after validation
        pass

    # Get proper content type
    content_type = get_content_type(filename)

    # Upload to R2
    storage = get_storage_service()
    url = storage.upload_file(contents, filename, content_type)

    # Return the URL (only the UUID-based filename is exposed)
    return {
        "filename": filename,
        "url": url,
        "size": len(contents),
        "content_type": content_type
    }


# Keep legacy endpoint for backwards compatibility
@router.post("/image")
async def upload_image(
    file: Annotated[UploadFile, File()],
    admin: AdminUser
):
    """
    Legacy endpoint: Upload an image file.
    Use /upload/file instead for images and videos.

    Admin only.
    """
    return await upload_file(file, admin)


@router.get("/images/public")
def list_images_public():
    """List all uploaded images (public, no auth required)."""
    return _build_image_list()


@router.get("/images")
def list_images(admin: AdminUser):
    """List all uploaded images. Admin only."""
    return _build_image_list()


@router.delete("/image/{filename}")
def delete_image(filename: str, admin: AdminUser):
    """
    Delete an uploaded image from R2.

    Admin only.
    """
    # Validate filename (prevent path traversal)
    if "/" in filename or "\\" in filename or ".." in filename:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid filename"
        )

    # Delete from R2
    storage = get_storage_service()
    if not storage.file_exists(filename):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )

    storage.delete_file(filename)
    return {"message": "File deleted successfully"}
