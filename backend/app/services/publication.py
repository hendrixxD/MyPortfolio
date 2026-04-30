"""
Publication service.
"""
from sqlalchemy.orm import Session
from typing import List

from app.models.publication import Publication
from app.schemas.publication import PublicationCreate, PublicationUpdate


def get_publications(
    db: Session,
    visible_only: bool = False,
    publication_type: str | None = None
) -> List[Publication]:
    """Get all publications with optional filters."""
    query = db.query(Publication)
    
    if visible_only:
        query = query.filter(Publication.is_visible == True)
    
    if publication_type:
        query = query.filter(Publication.publication_type == publication_type)
    
    return query.order_by(Publication.year.desc(), Publication.order.asc()).all()


def get_publication_by_id(db: Session, pub_id: int) -> Publication | None:
    """Get a publication by ID."""
    return db.query(Publication).filter(Publication.id == pub_id).first()


def create_publication(db: Session, pub_data: PublicationCreate) -> Publication:
    """Create a new publication."""
    pub = Publication(**pub_data.model_dump())
    db.add(pub)
    db.commit()
    db.refresh(pub)
    return pub


def update_publication(db: Session, pub_id: int, pub_data: PublicationUpdate) -> Publication | None:
    """Update a publication."""
    pub = get_publication_by_id(db, pub_id)
    if not pub:
        return None
    
    update_data = pub_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(pub, field, value)
    
    db.commit()
    db.refresh(pub)
    return pub


def delete_publication(db: Session, pub_id: int) -> bool:
    """Delete a publication."""
    pub = get_publication_by_id(db, pub_id)
    if not pub:
        return False
    
    db.delete(pub)
    db.commit()
    return True
