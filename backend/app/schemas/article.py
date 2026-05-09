"""
Article schemas.
"""
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import List, Optional
import re

from app.schemas.tag import TagBrief


class ArticleBase(BaseModel):
    """Base article schema with input validation."""
    title: str = Field(..., min_length=1, max_length=200)
    slug: str | None = Field(None, max_length=200)
    summary: str | None = Field(None, max_length=500)
    content_md: str = Field(..., min_length=1, max_length=100000)
    cover_image: str | None = Field(None, max_length=500)
    status: str = Field(default="draft", pattern="^(draft|published|archived)$")
    reading_time: int = Field(default=5, ge=1, le=300)
    featured: bool = False
    meta_title: str | None = Field(None, max_length=200)
    meta_description: str | None = Field(None, max_length=500)

    @field_validator('title', 'summary', 'meta_title', 'meta_description')
    @classmethod
    def sanitize_text(cls, v: str | None) -> str | None:
        """Sanitize text fields to prevent XSS"""
        if v is None:
            return v

        # Remove HTML tags
        v = re.sub(r'<[^>]+>', '', v)

        # Remove dangerous characters
        v = re.sub(r'[<>]', '', v)

        # Normalize whitespace
        v = re.sub(r'\s+', ' ', v).strip()

        return v

    @field_validator('slug')
    @classmethod
    def validate_slug(cls, v: str | None) -> str | None:
        """Validate slug format"""
        if v is None:
            return v

        # Slugs should only contain alphanumeric, hyphens, underscores
        if not re.match(r'^[a-z0-9-_]+$', v):
            raise ValueError('Slug must contain only lowercase letters, numbers, hyphens, and underscores')

        return v

    @field_validator('cover_image')
    @classmethod
    def validate_image_url(cls, v: str | None) -> str | None:
        """Validate image URL"""
        if v is None:
            return v

        # Block dangerous protocols
        if re.match(r'^(javascript|data|vbscript):', v, re.I):
            raise ValueError('Invalid image URL protocol')

        return v


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
