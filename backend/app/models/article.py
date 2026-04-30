"""
Article model for blog posts.
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Table, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.models.base import Base, TimestampMixin


class ArticleStatus(str, enum.Enum):
    """Article publication status."""
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"


# Association table for article-tag relationship
article_tags = Table(
    "article_tags",
    Base.metadata,
    Column("article_id", Integer, ForeignKey("articles.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)


class Article(Base, TimestampMixin):
    """Blog article model."""
    __tablename__ = "articles"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    summary = Column(Text, nullable=True)
    content_md = Column(Text, nullable=False)
    cover_image = Column(String(500), nullable=True)
    status = Column(String(20), default=ArticleStatus.DRAFT.value)
    published_at = Column(DateTime, nullable=True)
    reading_time = Column(Integer, default=5)  # in minutes
    featured = Column(Boolean, default=False)
    view_count = Column(Integer, default=0)
    
    # SEO fields
    meta_title = Column(String(255), nullable=True)
    meta_description = Column(Text, nullable=True)
    
    # Relationships
    tags = relationship("Tag", secondary=article_tags, back_populates="articles")
    
    def publish(self):
        """Publish the article."""
        self.status = ArticleStatus.PUBLISHED.value
        self.published_at = datetime.utcnow()
    
    def unpublish(self):
        """Unpublish the article."""
        self.status = ArticleStatus.DRAFT.value
        self.published_at = None
