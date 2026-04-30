"""
Health check endpoint.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.database import get_db

router = APIRouter(tags=["Health"])


@router.get("/health")
def health_check():
    """Basic health check endpoint."""
    return {"status": "healthy", "message": "API is running"}


@router.get("/health/db")
def health_check_db(db: Session = Depends(get_db)):
    """Database health check endpoint."""
    try:
        db.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}
