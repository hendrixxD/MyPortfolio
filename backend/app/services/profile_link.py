"""
ProfileLink service.
"""
from sqlalchemy.orm import Session
from typing import List

from app.models.profile_link import ProfileLink
from app.schemas.profile_link import ProfileLinkCreate, ProfileLinkUpdate


def get_profile_links(db: Session, visible_only: bool = False) -> List[ProfileLink]:
    """Get all profile links."""
    query = db.query(ProfileLink)
    
    if visible_only:
        query = query.filter(ProfileLink.is_visible == True)
    
    return query.order_by(ProfileLink.order.asc()).all()


def get_profile_link_by_id(db: Session, link_id: int) -> ProfileLink | None:
    """Get a profile link by ID."""
    return db.query(ProfileLink).filter(ProfileLink.id == link_id).first()


def create_profile_link(db: Session, link_data: ProfileLinkCreate) -> ProfileLink:
    """Create a new profile link."""
    link = ProfileLink(**link_data.model_dump())
    db.add(link)
    db.commit()
    db.refresh(link)
    return link


def update_profile_link(db: Session, link_id: int, link_data: ProfileLinkUpdate) -> ProfileLink | None:
    """Update a profile link."""
    link = get_profile_link_by_id(db, link_id)
    if not link:
        return None
    
    update_data = link_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(link, field, value)
    
    db.commit()
    db.refresh(link)
    return link


def delete_profile_link(db: Session, link_id: int) -> bool:
    """Delete a profile link."""
    link = get_profile_link_by_id(db, link_id)
    if not link:
        return False
    
    db.delete(link)
    db.commit()
    return True
