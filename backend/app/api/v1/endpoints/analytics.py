"""
Analytics endpoints for visitor tracking.
"""
from typing import Annotated
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, distinct
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.visitor import VisitorLog
from app.schemas.visitor import VisitorStats, VisitorLog as VisitorLogSchema, CountryStats, PageStats
from app.api.deps import AdminUser

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/visitors", response_model=VisitorStats)
def get_visitor_stats(
    admin: AdminUser,
    db: Annotated[Session, Depends(get_db)],
    days: int = Query(default=30, ge=1, le=365, description="Number of days to analyze")
):
    """
    Get visitor statistics for the specified time period.

    Requires admin authentication.
    """
    since_date = datetime.utcnow() - timedelta(days=days)

    # Base query for the time period
    base_query = db.query(VisitorLog).filter(VisitorLog.created_at >= since_date)

    # Total visits
    total_visits = base_query.count()

    # Unique IPs
    unique_ips = base_query.with_entities(
        func.count(distinct(VisitorLog.ip_address))
    ).scalar() or 0

    # Bot vs human visits
    bot_visits = base_query.filter(VisitorLog.is_bot == True).count()
    human_visits = total_visits - bot_visits

    # Top countries (excluding bots)
    top_countries_data = (
        base_query
        .filter(VisitorLog.is_bot == False, VisitorLog.country.isnot(None))
        .with_entities(
            VisitorLog.country,
            VisitorLog.country_code,
            func.count(VisitorLog.id).label("count"),
            func.count(distinct(VisitorLog.ip_address)).label("unique_ips")
        )
        .group_by(VisitorLog.country, VisitorLog.country_code)
        .order_by(func.count(VisitorLog.id).desc())
        .limit(10)
        .all()
    )

    top_countries = [
        {
            "country": row.country,
            "country_code": row.country_code,
            "visit_count": row.count,
            "unique_ips": row.unique_ips
        }
        for row in top_countries_data
    ]

    # Top cities (excluding bots)
    top_cities_data = (
        base_query
        .filter(VisitorLog.is_bot == False, VisitorLog.city.isnot(None))
        .with_entities(
            VisitorLog.city,
            VisitorLog.country,
            func.count(VisitorLog.id).label("count"),
            func.count(distinct(VisitorLog.ip_address)).label("unique_ips")
        )
        .group_by(VisitorLog.city, VisitorLog.country)
        .order_by(func.count(VisitorLog.id).desc())
        .limit(10)
        .all()
    )

    top_cities = [
        {
            "city": row.city,
            "country": row.country,
            "visit_count": row.count,
            "unique_ips": row.unique_ips
        }
        for row in top_cities_data
    ]

    # Top pages (excluding bots)
    top_pages_data = (
        base_query
        .filter(VisitorLog.is_bot == False, VisitorLog.path.isnot(None))
        .with_entities(
            VisitorLog.path,
            func.count(VisitorLog.id).label("count"),
            func.count(distinct(VisitorLog.ip_address)).label("unique_ips")
        )
        .group_by(VisitorLog.path)
        .order_by(func.count(VisitorLog.id).desc())
        .limit(10)
        .all()
    )

    top_pages = [
        {
            "path": row.path,
            "visit_count": row.count,
            "unique_ips": row.unique_ips
        }
        for row in top_pages_data
    ]

    # Recent visits (last 20)
    recent_visits = (
        base_query
        .filter(VisitorLog.is_bot == False)
        .order_by(VisitorLog.created_at.desc())
        .limit(20)
        .all()
    )

    return VisitorStats(
        total_visits=total_visits,
        unique_ips=unique_ips,
        bot_visits=bot_visits,
        human_visits=human_visits,
        top_countries=top_countries,
        top_cities=top_cities,
        top_pages=top_pages,
        recent_visits=recent_visits
    )


@router.get("/visitors/countries", response_model=list[CountryStats])
def get_country_stats(
    admin: AdminUser,
    db: Annotated[Session, Depends(get_db)],
    days: int = Query(default=30, ge=1, le=365)
):
    """
    Get detailed country-level statistics.

    Requires admin authentication.
    """
    since_date = datetime.utcnow() - timedelta(days=days)

    results = (
        db.query(VisitorLog)
        .filter(
            VisitorLog.created_at >= since_date,
            VisitorLog.is_bot == False,
            VisitorLog.country.isnot(None)
        )
        .with_entities(
            VisitorLog.country,
            VisitorLog.country_code,
            func.count(VisitorLog.id).label("visit_count"),
            func.count(distinct(VisitorLog.ip_address)).label("unique_ips")
        )
        .group_by(VisitorLog.country, VisitorLog.country_code)
        .order_by(func.count(VisitorLog.id).desc())
        .all()
    )

    return [
        CountryStats(
            country=row.country,
            country_code=row.country_code,
            visit_count=row.visit_count,
            unique_ips=row.unique_ips
        )
        for row in results
    ]


@router.get("/visitors/pages", response_model=list[PageStats])
def get_page_stats(
    admin: AdminUser,
    db: Annotated[Session, Depends(get_db)],
    days: int = Query(default=30, ge=1, le=365)
):
    """
    Get detailed page-level statistics.

    Requires admin authentication.
    """
    since_date = datetime.utcnow() - timedelta(days=days)

    results = (
        db.query(VisitorLog)
        .filter(
            VisitorLog.created_at >= since_date,
            VisitorLog.is_bot == False,
            VisitorLog.path.isnot(None)
        )
        .with_entities(
            VisitorLog.path,
            func.count(VisitorLog.id).label("visit_count"),
            func.count(distinct(VisitorLog.ip_address)).label("unique_ips")
        )
        .group_by(VisitorLog.path)
        .order_by(func.count(VisitorLog.id).desc())
        .all()
    )

    return [
        PageStats(
            path=row.path,
            visit_count=row.visit_count,
            unique_ips=row.unique_ips
        )
        for row in results
    ]


@router.get("/visitors/recent", response_model=list[VisitorLogSchema])
def get_recent_visitors(
    admin: AdminUser,
    db: Annotated[Session, Depends(get_db)],
    limit: int = Query(default=50, ge=1, le=200)
):
    """
    Get recent visitor logs.

    Requires admin authentication.
    """
    visitors = (
        db.query(VisitorLog)
        .filter(VisitorLog.is_bot == False)
        .order_by(VisitorLog.created_at.desc())
        .limit(limit)
        .all()
    )

    return visitors


@router.delete("/visitors/cleanup")
def cleanup_old_logs(
    admin: AdminUser,
    db: Annotated[Session, Depends(get_db)],
    days: int = Query(default=365, ge=30, description="Delete logs older than this many days")
):
    """
    Clean up old visitor logs.

    Requires admin authentication.
    """
    cutoff_date = datetime.utcnow() - timedelta(days=days)

    deleted_count = (
        db.query(VisitorLog)
        .filter(VisitorLog.created_at < cutoff_date)
        .delete()
    )

    db.commit()

    return {
        "message": f"Deleted {deleted_count} visitor logs older than {days} days",
        "deleted_count": deleted_count
    }
