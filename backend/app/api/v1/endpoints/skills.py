"""
Skills endpoints.
"""
from typing import List, Dict
from fastapi import APIRouter, HTTPException, status

from app.api.deps import DbSession, AdminUser
from app.schemas.skill import SkillCreate, SkillUpdate, SkillResponse
from app.services import skill as skill_service

router = APIRouter(prefix="/skills", tags=["Skills"])


@router.get("/", response_model=List[SkillResponse])
def get_skills(
    db: DbSession,
    category: str | None = None,
    learning: bool = False
):
    """Get all visible skills with optional filters."""
    return skill_service.get_skills(
        db,
        visible_only=True,
        category=category,
        learning_only=learning
    )


@router.get("/all", response_model=List[SkillResponse])
def get_all_skills(
    db: DbSession,
    admin: AdminUser,
    category: str | None = None
):
    """Get all skills including hidden (admin only)."""
    return skill_service.get_skills(db, visible_only=False, category=category)


@router.get("/grouped", response_model=Dict[str, List[SkillResponse]])
def get_skills_grouped(db: DbSession):
    """Get skills grouped by category."""
    return skill_service.get_skills_by_category(db, visible_only=True)


@router.get("/categories", response_model=List[str])
def get_skill_categories(db: DbSession):
    """Get all unique skill categories."""
    return skill_service.get_categories(db)


@router.get("/learning", response_model=List[SkillResponse])
def get_learning_skills(db: DbSession):
    """Get skills marked as 'currently learning'."""
    return skill_service.get_skills(db, visible_only=True, learning_only=True)


@router.get("/{skill_id}", response_model=SkillResponse)
def get_skill(skill_id: int, db: DbSession):
    """Get a specific skill."""
    skill = skill_service.get_skill_by_id(db, skill_id)
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found"
        )
    return skill


@router.post("/", response_model=SkillResponse, status_code=status.HTTP_201_CREATED)
def create_skill(
    skill_data: SkillCreate,
    db: DbSession,
    admin: AdminUser
):
    """Create a new skill (admin only)."""
    return skill_service.create_skill(db, skill_data)


@router.put("/{skill_id}", response_model=SkillResponse)
def update_skill(
    skill_id: int,
    skill_data: SkillUpdate,
    db: DbSession,
    admin: AdminUser
):
    """Update a skill (admin only)."""
    skill = skill_service.update_skill(db, skill_id, skill_data)
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found"
        )
    return skill


@router.delete("/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_skill(
    skill_id: int,
    db: DbSession,
    admin: AdminUser
):
    """Delete a skill (admin only)."""
    if not skill_service.delete_skill(db, skill_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found"
        )
