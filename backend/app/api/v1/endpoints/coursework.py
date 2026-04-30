"""
Coursework endpoints for academic courses.
"""
from typing import List, Dict
from fastapi import APIRouter, HTTPException, status

from app.api.deps import DbSession, AdminUser
from app.schemas.coursework import (
    CourseworkCreate, CourseworkUpdate, CourseworkResponse
)
from app.services import coursework as coursework_service

router = APIRouter(prefix="/coursework", tags=["Coursework"])


@router.get("/", response_model=List[CourseworkResponse])
def get_coursework_list(
    db: DbSession,
    category: str = None
):
    """Get all active coursework entries, optionally filtered by category."""
    return coursework_service.get_coursework_list(
        db, active_only=True, category=category
    )


@router.get("/grouped", response_model=Dict[str, List[CourseworkResponse]])
def get_coursework_grouped(db: DbSession):
    """Get coursework entries grouped by category."""
    return coursework_service.get_coursework_grouped(db, active_only=True)


@router.get("/categories", response_model=List[str])
def get_coursework_categories(db: DbSession):
    """Get all unique coursework categories."""
    return coursework_service.get_coursework_categories(db)


@router.get("/highlighted", response_model=List[CourseworkResponse])
def get_highlighted_coursework(db: DbSession):
    """Get highlighted/featured coursework entries."""
    return coursework_service.get_highlighted_coursework(db)


@router.get("/all", response_model=List[CourseworkResponse])
def get_all_coursework(db: DbSession, admin: AdminUser):
    """Get all coursework entries including inactive (admin only)."""
    return coursework_service.get_coursework_list(db, active_only=False)


@router.get("/{course_id}", response_model=CourseworkResponse)
def get_coursework(course_id: int, db: DbSession):
    """Get a specific coursework entry."""
    course = coursework_service.get_coursework_by_id(db, course_id)
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coursework entry not found"
        )
    return course


@router.post("/", response_model=CourseworkResponse, status_code=status.HTTP_201_CREATED)
def create_coursework(
    course_data: CourseworkCreate,
    db: DbSession,
    admin: AdminUser
):
    """Create a new coursework entry (admin only)."""
    return coursework_service.create_coursework(db, course_data)


@router.put("/{course_id}", response_model=CourseworkResponse)
def update_coursework(
    course_id: int,
    course_data: CourseworkUpdate,
    db: DbSession,
    admin: AdminUser
):
    """Update a coursework entry (admin only)."""
    course = coursework_service.update_coursework(db, course_id, course_data)
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coursework entry not found"
        )
    return course


@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_coursework(
    course_id: int,
    db: DbSession,
    admin: AdminUser
):
    """Delete a coursework entry (admin only)."""
    if not coursework_service.delete_coursework(db, course_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coursework entry not found"
        )
