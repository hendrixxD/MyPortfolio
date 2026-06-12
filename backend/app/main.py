"""
Main FastAPI application.
"""
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core.logging import get_logger
from app.core.exceptions import register_exception_handlers
from app.api.v1.router import api_router
from app.middleware.visitor_middleware import VisitorTrackingMiddleware
from app.middleware.security_headers import SecurityHeadersMiddleware

logger = get_logger()

# Rate limiter
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Serverless-optimized lifespan.

    All initialization moved to lazy-load on first request to ensure
    fast cold starts in Vercel's strict 60-second timeout window.
    - Sentry: lazy-init on first error
    - Storage: lazy-init on first upload
    - Production validation: moved to health check endpoint
    """
    # Minimal startup - just logging
    logger.info("Starting Portfolio API...")

    yield

    # Shutdown
    logger.info("Shutting down Portfolio API...")


# Create FastAPI app
app = FastAPI(
    title="lengedandungjoshua Portfolio API",
    description="Backend API for the portfolio website",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Register custom exception handlers for consistent error responses
register_exception_handlers(app)

# Add security headers middleware (first, so it applies to all responses)
# Environment-aware configuration: strict CSP and HSTS in production
app.add_middleware(SecurityHeadersMiddleware, is_production=settings.is_production)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add visitor tracking middleware
app.add_middleware(VisitorTrackingMiddleware)

# Include API router
app.include_router(api_router)


@app.get("/")
def root():
    """Root endpoint."""
    return {
        "name": "lengedandungjoshua Portfolio API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/v1/health"
    }
