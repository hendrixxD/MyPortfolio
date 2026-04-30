"""
Profile link endpoints.
"""
from typing import List
from fastapi import APIRouter, HTTPException, status

from app.api.deps import DbSession, AdminUser
from app.schemas.profile_link import ProfileLinkCreate, ProfileLinkUpdate, ProfileLinkResponse
from app.services import profile_link as profile_link_service

router = APIRouter(prefix="/profile-links", tags=["Profile Links"])


@router.get("/", response_model=List[ProfileLinkResponse])
def get_profile_links(db: DbSession):
    """Get all visible profile links."""
    return profile_link_service.get_profile_links(db, visible_only=True)


@router.get("/all", response_model=List[ProfileLinkResponse])
def get_all_profile_links(db: DbSession, admin: AdminUser):
    """Get all profile links including hidden (admin only)."""
    return profile_link_service.get_profile_links(db, visible_only=False)


@router.get("/{link_id}", response_model=ProfileLinkResponse)
def get_profile_link(link_id: int, db: DbSession):
    """Get a specific profile link."""
    link = profile_link_service.get_profile_link_by_id(db, link_id)
    if not link:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile link not found"
        )
    return link


@router.post("/", response_model=ProfileLinkResponse, status_code=status.HTTP_201_CREATED)
def create_profile_link(
    link_data: ProfileLinkCreate,
    db: DbSession,
    admin: AdminUser
):
    """Create a new profile link (admin only)."""
    return profile_link_service.create_profile_link(db, link_data)


@router.put("/{link_id}", response_model=ProfileLinkResponse)
def update_profile_link(
    link_id: int,
    link_data: ProfileLinkUpdate,
    db: DbSession,
    admin: AdminUser
):
    """Update a profile link (admin only)."""
    link = profile_link_service.update_profile_link(db, link_id, link_data)
    if not link:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile link not found"
        )
    return link


@router.delete("/{link_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_profile_link(
    link_id: int,
    db: DbSession,
    admin: AdminUser
):
    """Delete a profile link (admin only)."""
    if not profile_link_service.delete_profile_link(db, link_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile link not found"
        )
