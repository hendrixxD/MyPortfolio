"""
Project endpoints.
"""
import math
from typing import List
from fastapi import APIRouter, HTTPException, status, Query

from app.api.deps import DbSession, AdminUser
from app.schemas.project import (
    ProjectCreate, ProjectUpdate, ProjectResponse,
    ProjectBrief, ProjectListResponse
)
from app.services import project as project_service

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.get("/", response_model=ProjectListResponse)
def get_projects(
    db: DbSession,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    tag: str | None = None,
    category: str | None = None,
    featured: bool = False
):
    """Get published projects with pagination and filtering."""
    projects, total = project_service.get_projects(
        db,
        page=page,
        page_size=page_size,
        tag_slug=tag,
        category=category,
        featured_only=featured,
        include_drafts=False
    )
    
    return ProjectListResponse(
        items=[ProjectBrief.model_validate(p) for p in projects],
        total=total,
        page=page,
        page_size=page_size,
        pages=math.ceil(total / page_size) if total > 0 else 1
    )


@router.get("/admin", response_model=ProjectListResponse)
def get_all_projects(
    db: DbSession,
    admin: AdminUser,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    status: str | None = None,
    category: str | None = None
):
    """Get all projects including drafts (admin only)."""
    projects, total = project_service.get_projects(
        db,
        page=page,
        page_size=page_size,
        status=status,
        category=category,
        include_drafts=True
    )
    
    return ProjectListResponse(
        items=[ProjectBrief.model_validate(p) for p in projects],
        total=total,
        page=page,
        page_size=page_size,
        pages=math.ceil(total / page_size) if total > 0 else 1
    )


@router.get("/categories", response_model=List[str])
def get_project_categories(db: DbSession):
    """Get all unique project categories."""
    return project_service.get_categories(db)


@router.get("/slugs", response_model=List[str])
def get_project_slugs(db: DbSession):
    """Get all published project slugs for sitemap generation."""
    return project_service.get_all_published_slugs(db)


@router.get("/{slug}", response_model=ProjectResponse)
def get_project_by_slug(slug: str, db: DbSession):
    """Get a published project by slug."""
    project = project_service.get_published_project_by_slug(db, slug)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    return project


@router.get("/id/{project_id}", response_model=ProjectResponse)
def get_project_by_id(
    project_id: int,
    db: DbSession,
    admin: AdminUser
):
    """Get a project by ID (admin only, includes drafts)."""
    project = project_service.get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    return project


@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    project_data: ProjectCreate,
    db: DbSession,
    admin: AdminUser
):
    """Create a new project (admin only)."""
    return project_service.create_project(db, project_data)


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    project_data: ProjectUpdate,
    db: DbSession,
    admin: AdminUser
):
    """Update a project (admin only)."""
    project = project_service.update_project(db, project_id, project_data)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    return project


@router.post("/{project_id}/publish", response_model=ProjectResponse)
def publish_project(
    project_id: int,
    db: DbSession,
    admin: AdminUser
):
    """Publish a project (admin only)."""
    project = project_service.update_project(
        db, project_id,
        ProjectUpdate(status="published")
    )
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: int,
    db: DbSession,
    admin: AdminUser
):
    """Delete a project (admin only)."""
    if not project_service.delete_project(db, project_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
