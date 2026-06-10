"""
Health check endpoint.
"""
import time
import psutil
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Dict, Any

from app.core.database import get_db, get_engine

router = APIRouter(tags=["Health"])

# Track request metrics (simple in-memory store)
_request_metrics = {
    "total_requests": 0,
    "start_time": datetime.now(),
    "endpoint_timings": {}
}


@router.get("/health")
def health_check():
    """Basic health check endpoint."""
    return {"status": "healthy", "message": "API is running"}


@router.get("/health/db")
def health_check_db(db: Session = Depends(get_db)):
    """Database health check endpoint."""
    try:
        start = time.perf_counter()
        db.execute(text("SELECT 1"))
        query_time_ms = (time.perf_counter() - start) * 1000

        return {
            "status": "healthy",
            "database": "connected",
            "query_time_ms": round(query_time_ms, 2)
        }
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}


@router.get("/health/metrics")
def get_performance_metrics(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Get performance metrics for monitoring.

    Returns:
    - Database connection pool stats
    - Request timing statistics
    - System resource usage
    - Uptime information
    """
    # Database pool stats
    engine = get_engine()
    pool = engine.pool

    db_stats = {
        "pool_size": pool.size(),
        "checked_out": pool.checkedout(),
        "overflow": pool.overflow(),
        "checked_in": pool.checkedin(),
    }

    # Test database query time
    start = time.perf_counter()
    try:
        db.execute(text("SELECT 1"))
        db_query_time_ms = (time.perf_counter() - start) * 1000
        db_status = "connected"
    except Exception as e:
        db_query_time_ms = None
        db_status = f"error: {str(e)}"

    # System resource usage
    process = psutil.Process()
    memory_info = process.memory_info()

    system_stats = {
        "cpu_percent": process.cpu_percent(interval=0.1),
        "memory_rss_mb": round(memory_info.rss / 1024 / 1024, 2),
        "memory_percent": round(process.memory_percent(), 2),
        "num_threads": process.num_threads(),
    }

    # Uptime
    uptime_seconds = (datetime.now() - _request_metrics["start_time"]).total_seconds()

    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "uptime_seconds": round(uptime_seconds, 2),
        "database": {
            "status": db_status,
            "query_time_ms": round(db_query_time_ms, 2) if db_query_time_ms else None,
            "pool": db_stats
        },
        "system": system_stats,
        "requests": {
            "total": _request_metrics["total_requests"]
        }
    }


@router.get("/health/ready")
def readiness_check(db: Session = Depends(get_db)):
    """
    Kubernetes-style readiness probe.

    Returns 200 if service is ready to accept traffic,
    503 if not ready (e.g., database unavailable).
    """
    try:
        # Check database connectivity
        db.execute(text("SELECT 1"))

        return {
            "status": "ready",
            "checks": {
                "database": "ok"
            }
        }
    except Exception as e:
        return {
            "status": "not_ready",
            "checks": {
                "database": f"failed: {str(e)}"
            }
        }


@router.get("/health/live")
def liveness_check():
    """
    Kubernetes-style liveness probe.

    Returns 200 if service is alive (even if not ready).
    Use for detecting if container needs to be restarted.
    """
    return {
        "status": "alive",
        "timestamp": datetime.now().isoformat()
    }
