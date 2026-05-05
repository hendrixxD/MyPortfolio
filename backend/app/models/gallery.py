"""
Gallery models.
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Table, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.models.base import Base


class GalleryStatus(str, enum.Enum):
    """Gallery item status."""
    DRAFT = "draft"
    PUBLISHED = "published"

# Association table for gallery items and tags
gallery_item_tags = Table(
    'gallery_item_tags',
    Base.metadata,
    Column('gallery_item_id', Integer, ForeignKey('gallery_items.id', ondelete='CASCADE'), primary_key=True),
    Column('gallery_tag_id', Integer, ForeignKey('gallery_tags.id', ondelete='CASCADE'), primary_key=True)
)


class GalleryTag(Base):
    """Gallery tag model."""
    __tablename__ = 'gallery_tags'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    slug = Column(String(60), unique=True, nullable=False, index=True)
    color = Column(String(7), nullable=True)  # hex color
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    gallery_items = relationship('GalleryItem', secondary=gallery_item_tags, back_populates='tags')


class GalleryItem(Base):
    """Gallery item model."""
    __tablename__ = 'gallery_items'

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), unique=True, nullable=False, index=True)
    url = Column(String(255), nullable=False)
    caption = Column(String(200), nullable=True)
    description = Column(Text, nullable=True)
    alt_text = Column(String(200), nullable=True)
    size = Column(Integer, nullable=False)
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    status = Column(Enum(GalleryStatus), default=GalleryStatus.DRAFT, nullable=False, index=True)
    is_featured = Column(Boolean, default=False, nullable=False)
    order = Column(Integer, default=0, nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    published_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    tags = relationship('GalleryTag', secondary=gallery_item_tags, back_populates='gallery_items')
