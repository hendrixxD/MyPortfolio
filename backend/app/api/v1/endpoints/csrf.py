"""
CSRF token endpoints
"""
from fastapi import APIRouter, Request, Response
from app.middleware.csrf_protection import get_csrf_protection
from app.core.config import settings

router = APIRouter(prefix="/csrf", tags=["CSRF"])

csrf_protect = get_csrf_protection(settings.SECRET_KEY)


@router.get("/token")
async def get_csrf_token(response: Response):
    """
    Get a new CSRF token.

    Frontend should call this endpoint before making state-changing requests.
    The token will be set in a cookie and also returned in the response.
    """
    token = csrf_protect.set_csrf_cookie(response)

    return {
        "csrf_token": token,
        "header_name": "X-CSRF-Token"
    }
