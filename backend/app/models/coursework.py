"""
Coursework model for academic courses.
"""
from sqlalchemy import Column, Integer, String, Text, Boolean

from app.models.base import Base, TimestampMixin


class Coursework(Base, TimestampMixin):
    """Model for academic coursework/courses taken in school."""
    
    __tablename__ = "coursework"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Basic info
    course_code = Column(String(50), nullable=True)
    course_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # Academic details
    institution = Column(String(255), nullable=False)
    department = Column(String(255), nullable=True)
    semester = Column(String(50), nullable=True)  # e.g., "Fall 2023", "Spring 2024"
    year = Column(Integer, nullable=True)
    credits = Column(Integer, nullable=True)
    grade = Column(String(10), nullable=True)  # e.g., "A", "B+", "Pass"
    
    # Category for grouping courses
    category = Column(String(100), nullable=True)  # e.g., "Core Courses", "Electives", "Laboratory"
    
    # Additional info
    instructor = Column(String(255), nullable=True)
    topics_covered = Column(Text, nullable=True)  # JSON array of topics or comma-separated
    skills_gained = Column(Text, nullable=True)  # JSON array of skills or comma-separated
    
    # Links and resources
    syllabus_url = Column(String(500), nullable=True)
    certificate_url = Column(String(500), nullable=True)
    
    # Status
    is_highlighted = Column(Boolean, default=False)  # For featuring important courses
    order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    
    def __repr__(self):
        return f"<Coursework {self.course_code}: {self.course_name}>"
