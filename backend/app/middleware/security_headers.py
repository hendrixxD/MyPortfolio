"""
Security headers middleware with environment-aware configuration.
"""
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from typing import Callable


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Add security headers to all responses with environment-aware configuration.

    Implements defense-in-depth security headers:
    - Content-Security-Policy: Prevent XSS and injection attacks
    - X-Frame-Options: Prevent clickjacking
    - X-Content-Type-Options: Prevent MIME sniffing
    - Strict-Transport-Security: Enforce HTTPS (production only)
    - Referrer-Policy: Control referrer information
    - Permissions-Policy: Control browser features
    """

    def __init__(self, app, is_production: bool = False):
        super().__init__(app)
        self.is_production = is_production

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)

        # Content Security Policy - environment-aware configuration
        # Remove unsafe-eval in production for enhanced security
        if self.is_production:
            # Production: Strict CSP without unsafe-eval
            csp = (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline'; "  # unsafe-eval removed for production security
                "style-src 'self' 'unsafe-inline'; "
                "img-src 'self' data: https:; "
                "font-src 'self' data:; "
                "connect-src 'self' https:; "  # Only HTTPS in production
                "frame-ancestors 'none'; "
                "base-uri 'self'; "
                "form-action 'self'; "
                "upgrade-insecure-requests;"
            )
        else:
            # Development: Relaxed CSP for local development
            csp = (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "  # unsafe-eval for Next.js dev
                "style-src 'self' 'unsafe-inline'; "
                "img-src 'self' data: https:; "
                "font-src 'self' data:; "
                "connect-src 'self' http://localhost:* https:; "  # Allow localhost in dev
                "frame-ancestors 'none'; "
                "base-uri 'self'; "
                "form-action 'self'; "
                "upgrade-insecure-requests;"
            )
        response.headers["Content-Security-Policy"] = csp

        # Prevent clickjacking
        response.headers["X-Frame-Options"] = "DENY"

        # Prevent MIME type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"

        # HSTS: Enforce HTTPS in production only
        # This header must only be sent over HTTPS connections
        if self.is_production:
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"

        # Control referrer information
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # Disable potentially dangerous browser features
        permissions_policy = (
            "accelerometer=(), "
            "camera=(), "
            "geolocation=(), "
            "gyroscope=(), "
            "magnetometer=(), "
            "microphone=(), "
            "payment=(), "
            "usb=()"
        )
        response.headers["Permissions-Policy"] = permissions_policy

        # Additional XSS protection (legacy, but doesn't hurt)
        response.headers["X-XSS-Protection"] = "1; mode=block"

        return response
