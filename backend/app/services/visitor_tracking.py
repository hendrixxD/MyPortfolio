"""
Visitor tracking service.
"""
import logging
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import Request

from app.models.visitor import VisitorLog
from app.services.geolocation import geolocation_service

logger = logging.getLogger(__name__)


# Common bot user agents to exclude from tracking
BOT_KEYWORDS = [
    "bot", "crawler", "spider", "scraper", "headless", "phantom",
    "curl", "wget", "python-requests", "go-http-client", "java/",
    "lighthouse", "gtmetrix", "pingdom", "uptimerobot"
]


class VisitorTrackingService:
    """Service for tracking visitor analytics."""

    @staticmethod
    def get_client_ip(request: Request) -> str:
        """
        Extract real client IP from request headers.

        Handles various proxy headers in order of precedence.
        """
        # Check X-Forwarded-For (most common with proxies)
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            # Take the first IP in the chain (original client)
            return forwarded.split(",")[0].strip()

        # Check X-Real-IP (used by some proxies)
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip.strip()

        # Fall back to direct client IP
        return request.client.host if request.client else "unknown"

    @staticmethod
    def is_bot(user_agent: Optional[str]) -> bool:
        """Check if user agent appears to be a bot."""
        if not user_agent:
            return False

        user_agent_lower = user_agent.lower()
        return any(keyword in user_agent_lower for keyword in BOT_KEYWORDS)

    @staticmethod
    def should_track_path(path: str) -> bool:
        """Determine if this path should be tracked."""
        # Allow tracking endpoint itself
        if path.startswith("/api/v1/tracking"):
            return True

        # Don't track other API calls, admin panel, or static assets
        exclude_prefixes = [
            "/api/",
            "/admin/",
            "/admin-login",
            "/_next/",
            "/static/",
            "/uploads/",
            "/favicon.ico",
            "/robots.txt",
            "/sitemap.xml"
        ]

        return not any(path.startswith(prefix) for prefix in exclude_prefixes)

    @staticmethod
    async def track_visitor_with_path(request: Request, path: str, db: Session) -> Optional[VisitorLog]:
        """
        Track a visitor with a custom path (for client-side tracking).

        Args:
            request: The HTTP request
            path: The actual page path being viewed
            db: Database session
        """
        try:
            method = request.method
            user_agent = request.headers.get("User-Agent", "")
            referer = request.headers.get("Referer", "")

            # Don't filter by path for client-side tracking
            # (the path is already validated on the client)

            # Check if it's a bot
            is_bot = VisitorTrackingService.is_bot(user_agent)

            # Get client IP
            ip_address = VisitorTrackingService.get_client_ip(request)

            # Get geolocation data
            geo_data = geolocation_service.get_location(ip_address)

            # Create visitor log
            visitor_log = VisitorLog(
                ip_address=ip_address if ip_address != "unknown" else None,
                country=geo_data.get("country") if geo_data else None,
                country_code=geo_data.get("countryCode") if geo_data else None,
                region=geo_data.get("regionName") if geo_data else None,
                city=geo_data.get("city") if geo_data else None,
                latitude=str(geo_data.get("lat")) if geo_data and geo_data.get("lat") else None,
                longitude=str(geo_data.get("lon")) if geo_data and geo_data.get("lon") else None,
                timezone=geo_data.get("timezone") if geo_data else None,
                isp=geo_data.get("isp") if geo_data else None,
                path=path,  # Use the provided path instead of request.url.path
                method=method,
                user_agent=user_agent if user_agent else None,
                referer=referer if referer else None,
                is_bot=is_bot,
                created_at=datetime.utcnow()
            )

            db.add(visitor_log)
            db.commit()
            db.refresh(visitor_log)

            logger.info(f"Tracked visitor from {visitor_log.country or 'Unknown'} - {visitor_log.city or 'Unknown'} to {path}")

            return visitor_log

        except Exception as e:
            logger.error(f"Error tracking visitor: {e}")
            db.rollback()
            return None

    @staticmethod
    async def track_visitor(request: Request, db: Session) -> Optional[VisitorLog]:
        """
        Track a visitor from the request.

        Returns the created VisitorLog or None if tracking was skipped.
        """
        try:
            # Extract request data
            path = str(request.url.path)
            method = request.method
            user_agent = request.headers.get("User-Agent", "")
            referer = request.headers.get("Referer", "")

            # Skip tracking for certain paths
            if not VisitorTrackingService.should_track_path(path):
                return None

            # Check if it's a bot
            is_bot = VisitorTrackingService.is_bot(user_agent)

            # Get client IP
            ip_address = VisitorTrackingService.get_client_ip(request)

            # Get geolocation data
            geo_data = geolocation_service.get_location(ip_address)

            # Create visitor log
            visitor_log = VisitorLog(
                ip_address=ip_address if ip_address != "unknown" else None,
                country=geo_data.get("country") if geo_data else None,
                country_code=geo_data.get("countryCode") if geo_data else None,
                region=geo_data.get("regionName") if geo_data else None,
                city=geo_data.get("city") if geo_data else None,
                latitude=str(geo_data.get("lat")) if geo_data and geo_data.get("lat") else None,
                longitude=str(geo_data.get("lon")) if geo_data and geo_data.get("lon") else None,
                timezone=geo_data.get("timezone") if geo_data else None,
                isp=geo_data.get("isp") if geo_data else None,
                path=path,
                method=method,
                user_agent=user_agent if user_agent else None,
                referer=referer if referer else None,
                is_bot=is_bot,
                created_at=datetime.utcnow()
            )

            db.add(visitor_log)
            db.commit()
            db.refresh(visitor_log)

            logger.info(f"Tracked visitor from {visitor_log.country or 'Unknown'} - {visitor_log.city or 'Unknown'} to {path}")

            return visitor_log

        except Exception as e:
            logger.error(f"Error tracking visitor: {e}")
            db.rollback()
            return None


# Singleton instance
visitor_tracking_service = VisitorTrackingService()
