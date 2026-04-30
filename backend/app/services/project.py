"""
Project service.
"""
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from slugify import slugify
from typing import List, Tuple

from app.models.project import Project, ProjectStatus
from app.models.tag import Tag
from app.schemas.project import ProjectCreate, ProjectUpdate


def get_projects(
    db: Session,
    page: int = 1,
    page_size: int = 10,
    status: str | None = None,
    tag_slug: str | None = None,
    category: str | None = None,
    featured_only: bool = False,
    include_drafts: bool = False
) -> Tuple[List[Project], int]:
    """
    Get projects with pagination and filtering.
    
    Returns tuple of (projects, total_count).
    """
    query = db.query(Project).options(joinedload(Project.tags))
    
    # Status filter
    if not include_drafts:
        query = query.filter(Project.status == ProjectStatus.PUBLISHED.value)
    elif status:
        query = query.filter(Project.status == status)
    
    # Featured filter
    if featured_only:
        query = query.filter(Project.featured == True)
    
    # Category filter
    if category:
        query = query.filter(Project.category == category)
    
    # Tag filter
    if tag_slug:
        query = query.join(Project.tags).filter(Tag.slug == tag_slug)
    
    # Get total count
    total = query.count()
    
    # Apply pagination and ordering
    projects = (
        query
        .order_by(Project.order.asc(), Project.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    
    return projects, total


def get_project_by_id(db: Session, project_id: int) -> Project | None:
    """Get a project by ID with tags."""
    return (
        db.query(Project)
        .options(joinedload(Project.tags))
        .filter(Project.id == project_id)
        .first()
    )


def get_project_by_slug(db: Session, slug: str) -> Project | None:
    """Get a project by slug with tags."""
    return (
        db.query(Project)
        .options(joinedload(Project.tags))
        .filter(Project.slug == slug)
        .first()
    )


def get_published_project_by_slug(db: Session, slug: str) -> Project | None:
    """Get a published project by slug with tags."""
    return (
        db.query(Project)
        .options(joinedload(Project.tags))
        .filter(Project.slug == slug)
        .filter(Project.status == ProjectStatus.PUBLISHED.value)
        .first()
    )


def create_project(db: Session, project_data: ProjectCreate) -> Project:
    """Create a new project."""
    # Generate slug if not provided
    slug = project_data.slug or slugify(project_data.title)
    
    # Ensure unique slug
    existing = get_project_by_slug(db, slug)
    counter = 1
    original_slug = slug
    while existing:
        slug = f"{original_slug}-{counter}"
        existing = get_project_by_slug(db, slug)
        counter += 1
    
    # Get tags
    tags = []
    if project_data.tag_ids:
        tags = db.query(Tag).filter(Tag.id.in_(project_data.tag_ids)).all()
    
    project = Project(
        title=project_data.title,
        slug=slug,
        summary=project_data.summary,
        description_md=project_data.description_md,
        cover_image=project_data.cover_image,
        screenshots=project_data.screenshots,
        repo_url=project_data.repo_url,
        live_url=project_data.live_url,
        tech_tags=project_data.tech_tags,
        status=project_data.status,
        featured=project_data.featured,
        order=project_data.order,
        category=project_data.category,
        meta_title=project_data.meta_title,
        meta_description=project_data.meta_description,
        tags=tags
    )
    
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


def update_project(db: Session, project_id: int, project_data: ProjectUpdate) -> Project | None:
    """Update a project."""
    project = get_project_by_id(db, project_id)
    if not project:
        return None
    
    update_data = project_data.model_dump(exclude_unset=True)
    
    # Handle tags separately
    tag_ids = update_data.pop("tag_ids", None)
    if tag_ids is not None:
        tags = db.query(Tag).filter(Tag.id.in_(tag_ids)).all()
        project.tags = tags
    
    # Update slug if title changed
    if "title" in update_data and "slug" not in update_data:
        new_slug = slugify(update_data["title"])
        if new_slug != project.slug:
            existing = get_project_by_slug(db, new_slug)
            if not existing or existing.id == project_id:
                update_data["slug"] = new_slug
    
    for field, value in update_data.items():
        setattr(project, field, value)
    
    db.commit()
    db.refresh(project)
    return project


def delete_project(db: Session, project_id: int) -> bool:
    """Delete a project."""
    project = get_project_by_id(db, project_id)
    if not project:
        return False
    
    db.delete(project)
    db.commit()
    return True


def get_categories(db: Session) -> List[str]:
    """Get all unique project categories."""
    results = (
        db.query(Project.category)
        .filter(Project.category.isnot(None))
        .filter(Project.status == ProjectStatus.PUBLISHED.value)
        .distinct()
        .all()
    )
    return [r[0] for r in results if r[0]]


def get_all_published_slugs(db: Session) -> List[str]:
    """Get all published project slugs for sitemap."""
    results = (
        db.query(Project.slug)
        .filter(Project.status == ProjectStatus.PUBLISHED.value)
        .all()
    )
    return [r[0] for r in results]
