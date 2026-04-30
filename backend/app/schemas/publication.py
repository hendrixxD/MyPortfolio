"""
Publication schemas.
"""
from pydantic import BaseModel
from datetime import datetime
from typing import List


class PublicationBase(BaseModel):
    """Base publication schema."""
    title: str
    authors: List[str] = []
    venue: str | None = None
    year: int | None = None
    abstract: str | None = None
    url: str | None = None
    doi: str | None = None
    pdf_url: str | None = None
    publication_type: str | None = None
    order: int = 0
    is_visible: bool = True


class PublicationCreate(PublicationBase):
    """Schema for creating a publication."""
    pass


class PublicationUpdate(BaseModel):
    """Schema for updating a publication."""
    title: str | None = None
    authors: List[str] | None = None
    venue: str | None = None
    year: int | None = None
    abstract: str | None = None
    url: str | None = None
    doi: str | None = None
    pdf_url: str | None = None
    publication_type: str | None = None
    order: int | None = None
    is_visible: bool | None = None


class PublicationResponse(PublicationBase):
    """Publication response schema."""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
