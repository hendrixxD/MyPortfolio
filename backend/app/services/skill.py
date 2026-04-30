"""
Skill service.
"""
from sqlalchemy.orm import Session
from typing import List, Dict

from app.models.skill import Skill
from app.schemas.skill import SkillCreate, SkillUpdate


def get_skills(
    db: Session,
    visible_only: bool = False,
    category: str | None = None,
    learning_only: bool = False
) -> List[Skill]:
    """Get all skills with optional filters."""
    query = db.query(Skill)
    
    if visible_only:
        query = query.filter(Skill.is_visible == True)
    
    if category:
        query = query.filter(Skill.category == category)
    
    if learning_only:
        query = query.filter(Skill.is_learning == True)
    
    return query.order_by(Skill.category, Skill.order.asc()).all()


def get_skills_by_category(db: Session, visible_only: bool = True) -> Dict[str, List[Skill]]:
    """Get skills grouped by category."""
    skills = get_skills(db, visible_only=visible_only)
    
    grouped: Dict[str, List[Skill]] = {}
    for skill in skills:
        if skill.category not in grouped:
            grouped[skill.category] = []
        grouped[skill.category].append(skill)
    
    return grouped


def get_skill_by_id(db: Session, skill_id: int) -> Skill | None:
    """Get a skill by ID."""
    return db.query(Skill).filter(Skill.id == skill_id).first()


def create_skill(db: Session, skill_data: SkillCreate) -> Skill:
    """Create a new skill."""
    skill = Skill(**skill_data.model_dump())
    db.add(skill)
    db.commit()
    db.refresh(skill)
    return skill


def update_skill(db: Session, skill_id: int, skill_data: SkillUpdate) -> Skill | None:
    """Update a skill."""
    skill = get_skill_by_id(db, skill_id)
    if not skill:
        return None
    
    update_data = skill_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(skill, field, value)
    
    db.commit()
    db.refresh(skill)
    return skill


def delete_skill(db: Session, skill_id: int) -> bool:
    """Delete a skill."""
    skill = get_skill_by_id(db, skill_id)
    if not skill:
        return False
    
    db.delete(skill)
    db.commit()
    return True


def get_categories(db: Session) -> List[str]:
    """Get all unique skill categories."""
    results = (
        db.query(Skill.category)
        .distinct()
        .order_by(Skill.category)
        .all()
    )
    return [r[0] for r in results]
