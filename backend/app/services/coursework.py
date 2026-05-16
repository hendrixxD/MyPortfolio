"""
Coursework service for managing academic courses.
"""
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict

from app.models.coursework import Coursework
from app.schemas.coursework import CourseworkCreate, CourseworkUpdate


def get_coursework_list(
    db: Session, 
    active_only: bool = True,
    category: str = None
) -> List[Coursework]:
    """Get all coursework entries."""
    query = db.query(Coursework)
    
    if active_only:
        query = query.filter(Coursework.is_active == True)
    
    if category:
        query = query.filter(Coursework.category == category)
    
    return query.order_by(
        Coursework.order.asc(),
        Coursework.year.desc().nullslast(),
        Coursework.course_name.asc()
    ).all()


def get_coursework_grouped(
    db: Session, 
    active_only: bool = True
) -> Dict[str, List[Coursework]]:
    """Get coursework entries grouped by category."""
    courses = get_coursework_list(db, active_only=active_only)
    
    grouped = {}
    for course in courses:
        category = course.category or "Other Courses"
        if category not in grouped:
            grouped[category] = []
        grouped[category].append(course)
    
    return grouped


def get_coursework_categories(db: Session, active_only: bool = True) -> List[str]:
    """Get all unique coursework categories."""
    query = db.query(Coursework.category).distinct()
    
    if active_only:
        query = query.filter(Coursework.is_active == True)
    
    categories = query.filter(Coursework.category.isnot(None)).all()
    return [cat[0] for cat in categories if cat[0]]


def get_highlighted_coursework(db: Session) -> List[Coursework]:
    """Get highlighted/featured coursework entries."""
    return db.query(Coursework).filter(
        Coursework.is_active == True,
        Coursework.is_highlighted == True
    ).order_by(Coursework.order.asc()).all()


def get_coursework_by_id(db: Session, course_id: int) -> Coursework | None:
    """Get a coursework entry by ID."""
    return db.query(Coursework).filter(Coursework.id == course_id).first()


def create_coursework(db: Session, course_data: CourseworkCreate) -> Coursework:
    """Create a new coursework entry."""
    course = Coursework(**course_data.model_dump())
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


def update_coursework(
    db: Session, 
    course_id: int, 
    course_data: CourseworkUpdate
) -> Coursework | None:
    """Update a coursework entry."""
    course = get_coursework_by_id(db, course_id)
    if not course:
        return None
    
    update_data = course_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(course, field, value)
    
    db.commit()
    db.refresh(course)
    return course


def delete_coursework(db: Session, course_id: int) -> bool:
    """Delete a coursework entry."""
    course = get_coursework_by_id(db, course_id)
    if not course:
        return False
    
    db.delete(course)
    db.commit()
    return True
