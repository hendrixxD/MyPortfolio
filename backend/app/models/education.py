"""
Education model for academic history.
"""
from sqlalchemy import Column, Integer, String, Text, Date, Boolean

from app.models.base import Base, TimestampMixin


class Education(Base, TimestampMixin):
    """Education/academic history model."""
    __tablename__ = "education"
    
    id = Column(Integer, primary_key=True, index=True)
    school = Column(String(255), nullable=False)
    program = Column(String(255), nullable=False)  # e.g., "BSc Chemical Engineering"
    degree = Column(String(100), nullable=True)  # e.g., "Bachelor of Science"
    department = Column(String(255), nullable=True)
    location = Column(String(255), nullable=True)
    
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    is_current = Column(Boolean, default=False)
    
    description = Column(Text, nullable=True)
    achievements = Column(Text, nullable=True)  # JSON or comma-separated
    gpa = Column(String(20), nullable=True)
    
    order = Column(Integer, default=0)
    is_visible = Column(Boolean, default=True)
