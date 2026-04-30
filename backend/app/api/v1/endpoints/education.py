"""
Education endpoints.
"""
from typing import List
from fastapi import APIRouter, HTTPException, status

from app.api.deps import DbSession, AdminUser
from app.schemas.education import EducationCreate, EducationUpdate, EducationResponse
from app.services import education as education_service

router = APIRouter(prefix="/education", tags=["Education"])


@router.get("/", response_model=List[EducationResponse])
def get_education_list(db: DbSession):
    """Get all visible education entries."""
    return education_service.get_education_list(db, visible_only=True)


@router.get("/all", response_model=List[EducationResponse])
def get_all_education(db: DbSession, admin: AdminUser):
    """Get all education entries including hidden (admin only)."""
    return education_service.get_education_list(db, visible_only=False)


@router.get("/{edu_id}", response_model=EducationResponse)
def get_education(edu_id: int, db: DbSession):
    """Get a specific education entry."""
    edu = education_service.get_education_by_id(db, edu_id)
    if not edu:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Education entry not found"
        )
    return edu


@router.post("/", response_model=EducationResponse, status_code=status.HTTP_201_CREATED)
def create_education(
    edu_data: EducationCreate,
    db: DbSession,
    admin: AdminUser
):
    """Create a new education entry (admin only)."""
    return education_service.create_education(db, edu_data)


@router.put("/{edu_id}", response_model=EducationResponse)
def update_education(
    edu_id: int,
    edu_data: EducationUpdate,
    db: DbSession,
    admin: AdminUser
):
    """Update an education entry (admin only)."""
    edu = education_service.update_education(db, edu_id, edu_data)
    if not edu:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Education entry not found"
        )
    return edu


@router.delete("/{edu_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_education(
    edu_id: int,
    db: DbSession,
    admin: AdminUser
):
    """Delete an education entry (admin only)."""
    if not education_service.delete_education(db, edu_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Education entry not found"
        )
