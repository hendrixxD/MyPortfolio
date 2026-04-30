"""
Contact model for storing contact form submissions.
"""
from sqlalchemy import Column, Integer, String, Text, Boolean

from app.models.base import Base, TimestampMixin


class ContactMessage(Base, TimestampMixin):
    """Contact form submission model."""
    __tablename__ = "contact_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    subject = Column(String(500), nullable=True)
    message = Column(Text, nullable=False)
    
    # Status
    is_read = Column(Boolean, default=False)
    is_replied = Column(Boolean, default=False)
    is_spam = Column(Boolean, default=False)
    
    # Metadata
    ip_address = Column(String(45), nullable=True)  # IPv6 max length
    user_agent = Column(String(500), nullable=True)
