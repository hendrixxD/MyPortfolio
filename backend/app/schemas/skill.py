"""
Skill schemas.
"""
from pydantic import BaseModel
from datetime import datetime


class SkillBase(BaseModel):
    """Base skill schema."""
    name: str
    category: str
    level: str | None = None
    level_percent: int | None = None
    icon: str | None = None
    years_experience: int | None = None
    order: int = 0
    is_visible: bool = True
    is_learning: bool = False


class SkillCreate(SkillBase):
    """Schema for creating a skill."""
    pass


class SkillUpdate(BaseModel):
    """Schema for updating a skill."""
    name: str | None = None
    category: str | None = None
    level: str | None = None
    level_percent: int | None = None
    icon: str | None = None
    years_experience: int | None = None
    order: int | None = None
    is_visible: bool | None = None
    is_learning: bool | None = None


class SkillResponse(SkillBase):
    """Skill response schema."""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class SkillsByCategory(BaseModel):
    """Skills grouped by category."""
    category: str
    skills: list[SkillResponse]
