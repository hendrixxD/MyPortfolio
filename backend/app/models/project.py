"""
Project model for portfolio projects.
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, Table, ForeignKey, JSON
from sqlalchemy.orm import relationship
import enum

from app.models.base import Base, TimestampMixin


class ProjectStatus(str, enum.Enum):
    """Project publication status."""
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


# Association table for project-tag relationship
project_tags = Table(
    "project_tags",
    Base.metadata,
    Column("project_id", Integer, ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)


class Project(Base, TimestampMixin):
    """Portfolio project model."""
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    summary = Column(Text, nullable=True)
    description_md = Column(Text, nullable=True)
    cover_image = Column(String(500), nullable=True)
    screenshots = Column(JSON, default=list)  # List of image URLs
    
    # Links
    repo_url = Column(String(500), nullable=True)
    live_url = Column(String(500), nullable=True)
    
    # Tech stack
    tech_tags = Column(JSON, default=list)  # List of technology names
    
    # Status and display
    status = Column(String(20), default=ProjectStatus.DRAFT.value)
    featured = Column(Boolean, default=False)
    order = Column(Integer, default=0)
    
    # Category
    category = Column(String(100), nullable=True)  # e.g., "data-engineering", "web-app"
    
    # SEO fields
    meta_title = Column(String(255), nullable=True)
    meta_description = Column(Text, nullable=True)
    
    # Relationships
    tags = relationship("Tag", secondary=project_tags, back_populates="projects")
