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
    """Application lifespan events."""
    # Startup
    init_sentry()  # Initialize Sentry for error tracking
    logger.info("Starting up Portfolio API...")
    
    # Create logs directory
    os.makedirs("logs", exist_ok=True)
    
    # Create uploads directory
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
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

# Mount static files for uploads
if os.path.exists(settings.UPLOAD_DIR):
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

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
