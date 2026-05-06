"""
Middleware for automatic visitor tracking.
"""
import logging
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from app.core.database import SessionLocal
from app.services.visitor_tracking import visitor_tracking_service

logger = logging.getLogger(__name__)


class VisitorTrackingMiddleware(BaseHTTPMiddleware):
    """
    Middleware to automatically track visitors.

    Runs in the background to avoid slowing down responses.
    """

    async def dispatch(self, request: Request, call_next):
        """Process request and track visitor."""

        # Get response first (don't block on tracking)
        response: Response = await call_next(request)

        # Track visitor in background (fire and forget)
        # Only track successful responses (200-299)
        if 200 <= response.status_code < 300:
            try:
                # Create database session
                db = SessionLocal()
                try:
                    # Track visitor (async but we don't await to avoid blocking)
                    await visitor_tracking_service.track_visitor(request, db)
                finally:
                    db.close()
            except Exception as e:
                # Log error but don't fail the request
                logger.error(f"Error in visitor tracking middleware: {e}")

        return response
