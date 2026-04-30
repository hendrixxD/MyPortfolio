"""
Education schemas.
"""
from pydantic import BaseModel
from datetime import datetime, date


class EducationBase(BaseModel):
    """Base education schema."""
    school: str
    program: str
    degree: str | None = None
    department: str | None = None
    location: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    is_current: bool = False
    description: str | None = None
    achievements: str | None = None
    gpa: str | None = None
    order: int = 0
    is_visible: bool = True


class EducationCreate(EducationBase):
    """Schema for creating an education entry."""
    pass


class EducationUpdate(BaseModel):
    """Schema for updating an education entry."""
    school: str | None = None
    program: str | None = None
    degree: str | None = None
    department: str | None = None
    location: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    is_current: bool | None = None
    description: str | None = None
    achievements: str | None = None
    gpa: str | None = None
    order: int | None = None
    is_visible: bool | None = None


class EducationResponse(EducationBase):
    """Education response schema."""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
