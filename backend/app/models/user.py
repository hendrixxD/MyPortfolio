"""
User model for admin authentication.
"""
from sqlalchemy import Column, Integer, String, Boolean
from app.models.base import Base, TimestampMixin


class User(Base, TimestampMixin):
    """Admin user model."""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
