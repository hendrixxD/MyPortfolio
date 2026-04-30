"""
Publication endpoints.
"""
from typing import List
from fastapi import APIRouter, HTTPException, status

from app.api.deps import DbSession, AdminUser
from app.schemas.publication import PublicationCreate, PublicationUpdate, PublicationResponse
from app.services import publication as publication_service

router = APIRouter(prefix="/publications", tags=["Publications"])


@router.get("/", response_model=List[PublicationResponse])
def get_publications(
    db: DbSession,
    publication_type: str | None = None
):
    """Get all visible publications with optional type filter."""
    return publication_service.get_publications(
        db,
        visible_only=True,
        publication_type=publication_type
    )


@router.get("/all", response_model=List[PublicationResponse])
def get_all_publications(
    db: DbSession,
    admin: AdminUser
):
    """Get all publications including hidden (admin only)."""
    return publication_service.get_publications(db, visible_only=False)


@router.get("/{pub_id}", response_model=PublicationResponse)
def get_publication(pub_id: int, db: DbSession):
    """Get a specific publication."""
    pub = publication_service.get_publication_by_id(db, pub_id)
    if not pub:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Publication not found"
        )
    return pub


@router.post("/", response_model=PublicationResponse, status_code=status.HTTP_201_CREATED)
def create_publication(
    pub_data: PublicationCreate,
    db: DbSession,
    admin: AdminUser
):
    """Create a new publication (admin only)."""
    return publication_service.create_publication(db, pub_data)


@router.put("/{pub_id}", response_model=PublicationResponse)
def update_publication(
    pub_id: int,
    pub_data: PublicationUpdate,
    db: DbSession,
    admin: AdminUser
):
    """Update a publication (admin only)."""
    pub = publication_service.update_publication(db, pub_id, pub_data)
    if not pub:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Publication not found"
        )
    return pub


@router.delete("/{pub_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_publication(
    pub_id: int,
    db: DbSession,
    admin: AdminUser
):
    """Delete a publication (admin only)."""
    if not publication_service.delete_publication(db, pub_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Publication not found"
        )
