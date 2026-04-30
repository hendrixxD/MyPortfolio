"""
ProfileLink model for external social/professional links.
"""
from sqlalchemy import Column, Integer, String, Boolean

from app.models.base import Base, TimestampMixin


class ProfileLink(Base, TimestampMixin):
    """External profile/social link model."""
    __tablename__ = "profile_links"
    
    id = Column(Integer, primary_key=True, index=True)
    platform = Column(String(100), nullable=False)  # e.g., "GitHub", "LinkedIn", "X"
    url = Column(String(500), nullable=False)
    icon = Column(String(100), nullable=True)  # Icon name or class
    order = Column(Integer, default=0)
    is_visible = Column(Boolean, default=True)
    
    # Additional display info
    username = Column(String(100), nullable=True)
    description = Column(String(255), nullable=True)

