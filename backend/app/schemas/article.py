"""
Article schemas.
"""
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

from app.schemas.tag import TagBrief


class ArticleBase(BaseModel):
    """Base article schema."""
    title: str
    slug: str | None = None
    summary: str | None = None
    content_md: str
    cover_image: str | None = None
    status: str = "draft"
    reading_time: int = 5
    featured: bool = False
    meta_title: str | None = None
    meta_description: str | None = None


class ArticleCreate(ArticleBase):
    """Schema for creating an article."""
    tag_ids: List[int] = []


class ArticleUpdate(BaseModel):
    """Schema for updating an article."""
    title: str | None = None
    slug: str | None = None
    summary: str | None = None
    content_md: str | None = None
    cover_image: str | None = None
    status: str | None = None
    reading_time: int | None = None
    featured: bool | None = None
    meta_title: str | None = None
    meta_description: str | None = None
    tag_ids: List[int] | None = None


class ArticleResponse(ArticleBase):
    """Article response schema."""
    id: int
    published_at: datetime | None
    view_count: int
    created_at: datetime
    updated_at: datetime
    tags: List[TagBrief] = []
    
    class Config:
        from_attributes = True


class ArticleBrief(BaseModel):
    """Brief article schema for list views."""
    id: int
    title: str
    slug: str
    summary: str | None
    cover_image: str | None
    status: str
    published_at: datetime | None
    reading_time: int
    featured: bool
    tags: List[TagBrief] = []
    
    class Config:
        from_attributes = True


class ArticleListResponse(BaseModel):
    """Paginated article list response."""
    items: List[ArticleBrief]
    total: int
    page: int
    page_size: int
    pages: int
