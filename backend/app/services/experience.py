"""
Experience service.
"""
from sqlalchemy.orm import Session
from typing import List

from app.models.experience import Experience
from app.schemas.experience import ExperienceCreate, ExperienceUpdate


def get_experiences(
    db: Session,
    visible_only: bool = False,
    category: str | None = None
) -> List[Experience]:
    """Get all experience entries."""
    query = db.query(Experience)
    
    if visible_only:
        query = query.filter(Experience.is_visible == True)
    
    if category:
        query = query.filter(Experience.category == category)
    
    return query.order_by(Experience.order.asc(), Experience.start_date.desc()).all()


def get_experience_by_id(db: Session, exp_id: int) -> Experience | None:
    """Get an experience entry by ID."""
    return db.query(Experience).filter(Experience.id == exp_id).first()


def create_experience(db: Session, exp_data: ExperienceCreate) -> Experience:
    """Create a new experience entry."""
    exp = Experience(**exp_data.model_dump())
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp


def update_experience(db: Session, exp_id: int, exp_data: ExperienceUpdate) -> Experience | None:
    """Update an experience entry."""
    exp = get_experience_by_id(db, exp_id)
    if not exp:
        return None
    
    update_data = exp_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(exp, field, value)
    
    db.commit()
    db.refresh(exp)
    return exp


def delete_experience(db: Session, exp_id: int) -> bool:
    """Delete an experience entry."""
    exp = get_experience_by_id(db, exp_id)
    if not exp:
        return False
    
    db.delete(exp)
    db.commit()
    return True
