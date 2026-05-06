"""
Visitor tracking schemas.
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class VisitorLogBase(BaseModel):
    """Base visitor log schema."""
    ip_address: Optional[str] = None
    country: Optional[str] = None
    country_code: Optional[str] = None
    region: Optional[str] = None
    city: Optional[str] = None
    latitude: Optional[str] = None
    longitude: Optional[str] = None
    timezone: Optional[str] = None
    isp: Optional[str] = None
    path: Optional[str] = None
    method: Optional[str] = None
    user_agent: Optional[str] = None
    referer: Optional[str] = None
    is_bot: bool = False


class VisitorLogCreate(VisitorLogBase):
    """Schema for creating a visitor log."""
    pass


class VisitorLog(VisitorLogBase):
    """Schema for visitor log response."""
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class VisitorStats(BaseModel):
    """Aggregated visitor statistics."""
    total_visits: int
    unique_ips: int
    bot_visits: int
    human_visits: int
    top_countries: list[dict]
    top_cities: list[dict]
    top_pages: list[dict]
    recent_visits: list[VisitorLog]


class CountryStats(BaseModel):
    """Country-level statistics."""
    country: str
    country_code: Optional[str]
    visit_count: int
    unique_ips: int


class PageStats(BaseModel):
    """Page-level statistics."""
    path: str
    visit_count: int
    unique_ips: int
