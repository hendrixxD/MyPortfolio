"""
Contact schemas.
"""
from pydantic import BaseModel, EmailStr
from datetime import datetime


class ContactBase(BaseModel):
    """Base contact message schema."""
    name: str
    email: EmailStr
    subject: str | None = None
    message: str


class ContactCreate(ContactBase):
    """Schema for creating a contact message."""
    pass


class ContactUpdate(BaseModel):
    """Schema for updating a contact message."""
    is_read: bool | None = None
    is_replied: bool | None = None
    is_spam: bool | None = None


class ContactResponse(ContactBase):
    """Contact message response schema."""
    id: int
    is_read: bool
    is_replied: bool
    is_spam: bool
    ip_address: str | None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class ContactListResponse(BaseModel):
    """Paginated contact list response."""
    items: list[ContactResponse]
    total: int
    page: int
    page_size: int
    pages: int
