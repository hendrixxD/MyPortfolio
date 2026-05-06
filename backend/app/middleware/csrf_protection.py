"""
CSRF (Cross-Site Request Forgery) Protection Middleware
"""
import secrets
import hmac
import hashlib
from typing import Optional
from fastapi import Request, HTTPException, status
from fastapi.responses import Response
import logging

logger = logging.getLogger(__name__)


class CSRFProtection:
    """
    CSRF protection using Double Submit Cookie pattern.

    Generates a CSRF token, stores it in a cookie, and validates it
    against the token sent in request headers.
    """

    def __init__(self, secret_key: str, cookie_name: str = "csrf_token", header_name: str = "X-CSRF-Token"):
        self.secret_key = secret_key.encode()
        self.cookie_name = cookie_name
        self.header_name = header_name

    def generate_token(self) -> str:
        """Generate a new CSRF token."""
        random_token = secrets.token_urlsafe(32)
        # Create HMAC signature to prevent token forgery
        signature = hmac.new(
            self.secret_key,
            random_token.encode(),
            hashlib.sha256
        ).hexdigest()
        return f"{random_token}.{signature}"

    def _verify_token(self, token: str) -> bool:
        """Verify CSRF token signature."""
        try:
            if not token or "." not in token:
                return False

            random_part, signature = token.rsplit(".", 1)
            expected_signature = hmac.new(
                self.secret_key,
                random_part.encode(),
                hashlib.sha256
            ).hexdigest()

            # Constant-time comparison to prevent timing attacks
            return hmac.compare_digest(signature, expected_signature)
        except Exception as e:
            logger.error(f"CSRF token verification error: {e}")
            return False

    def validate_csrf(self, request: Request) -> None:
        """
        Validate CSRF token for state-changing requests.

        Raises HTTPException if validation fails.
        """
        # Only validate POST, PUT, DELETE, PATCH requests
        if request.method not in ["POST", "PUT", "DELETE", "PATCH"]:
            return

        # Skip CSRF for certain paths (e.g., login endpoint needs special handling)
        # Login will use a pre-flight token request
        path = str(request.url.path)

        # Get token from header
        header_token = request.headers.get(self.header_name)
        if not header_token:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="CSRF token missing in request header"
            )

        # Get token from cookie
        cookie_token = request.cookies.get(self.cookie_name)
        if not cookie_token:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="CSRF cookie missing"
            )

        # Verify both tokens match and are valid
        if not hmac.compare_digest(header_token, cookie_token):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="CSRF token mismatch"
            )

        if not self._verify_token(header_token):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid CSRF token"
            )

    def set_csrf_cookie(self, response: Response, token: Optional[str] = None) -> str:
        """
        Set CSRF token in cookie.
        Returns the token for use in response body if needed.
        """
        if token is None:
            token = self.generate_token()

        response.set_cookie(
            key=self.cookie_name,
            value=token,
            httponly=True,
            secure=True,  # Only send over HTTPS
            samesite="strict",  # Prevent CSRF attacks
            max_age=3600  # 1 hour
        )

        return token


# Global CSRF protection instance
csrf_protect: Optional[CSRFProtection] = None


def get_csrf_protection(secret_key: str) -> CSRFProtection:
    """Get or create CSRF protection instance."""
    global csrf_protect
    if csrf_protect is None:
        csrf_protect = CSRFProtection(secret_key=secret_key)
    return csrf_protect
