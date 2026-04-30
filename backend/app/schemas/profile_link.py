"""
ProfileLink schemas.
"""
from pydantic import BaseModel, HttpUrl
from datetime import datetime


class ProfileLinkBase(BaseModel):
    """Base profile link schema."""
    platform: str
    url: str
    icon: str | None = None
    order: int = 0
    is_visible: bool = True
    username: str | None = None
    description: str | None = None


class ProfileLinkCreate(ProfileLinkBase):
    """Schema for creating a profile link."""
    pass


class ProfileLinkUpdate(BaseModel):
    """Schema for updating a profile link."""
    platform: str | None = None
    url: str | None = None
    icon: str | None = None
    order: int | None = None
    is_visible: bool | None = None
    username: str | None = None
    description: str | None = None


class ProfileLinkResponse(ProfileLinkBase):
    """Profile link response schema."""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
