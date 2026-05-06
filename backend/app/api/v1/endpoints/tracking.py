"""
Client-side tracking endpoint.
"""
import re
from fastapi import APIRouter, Request, Response, HTTPException, status
from sqlalchemy.orm import Session
from fastapi import Depends

from app.core.database import get_db
from app.services.visitor_tracking import visitor_tracking_service

router = APIRouter(prefix="/tracking", tags=["Tracking"])


def validate_page_path(page: str) -> str:
    """
    Validate and sanitize page path to prevent SQL injection.

    Only allows alphanumeric, hyphens, underscores, forward slashes, and query strings.
    """
    if not page:
        return "/"

    # Limit length
    if len(page) > 500:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Page path too long"
        )

    # Allow valid URL path characters
    if not re.match(r'^/[\w\-/?.=&%]*$', page):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid page path format"
        )

    return page


@router.post("/pageview")
async def track_pageview(request: Request, page: str = "/", db: Session = Depends(get_db)):
    """
    Track a page view from the client side.

    This endpoint is called from the frontend to track page views
    since Next.js serves pages directly without going through FastAPI.

    Query params:
    - page: The actual page path being viewed (e.g., "/articles", "/projects")
    """
    try:
        # Validate and sanitize the page parameter
        validated_page = validate_page_path(page)

        # Create a modified request state for tracking the actual page
        await visitor_tracking_service.track_visitor_with_path(request, validated_page, db)
        return {"status": "tracked"}
    except HTTPException:
        raise
    except Exception as e:
        # Don't fail if tracking fails
        return {"status": "error", "message": str(e)}


@router.get("/ping")
async def tracking_ping(request: Request, db: Session = Depends(get_db)):
    """
    Simple tracking pixel endpoint (GET request).

    Can be called with an image tag or fetch request.
    """
    try:
        await visitor_tracking_service.track_visitor(request, db)
    except Exception:
        pass  # Silent fail

    # Return 1x1 transparent PNG
    return Response(
        content=b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82',
        media_type="image/png",
        headers={"Cache-Control": "no-cache, no-store, must-revalidate"}
    )
