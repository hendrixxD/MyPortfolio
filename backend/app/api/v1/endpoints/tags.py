"""
Tag endpoints.
"""
from typing import List
from fastapi import APIRouter, HTTPException, status

from app.api.deps import DbSession, AdminUser
from app.schemas.tag import TagCreate, TagUpdate, TagResponse
from app.services import tag as tag_service

router = APIRouter(prefix="/tags", tags=["Tags"])


@router.get("/", response_model=List[TagResponse])
def get_tags(
    db: DbSession,
    tag_type: str | None = None
):
    """Get all tags with optional type filter."""
    return tag_service.get_tags(db, tag_type=tag_type)


@router.get("/{tag_id}", response_model=TagResponse)
def get_tag(tag_id: int, db: DbSession):
    """Get a specific tag by ID."""
    tag = tag_service.get_tag_by_id(db, tag_id)
    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag not found"
        )
    return tag


@router.post("/", response_model=TagResponse, status_code=status.HTTP_201_CREATED)
def create_tag(
    tag_data: TagCreate,
    db: DbSession,
    admin: AdminUser
):
    """Create a new tag (admin only)."""
    return tag_service.create_tag(db, tag_data)


@router.put("/{tag_id}", response_model=TagResponse)
def update_tag(
    tag_id: int,
    tag_data: TagUpdate,
    db: DbSession,
    admin: AdminUser
):
    """Update a tag (admin only)."""
    tag = tag_service.update_tag(db, tag_id, tag_data)
    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag not found"
        )
    return tag


@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tag(
    tag_id: int,
    db: DbSession,
    admin: AdminUser
):
    """Delete a tag (admin only)."""
    if not tag_service.delete_tag(db, tag_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag not found"
        )
