"""
Experience schemas.
"""
from pydantic import BaseModel
from datetime import datetime, date
from typing import List


class ExperienceBase(BaseModel):
    """Base experience schema."""
    role: str
    organization: str
    org_url: str | None = None
    location: str | None = None
    employment_type: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    is_current: bool = False
    description: str | None = None
    bullets: List[str] = []
    technologies: List[str] = []
    order: int = 0
    is_visible: bool = True
    category: str | None = None


class ExperienceCreate(ExperienceBase):
    """Schema for creating an experience entry."""
    pass


class ExperienceUpdate(BaseModel):
    """Schema for updating an experience entry."""
    role: str | None = None
    organization: str | None = None
    org_url: str | None = None
    location: str | None = None
    employment_type: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    is_current: bool | None = None
    description: str | None = None
    bullets: List[str] | None = None
    technologies: List[str] | None = None
    order: int | None = None
    is_visible: bool | None = None
    category: str | None = None


class ExperienceResponse(ExperienceBase):
    """Experience response schema."""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
