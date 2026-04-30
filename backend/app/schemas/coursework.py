"""
Coursework schemas for academic courses.
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class CourseworkBase(BaseModel):
    """Base coursework schema."""
    course_code: Optional[str] = None
    course_name: str
    description: Optional[str] = None
    institution: str
    department: Optional[str] = None
    semester: Optional[str] = None
    year: Optional[int] = None
    credits: Optional[int] = None
    grade: Optional[str] = None
    category: Optional[str] = None
    instructor: Optional[str] = None
    topics_covered: Optional[str] = None
    skills_gained: Optional[str] = None
    syllabus_url: Optional[str] = None
    certificate_url: Optional[str] = None
    is_highlighted: bool = False
    display_order: int = 0
    is_active: bool = True


class CourseworkCreate(CourseworkBase):
    """Schema for creating a coursework entry."""
    pass


class CourseworkUpdate(BaseModel):
    """Schema for updating a coursework entry."""
    course_code: Optional[str] = None
    course_name: Optional[str] = None
    description: Optional[str] = None
    institution: Optional[str] = None
    department: Optional[str] = None
    semester: Optional[str] = None
    year: Optional[int] = None
    credits: Optional[int] = None
    grade: Optional[str] = None
    category: Optional[str] = None
    instructor: Optional[str] = None
    topics_covered: Optional[str] = None
    skills_gained: Optional[str] = None
    syllabus_url: Optional[str] = None
    certificate_url: Optional[str] = None
    is_highlighted: Optional[bool] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None


class CourseworkResponse(CourseworkBase):
    """Coursework response schema."""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class CourseworkGrouped(BaseModel):
    """Coursework grouped by category."""
    category: str
    courses: List[CourseworkResponse]
