"""
Authentication schemas.
"""
from pydantic import BaseModel, EmailStr


class Token(BaseModel):
    """JWT token response."""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Data extracted from JWT token."""
    email: str | None = None


class LoginRequest(BaseModel):
    """Login request schema."""
    email: EmailStr
    password: str


class UserBase(BaseModel):
    """Base user schema."""
    email: EmailStr
    full_name: str | None = None


class UserCreate(UserBase):
    """Schema for creating a user."""
    password: str


class UserUpdate(BaseModel):
    """Schema for updating a user."""
    email: EmailStr | None = None
    full_name: str | None = None
    password: str | None = None
    is_active: bool | None = None


class UserResponse(UserBase):
    """User response schema."""
    id: int
    is_active: bool
    is_superuser: bool
    
    class Config:
        from_attributes = True
