"""
Experience endpoints.
"""
from typing import List
from fastapi import APIRouter, HTTPException, status

from app.api.deps import DbSession, AdminUser
from app.schemas.experience import ExperienceCreate, ExperienceUpdate, ExperienceResponse
from app.services import experience as experience_service

router = APIRouter(prefix="/experiences", tags=["Experiences"])


@router.get("/", response_model=List[ExperienceResponse])
def get_experiences(
    db: DbSession,
    category: str | None = None
):
    """Get all visible experiences with optional category filter."""
    return experience_service.get_experiences(db, visible_only=True, category=category)


@router.get("/all", response_model=List[ExperienceResponse])
def get_all_experiences(
    db: DbSession,
    admin: AdminUser,
    category: str | None = None
):
    """Get all experiences including hidden (admin only)."""
    return experience_service.get_experiences(db, visible_only=False, category=category)


@router.get("/{exp_id}", response_model=ExperienceResponse)
def get_experience(exp_id: int, db: DbSession):
    """Get a specific experience entry."""
    exp = experience_service.get_experience_by_id(db, exp_id)
    if not exp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Experience not found"
        )
    return exp


@router.post("/", response_model=ExperienceResponse, status_code=status.HTTP_201_CREATED)
def create_experience(
    exp_data: ExperienceCreate,
    db: DbSession,
    admin: AdminUser
):
    """Create a new experience entry (admin only)."""
    return experience_service.create_experience(db, exp_data)


@router.put("/{exp_id}", response_model=ExperienceResponse)
def update_experience(
    exp_id: int,
    exp_data: ExperienceUpdate,
    db: DbSession,
    admin: AdminUser
):
    """Update an experience entry (admin only)."""
    exp = experience_service.update_experience(db, exp_id, exp_data)
    if not exp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Experience not found"
        )
    return exp


@router.delete("/{exp_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_experience(
    exp_id: int,
    db: DbSession,
    admin: AdminUser
):
    """Delete an experience entry (admin only)."""
    if not experience_service.delete_experience(db, exp_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Experience not found"
        )
