"""
Skill model for technical abilities.
"""
from sqlalchemy import Column, Integer, String, Boolean

from app.models.base import Base, TimestampMixin


class Skill(Base, TimestampMixin):
    """Technical skill model."""
    __tablename__ = "skills"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    category = Column(String(100), nullable=False)  # e.g., "Languages", "Databases", "Tools"
    level = Column(String(20), nullable=True)  # e.g., "Beginner", "Intermediate", "Advanced", "Expert"
    level_percent = Column(Integer, nullable=True)  # 0-100
    
    icon = Column(String(100), nullable=True)  # Icon name or URL
    years_experience = Column(Integer, nullable=True)
    
    order = Column(Integer, default=0)
    is_visible = Column(Boolean, default=True)
    is_learning = Column(Boolean, default=False)  # For "What I'm Learning" section
