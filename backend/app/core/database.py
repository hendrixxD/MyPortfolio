"""
Database configuration and session management.

Uses lazy initialization for serverless compatibility:
- Engine is created on first database access, not at import time
- Prevents cold-start failures if DATABASE_URL isn't ready
- Reduces initialization time for functions that don't use the database
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.engine import Engine
from typing import Generator, Optional

from app.core.config import settings

# Global engine instance (lazy-initialized)
_engine: Optional[Engine] = None


def get_engine() -> Engine:
    """
    Get or create the SQLAlchemy engine (lazy initialization).

    Engine is created on first call and reused for subsequent calls
    within the same function instance.
    """
    global _engine
    if _engine is None:
        # Create engine optimized for serverless (Vercel Functions)
        # Uses Neon's connection pooling (DATABASE_URL includes pgbouncer by default)
        _engine = create_engine(
            settings.DATABASE_URL,
            pool_pre_ping=True,
            pool_size=5,  # Reduced for serverless - each function instance has its own pool
            max_overflow=10,  # Lower overflow for serverless
            pool_recycle=300,  # Recycle connections after 5 minutes
            pool_timeout=30,  # 30 second timeout
            echo=False,  # Set to True for SQL debugging
        )
    return _engine


def get_db() -> Generator[Session, None, None]:
    """
    Dependency that provides a database session.
    Yields a session and ensures it's closed after use.

    Database connection is established lazily on first use.
    """
    # Create session factory with lazy engine
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=get_engine())
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
