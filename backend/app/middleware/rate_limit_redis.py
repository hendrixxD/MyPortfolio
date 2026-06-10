"""
Redis-based rate limiting middleware for distributed systems.
Replaces in-memory rate limiting to work across multiple servers.
"""
from typing import Dict, Optional
from datetime import datetime, timedelta
from fastapi import HTTPException, Request, status
import redis
import logging

logger = logging.getLogger(__name__)


class RedisRateLimiter:
    """
    Redis-based rate limiter for production use with multiple servers.

    Falls back to in-memory if Redis is unavailable (development mode).
    """

    def __init__(
        self,
        redis_url: Optional[str] = None,
        requests_per_minute: int = 5,
        requests_per_hour: int = 20,
        fallback_to_memory: bool = True
    ):
        self.requests_per_minute = requests_per_minute
        self.requests_per_hour = requests_per_hour
        self.fallback_to_memory = fallback_to_memory

        # Try to connect to Redis
        if redis_url:
            try:
                self.redis_client = redis.from_url(
                    redis_url,
                    decode_responses=True,
                    socket_connect_timeout=2,
                    socket_timeout=2
                )
                # Test connection
                self.redis_client.ping()
                self.use_redis = True
                logger.info("✅ Redis rate limiter initialized")
            except (redis.ConnectionError, redis.TimeoutError) as e:
                logger.warning(f"⚠️ Redis unavailable: {e}")
                if not fallback_to_memory:
                    raise
                self.use_redis = False
        else:
            logger.info("ℹ️ Redis not configured, using in-memory rate limiting")
            self.use_redis = False

        # Fallback in-memory storage
        if not self.use_redis:
            self.minute_attempts: Dict[str, list] = {}
            self.hour_attempts: Dict[str, list] = {}

    def _get_client_id(self, request: Request) -> str:
        """Get client identifier from request."""
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    def _check_redis_rate_limit(self, identifier: str) -> None:
        """Check rate limit using Redis."""
        now = int(datetime.now().timestamp())

        # Keys for minute and hour windows
        minute_key = f"ratelimit:minute:{identifier}"
        hour_key = f"ratelimit:hour:{identifier}"

        # Use Redis pipeline for atomicity
        pipe = self.redis_client.pipeline()

        # Check minute limit
        pipe.zadd(minute_key, {str(now): now})
        pipe.zremrangebyscore(minute_key, 0, now - 60)
        pipe.zcard(minute_key)
        pipe.expire(minute_key, 60)

        # Check hour limit
        pipe.zadd(hour_key, {str(now): now})
        pipe.zremrangebyscore(hour_key, 0, now - 3600)
        pipe.zcard(hour_key)
        pipe.expire(hour_key, 3600)

        results = pipe.execute()

        minute_count = results[2]  # Result of zcard for minute
        hour_count = results[6]    # Result of zcard for hour

        if minute_count > self.requests_per_minute:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many requests. Please try again in 1 minute.",
                headers={"Retry-After": "60"}
            )

        if hour_count > self.requests_per_hour:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many requests. Please try again in 1 hour.",
                headers={"Retry-After": "3600"}
            )

    def _check_memory_rate_limit(self, identifier: str) -> None:
        """Fallback in-memory rate limiting."""
        now = datetime.now()

        # Clean up old attempts
        if identifier in self.minute_attempts:
            self.minute_attempts[identifier] = [
                timestamp for timestamp in self.minute_attempts[identifier]
                if now - timestamp < timedelta(minutes=1)
            ]

        if identifier in self.hour_attempts:
            self.hour_attempts[identifier] = [
                timestamp for timestamp in self.hour_attempts[identifier]
                if now - timestamp < timedelta(hours=1)
            ]

        # Check limits
        minute_count = len(self.minute_attempts.get(identifier, []))
        hour_count = len(self.hour_attempts.get(identifier, []))

        if minute_count >= self.requests_per_minute:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many requests. Please try again in 1 minute.",
                headers={"Retry-After": "60"}
            )

        if hour_count >= self.requests_per_hour:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many requests. Please try again in 1 hour.",
                headers={"Retry-After": "3600"}
            )

        # Record attempt
        if identifier not in self.minute_attempts:
            self.minute_attempts[identifier] = []
        if identifier not in self.hour_attempts:
            self.hour_attempts[identifier] = []

        self.minute_attempts[identifier].append(now)
        self.hour_attempts[identifier].append(now)

    async def check_rate_limit(self, request: Request):
        """
        Check if request exceeds rate limit.
        Uses Redis if available, falls back to in-memory.
        """
        identifier = self._get_client_id(request)

        try:
            if self.use_redis:
                self._check_redis_rate_limit(identifier)
            else:
                self._check_memory_rate_limit(identifier)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Rate limiting error: {e}")
            # On error, allow request (fail open) but log it
            if not self.fallback_to_memory:
                raise

    def block_ip(self, ip_address: str, duration_seconds: int = 3600):
        """
        Block an IP address for a specified duration.
        Useful for brute force protection.
        """
        if self.use_redis:
            block_key = f"blocked:{ip_address}"
            self.redis_client.setex(block_key, duration_seconds, "1")
            logger.warning(f"Blocked IP {ip_address} for {duration_seconds} seconds")

    def is_blocked(self, ip_address: str) -> bool:
        """Check if an IP is blocked."""
        if self.use_redis:
            block_key = f"blocked:{ip_address}"
            return self.redis_client.exists(block_key) > 0
        return False


# Global rate limiter instance (will be configured in main.py)
login_rate_limiter: Optional[RedisRateLimiter] = None


def get_login_rate_limiter(redis_url: Optional[str] = None) -> RedisRateLimiter:
    """Get or create the login rate limiter instance."""
    global login_rate_limiter
    if login_rate_limiter is None:
        # Try to get Redis URL from settings if not provided
        if not redis_url:
            from app.core.config import settings
            redis_url = settings.redis_url

        # Increased limits to accommodate legitimate user scenarios:
        # - 15/min allows normal retry behavior after typos/mistakes
        # - 100/hour supports users who may need multiple access attempts
        # Still protects against brute force (15 tries = adequate defense)
        login_rate_limiter = RedisRateLimiter(
            redis_url=redis_url,
            requests_per_minute=15,
            requests_per_hour=100,
            fallback_to_memory=True  # Allow fallback for Vercel
        )
    return login_rate_limiter
