"""
Rate limiting middleware for authentication endpoints.
"""
from typing import Dict
from datetime import datetime, timedelta
from fastapi import HTTPException, Request, status
from collections import defaultdict
import asyncio


class RateLimiter:
    """
    Simple in-memory rate limiter for authentication endpoints.

    For production with multiple servers, consider using Redis instead.
    """

    def __init__(self, requests_per_minute: int = 5, requests_per_hour: int = 20):
        self.requests_per_minute = requests_per_minute
        self.requests_per_hour = requests_per_hour
        self.minute_attempts: Dict[str, list] = defaultdict(list)
        self.hour_attempts: Dict[str, list] = defaultdict(list)
        self._cleanup_task = None

    def _get_client_id(self, request: Request) -> str:
        """Get client identifier from request (IP address or forwarded IP)."""
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    def _cleanup_old_attempts(self, identifier: str):
        """Remove attempts older than tracking window."""
        now = datetime.now()

        # Clean up minute attempts (older than 1 minute)
        if identifier in self.minute_attempts:
            self.minute_attempts[identifier] = [
                timestamp for timestamp in self.minute_attempts[identifier]
                if now - timestamp < timedelta(minutes=1)
            ]
            if not self.minute_attempts[identifier]:
                del self.minute_attempts[identifier]

        # Clean up hour attempts (older than 1 hour)
        if identifier in self.hour_attempts:
            self.hour_attempts[identifier] = [
                timestamp for timestamp in self.hour_attempts[identifier]
                if now - timestamp < timedelta(hours=1)
            ]
            if not self.hour_attempts[identifier]:
                del self.hour_attempts[identifier]

    async def check_rate_limit(self, request: Request):
        """
        Check if request exceeds rate limit.

        Raises HTTPException if rate limit is exceeded.
        """
        identifier = self._get_client_id(request)
        now = datetime.now()

        # Clean up old attempts
        self._cleanup_old_attempts(identifier)

        # Check minute rate limit
        minute_count = len(self.minute_attempts[identifier])
        if minute_count >= self.requests_per_minute:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many login attempts. Please try again in 1 minute.",
                headers={"Retry-After": "60"}
            )

        # Check hour rate limit
        hour_count = len(self.hour_attempts[identifier])
        if hour_count >= self.requests_per_hour:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many login attempts. Please try again in 1 hour.",
                headers={"Retry-After": "3600"}
            )

        # Record this attempt
        self.minute_attempts[identifier].append(now)
        self.hour_attempts[identifier].append(now)

    async def start_cleanup_task(self):
        """Start background task to periodically clean up old attempts."""
        while True:
            await asyncio.sleep(300)  # Clean up every 5 minutes
            now = datetime.now()

            # Clean up all identifiers
            for identifier in list(self.minute_attempts.keys()):
                self._cleanup_old_attempts(identifier)


# Global rate limiter instance
login_rate_limiter = RateLimiter(requests_per_minute=5, requests_per_hour=20)
