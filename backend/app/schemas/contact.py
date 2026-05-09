"""
Contact schemas.
"""
from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import datetime
import re


class ContactBase(BaseModel):
    """Base contact message schema with input validation."""
    name: str = Field(..., min_length=1, max_length=100, description="Name of the contact")
    email: EmailStr = Field(..., description="Email address")
    subject: str | None = Field(None, max_length=200, description="Subject line")
    message: str = Field(..., min_length=10, max_length=5000, description="Message content")

    @field_validator('name', 'subject', 'message')
    @classmethod
    def sanitize_text(cls, v: str | None) -> str | None:
        """Remove dangerous characters and validate text input"""
        if v is None:
            return v

        # Strip HTML tags using regex
        v = re.sub(r'<[^>]+>', '', v)

        # Remove potentially dangerous characters
        v = re.sub(r'[<>"\']', '', v)

        # Normalize whitespace
        v = re.sub(r'\s+', ' ', v).strip()

        return v

    @field_validator('email')
    @classmethod
    def validate_email(cls, v: str) -> str:
        """Additional email validation"""
        # Pydantic EmailStr already validates format
        # Additional check for common spam patterns
        if '+' in v.split('@')[0] and len(v.split('@')[0]) > 30:
            raise ValueError('Invalid email address')
        return v.lower().strip()


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
