"""
Project schemas.
"""
from pydantic import BaseModel
from datetime import datetime
from typing import List

from app.schemas.tag import TagBrief


class ProjectBase(BaseModel):
    """Base project schema."""
    title: str
    slug: str | None = None
    summary: str | None = None
    description_md: str | None = None
    cover_image: str | None = None
    screenshots: List[str] = []
    repo_url: str | None = None
    live_url: str | None = None
    tech_tags: List[str] = []
    status: str = "draft"
    featured: bool = False
    order: int = 0
    category: str | None = None
    meta_title: str | None = None
    meta_description: str | None = None


class ProjectCreate(ProjectBase):
    """Schema for creating a project."""
    tag_ids: List[int] = []


class ProjectUpdate(BaseModel):
    """Schema for updating a project."""
    title: str | None = None
    slug: str | None = None
    summary: str | None = None
    description_md: str | None = None
    cover_image: str | None = None
    screenshots: List[str] | None = None
    repo_url: str | None = None
    live_url: str | None = None
    tech_tags: List[str] | None = None
    status: str | None = None
    featured: bool | None = None
    order: int | None = None
    category: str | None = None
    meta_title: str | None = None
    meta_description: str | None = None
    tag_ids: List[int] | None = None


class ProjectResponse(ProjectBase):
    """Project response schema."""
    id: int
    created_at: datetime
    updated_at: datetime
    tags: List[TagBrief] = []
    
    class Config:
        from_attributes = True


class ProjectBrief(BaseModel):
    """Brief project schema for list views."""
    id: int
    title: str
    slug: str
    summary: str | None
    cover_image: str | None
    tech_tags: List[str]
    status: str
    featured: bool
    category: str | None
    repo_url: str | None
    live_url: str | None
    tags: List[TagBrief] = []
    
    class Config:
        from_attributes = True


class ProjectListResponse(BaseModel):
    """Paginated project list response."""
    items: List[ProjectBrief]
    total: int
    page: int
    page_size: int
    pages: int
