"""
Article endpoints.
"""
import math
from typing import List
from fastapi import APIRouter, HTTPException, status, Query

from app.api.deps import DbSession, AdminUser
from app.schemas.article import (
    ArticleCreate, ArticleUpdate, ArticleResponse,
    ArticleBrief, ArticleListResponse
)
from app.services import article as article_service

router = APIRouter(prefix="/articles", tags=["Articles"])


@router.get("/", response_model=ArticleListResponse)
def get_articles(
    db: DbSession,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    tag: str | None = None,
    search: str | None = None,
    featured: bool = False
):
    """Get published articles with pagination and filtering."""
    articles, total = article_service.get_articles(
        db,
        page=page,
        page_size=page_size,
        tag_slug=tag,
        search=search,
        featured_only=featured,
        include_drafts=False
    )
    
    return ArticleListResponse(
        items=[ArticleBrief.model_validate(a) for a in articles],
        total=total,
        page=page,
        page_size=page_size,
        pages=math.ceil(total / page_size) if total > 0 else 1
    )


@router.get("/admin", response_model=ArticleListResponse)
def get_all_articles(
    db: DbSession,
    admin: AdminUser,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    status: str | None = None,
    tag: str | None = None,
    search: str | None = None
):
    """Get all articles including drafts (admin only)."""
    articles, total = article_service.get_articles(
        db,
        page=page,
        page_size=page_size,
        status=status,
        tag_slug=tag,
        search=search,
        include_drafts=True
    )
    
    return ArticleListResponse(
        items=[ArticleBrief.model_validate(a) for a in articles],
        total=total,
        page=page,
        page_size=page_size,
        pages=math.ceil(total / page_size) if total > 0 else 1
    )


@router.get("/slugs", response_model=List[str])
def get_article_slugs(db: DbSession):
    """Get all published article slugs for sitemap generation."""
    return article_service.get_all_published_slugs(db)


@router.get("/{slug}", response_model=ArticleResponse)
def get_article_by_slug(slug: str, db: DbSession):
    """Get a published article by slug."""
    article = article_service.get_published_article_by_slug(db, slug)
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found"
        )
    
    # Increment view count
    article_service.increment_view_count(db, article.id)
    
    return article


@router.get("/id/{article_id}", response_model=ArticleResponse)
def get_article_by_id(
    article_id: int,
    db: DbSession,
    admin: AdminUser
):
    """Get an article by ID (admin only, includes drafts)."""
    article = article_service.get_article_by_id(db, article_id)
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found"
        )
    return article


@router.post("/", response_model=ArticleResponse, status_code=status.HTTP_201_CREATED)
def create_article(
    article_data: ArticleCreate,
    db: DbSession,
    admin: AdminUser
):
    """Create a new article (admin only)."""
    return article_service.create_article(db, article_data)


@router.put("/{article_id}", response_model=ArticleResponse)
def update_article(
    article_id: int,
    article_data: ArticleUpdate,
    db: DbSession,
    admin: AdminUser
):
    """Update an article (admin only)."""
    article = article_service.update_article(db, article_id, article_data)
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found"
        )
    return article


@router.post("/{article_id}/publish", response_model=ArticleResponse)
def publish_article(
    article_id: int,
    db: DbSession,
    admin: AdminUser
):
    """Publish an article (admin only)."""
    article = article_service.update_article(
        db, article_id,
        ArticleUpdate(status="published")
    )
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found"
        )
    return article


@router.post("/{article_id}/unpublish", response_model=ArticleResponse)
def unpublish_article(
    article_id: int,
    db: DbSession,
    admin: AdminUser
):
    """Unpublish an article (admin only)."""
    article = article_service.update_article(
        db, article_id,
        ArticleUpdate(status="draft")
    )
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found"
        )
    return article


@router.delete("/{article_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_article(
    article_id: int,
    db: DbSession,
    admin: AdminUser
):
    """Delete an article (admin only)."""
    if not article_service.delete_article(db, article_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found"
        )
