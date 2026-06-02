"""
Main FastAPI application.
"""
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core.logging import get_logger
from app.core.sentry import init_sentry
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
    Application lifespan events.

    Optimized for serverless environments:
    - No directory creation (ephemeral filesystem)
    - Minimal startup time
    - Graceful degradation if services unavailable
    """
    # Startup
    init_sentry()  # Initialize Sentry for error tracking (graceful if not configured)
    logger.info("Starting up Portfolio API...")

    # Check R2 storage configuration (gracefully handles missing credentials)
    from app.services.storage import get_storage_service
    try:
        storage = get_storage_service()
        if storage.is_configured:
            logger.info(f"✅ R2 Storage: Configured ({storage.bucket_name})")
            logger.info(f"   Public URL: {storage.public_url}")
        else:
            logger.warning("⚠️  R2 Storage: NOT configured - file uploads disabled")
    except Exception as e:
        logger.error(f"❌ R2 Storage initialization error: {e}")

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
app.add_middleware(SecurityHeadersMiddleware)

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
