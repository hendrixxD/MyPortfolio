"""
Tag model for categorizing articles and projects.
"""
from sqlalchemy import Column, Integer, String, Enum
from sqlalchemy.orm import relationship
import enum

from app.models.base import Base, TimestampMixin


class TagType(str, enum.Enum):
    """Type of content the tag applies to."""
    ARTICLE = "article"
    PROJECT = "project"
    BOTH = "both"


class Tag(Base, TimestampMixin):
    """Tag model for categorization."""
    __tablename__ = "tags"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    tag_type = Column(String(20), default=TagType.BOTH.value)
    color = Column(String(7), default="#6366f1")  # Hex color
    
    # Relationships
    articles = relationship("Article", secondary="article_tags", back_populates="tags")
    projects = relationship("Project", secondary="project_tags", back_populates="tags")
