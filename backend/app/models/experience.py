"""
Experience model for work/professional history.
"""
from sqlalchemy import Column, Integer, String, Text, Date, Boolean, JSON

from app.models.base import Base, TimestampMixin


class Experience(Base, TimestampMixin):
    """Work/professional experience model."""
    __tablename__ = "experiences"
    
    id = Column(Integer, primary_key=True, index=True)
    role = Column(String(255), nullable=False)  # Job title
    organization = Column(String(255), nullable=False)
    org_url = Column(String(500), nullable=True)
    location = Column(String(255), nullable=True)
    employment_type = Column(String(50), nullable=True)  # Full-time, Part-time, Contract, etc.
    
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    is_current = Column(Boolean, default=False)
    
    description = Column(Text, nullable=True)
    bullets = Column(JSON, default=list)  # List of achievement bullets
    technologies = Column(JSON, default=list)  # List of technologies used
    
    order = Column(Integer, default=0)
    is_visible = Column(Boolean, default=True)
    
    # Category for filtering
    category = Column(String(50), nullable=True)  # "tech", "academia", "other"
