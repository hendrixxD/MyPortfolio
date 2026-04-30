"""
Article service.
"""
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, func
from slugify import slugify
from typing import List, Tuple
from datetime import datetime
import math

from app.models.article import Article, ArticleStatus
from app.models.tag import Tag
from app.schemas.article import ArticleCreate, ArticleUpdate


def calculate_reading_time(content: str) -> int:
    """Calculate reading time in minutes (average 200 words per minute)."""
    word_count = len(content.split())
    return max(1, math.ceil(word_count / 200))


def get_articles(
    db: Session,
    page: int = 1,
    page_size: int = 10,
    status: str | None = None,
    tag_slug: str | None = None,
    search: str | None = None,
    featured_only: bool = False,
    include_drafts: bool = False
) -> Tuple[List[Article], int]:
    """
    Get articles with pagination and filtering.
    
    Returns tuple of (articles, total_count).
    """
    query = db.query(Article).options(joinedload(Article.tags))
    
    # Status filter
    if not include_drafts:
        query = query.filter(Article.status == ArticleStatus.PUBLISHED.value)
    elif status:
        query = query.filter(Article.status == status)
    
    # Featured filter
    if featured_only:
        query = query.filter(Article.featured == True)
    
    # Tag filter
    if tag_slug:
        query = query.join(Article.tags).filter(Tag.slug == tag_slug)
    
    # Search filter
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Article.title.ilike(search_term),
                Article.summary.ilike(search_term),
                Article.content_md.ilike(search_term)
            )
        )
    
    # Get total count
    total = query.count()
    
    # Apply pagination and ordering
    articles = (
        query
        .order_by(Article.published_at.desc().nullsfirst(), Article.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    
    return articles, total


def get_article_by_id(db: Session, article_id: int) -> Article | None:
    """Get an article by ID with tags."""
    return (
        db.query(Article)
        .options(joinedload(Article.tags))
        .filter(Article.id == article_id)
        .first()
    )


def get_article_by_slug(db: Session, slug: str) -> Article | None:
    """Get an article by slug with tags."""
    return (
        db.query(Article)
        .options(joinedload(Article.tags))
        .filter(Article.slug == slug)
        .first()
    )


def get_published_article_by_slug(db: Session, slug: str) -> Article | None:
    """Get a published article by slug with tags."""
    return (
        db.query(Article)
        .options(joinedload(Article.tags))
        .filter(Article.slug == slug)
        .filter(Article.status == ArticleStatus.PUBLISHED.value)
        .first()
    )


def create_article(db: Session, article_data: ArticleCreate) -> Article:
    """Create a new article."""
    # Generate slug if not provided
    slug = article_data.slug or slugify(article_data.title)
    
    # Ensure unique slug
    existing = get_article_by_slug(db, slug)
    counter = 1
    original_slug = slug
    while existing:
        slug = f"{original_slug}-{counter}"
        existing = get_article_by_slug(db, slug)
        counter += 1
    
    # Calculate reading time
    reading_time = calculate_reading_time(article_data.content_md)
    
    # Get tags
    tags = []
    if article_data.tag_ids:
        tags = db.query(Tag).filter(Tag.id.in_(article_data.tag_ids)).all()
    
    article = Article(
        title=article_data.title,
        slug=slug,
        summary=article_data.summary,
        content_md=article_data.content_md,
        cover_image=article_data.cover_image,
        status=article_data.status,
        reading_time=reading_time,
        featured=article_data.featured,
        meta_title=article_data.meta_title,
        meta_description=article_data.meta_description,
        tags=tags
    )
    
    # Set published_at if status is published
    if article.status == ArticleStatus.PUBLISHED.value:
        article.published_at = datetime.utcnow()
    
    db.add(article)
    db.commit()
    db.refresh(article)
    return article


def update_article(db: Session, article_id: int, article_data: ArticleUpdate) -> Article | None:
    """Update an article."""
    article = get_article_by_id(db, article_id)
    if not article:
        return None
    
    update_data = article_data.model_dump(exclude_unset=True)
    
    # Handle tags separately
    tag_ids = update_data.pop("tag_ids", None)
    if tag_ids is not None:
        tags = db.query(Tag).filter(Tag.id.in_(tag_ids)).all()
        article.tags = tags
    
    # Update slug if title changed
    if "title" in update_data and "slug" not in update_data:
        new_slug = slugify(update_data["title"])
        if new_slug != article.slug:
            existing = get_article_by_slug(db, new_slug)
            if not existing or existing.id == article_id:
                update_data["slug"] = new_slug
    
    # Recalculate reading time if content changed
    if "content_md" in update_data:
        update_data["reading_time"] = calculate_reading_time(update_data["content_md"])
    
    # Handle publish/unpublish
    if "status" in update_data:
        if update_data["status"] == ArticleStatus.PUBLISHED.value and not article.published_at:
            article.published_at = datetime.utcnow()
        elif update_data["status"] != ArticleStatus.PUBLISHED.value:
            article.published_at = None
    
    for field, value in update_data.items():
        setattr(article, field, value)
    
    db.commit()
    db.refresh(article)
    return article


def delete_article(db: Session, article_id: int) -> bool:
    """Delete an article."""
    article = get_article_by_id(db, article_id)
    if not article:
        return False
    
    db.delete(article)
    db.commit()
    return True


def increment_view_count(db: Session, article_id: int) -> None:
    """Increment the view count of an article."""
    article = db.query(Article).filter(Article.id == article_id).first()
    if article:
        article.view_count += 1
        db.commit()


def get_all_published_slugs(db: Session) -> List[str]:
    """Get all published article slugs for sitemap."""
    results = (
        db.query(Article.slug)
        .filter(Article.status == ArticleStatus.PUBLISHED.value)
        .all()
    )
    return [r[0] for r in results]
