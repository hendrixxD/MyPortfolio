"""
Visitor tracking models.
"""
from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean
from sqlalchemy.sql import func
from app.models.base import Base


class VisitorLog(Base):
    """Track visitor analytics by region."""
    __tablename__ = "visitor_logs"

    id = Column(Integer, primary_key=True, index=True)

    # Geographic data
    ip_address = Column(String(45), nullable=True, index=True)  # Supports IPv6
    country = Column(String(100), nullable=True, index=True)
    country_code = Column(String(2), nullable=True, index=True)
    region = Column(String(100), nullable=True, index=True)
    city = Column(String(100), nullable=True)
    latitude = Column(String(20), nullable=True)
    longitude = Column(String(20), nullable=True)
    timezone = Column(String(50), nullable=True)
    isp = Column(String(200), nullable=True)

    # Request data
    path = Column(String(500), nullable=True, index=True)
    method = Column(String(10), nullable=True)
    user_agent = Column(Text, nullable=True)
    referer = Column(Text, nullable=True)

    # Metadata
    is_bot = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    def __repr__(self):
        return f"<VisitorLog {self.country} - {self.city} - {self.path}>"
