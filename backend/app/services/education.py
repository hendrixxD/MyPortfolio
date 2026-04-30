"""
Education service.
"""
from sqlalchemy.orm import Session
from typing import List

from app.models.education import Education
from app.schemas.education import EducationCreate, EducationUpdate


def get_education_list(db: Session, visible_only: bool = False) -> List[Education]:
    """Get all education entries."""
    query = db.query(Education)
    
    if visible_only:
        query = query.filter(Education.is_visible == True)
    
    return query.order_by(Education.order.asc(), Education.start_date.desc()).all()


def get_education_by_id(db: Session, edu_id: int) -> Education | None:
    """Get an education entry by ID."""
    return db.query(Education).filter(Education.id == edu_id).first()


def create_education(db: Session, edu_data: EducationCreate) -> Education:
    """Create a new education entry."""
    edu = Education(**edu_data.model_dump())
    db.add(edu)
    db.commit()
    db.refresh(edu)
    return edu


def update_education(db: Session, edu_id: int, edu_data: EducationUpdate) -> Education | None:
    """Update an education entry."""
    edu = get_education_by_id(db, edu_id)
    if not edu:
        return None
    
    update_data = edu_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(edu, field, value)
    
    db.commit()
    db.refresh(edu)
    return edu


def delete_education(db: Session, edu_id: int) -> bool:
    """Delete an education entry."""
    edu = get_education_by_id(db, edu_id)
    if not edu:
        return False
    
    db.delete(edu)
    db.commit()
    return True
