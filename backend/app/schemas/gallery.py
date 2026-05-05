"""
Gallery schemas.
"""
from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field


# ===== Gallery Tag Schemas =====

class GalleryTagBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)
    slug: Optional[str] = Field(None, max_length=60)
    color: Optional[str] = Field(None, pattern=r'^#[0-9A-Fa-f]{6}$')


class GalleryTagCreate(GalleryTagBase):
    pass


class GalleryTagUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    slug: Optional[str] = Field(None, max_length=60)
    color: Optional[str] = Field(None, pattern=r'^#[0-9A-Fa-f]{6}$')


class GalleryTag(GalleryTagBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ===== Gallery Item Schemas =====

class GalleryItemBase(BaseModel):
    caption: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    alt_text: Optional[str] = Field(None, max_length=200)
    status: Literal['draft', 'published'] = 'draft'
    is_featured: bool = False
    order: int = 0


class GalleryItemCreate(GalleryItemBase):
    filename: str
    url: str
    size: int
    width: Optional[int] = None
    height: Optional[int] = None
    tag_ids: list[int] = []


class GalleryItemUpdate(BaseModel):
    caption: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    alt_text: Optional[str] = Field(None, max_length=200)
    status: Optional[Literal['draft', 'published']] = None
    is_featured: Optional[bool] = None
    order: Optional[int] = None
    tag_ids: Optional[list[int]] = None


class GalleryItem(GalleryItemBase):
    id: int
    filename: str
    url: str
    size: int
    width: Optional[int]
    height: Optional[int]
    uploaded_at: datetime
    updated_at: Optional[datetime]
    published_at: Optional[datetime]
    tags: list[GalleryTag] = []

    class Config:
        from_attributes = True


class GalleryItemBrief(BaseModel):
    """Brief gallery item for list views."""
    id: int
    filename: str
    url: str
    caption: Optional[str]
    size: int
    width: Optional[int]
    height: Optional[int]
    status: Literal['draft', 'published']
    is_featured: bool
    uploaded_at: datetime
    published_at: Optional[datetime]
    tags: list[GalleryTag] = []

    class Config:
        from_attributes = True


# ===== Upload Response =====

class GalleryUploadResponse(BaseModel):
    """Response after uploading an image."""
    id: int
    filename: str
    url: str
    size: int
    width: Optional[int]
    height: Optional[int]
