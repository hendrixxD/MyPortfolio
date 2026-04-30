"""
Tag schemas.
"""
from pydantic import BaseModel
from datetime import datetime


class TagBase(BaseModel):
    """Base tag schema."""
    name: str
    slug: str | None = None
    tag_type: str = "both"
    color: str = "#6366f1"


class TagCreate(TagBase):
    """Schema for creating a tag."""
    pass


class TagUpdate(BaseModel):
    """Schema for updating a tag."""
    name: str | None = None
    slug: str | None = None
    tag_type: str | None = None
    color: str | None = None


class TagResponse(TagBase):
    """Tag response schema."""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class TagBrief(BaseModel):
    """Brief tag schema for nested responses."""
    id: int
    name: str
    slug: str
    color: str
    
    class Config:
        from_attributes = True
