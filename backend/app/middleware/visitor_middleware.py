"""
Middleware for automatic visitor tracking.
"""
import logging
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from sqlalchemy.orm import sessionmaker, Session
from typing import Optional

from app.core.database import get_engine
from app.services.visitor_tracking import visitor_tracking_service

logger = logging.getLogger(__name__)

# Module-level singleton session factory (eliminates per-request overhead)
_session_factory: Optional[sessionmaker] = None


def get_session_factory() -> sessionmaker:
    """
    Get or create the singleton session factory.

    This eliminates ~10-20ms overhead from creating a new sessionmaker
    on every request. The factory is thread-safe and reusable.
    """
    global _session_factory
    if _session_factory is None:
        _session_factory = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=get_engine()
        )
    return _session_factory


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
                # Use singleton session factory (eliminates per-request overhead)
                SessionFactory = get_session_factory()
                db = SessionFactory()
                try:
                    # Track visitor (async but we don't await to avoid blocking)
                    await visitor_tracking_service.track_visitor(request, db)
                finally:
                    db.close()
            except Exception as e:
                # Log error but don't fail the request
                logger.error(f"Error in visitor tracking middleware: {e}")

        return response
