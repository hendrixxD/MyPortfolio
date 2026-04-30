"""
Tag service.
"""
from sqlalchemy.orm import Session
from slugify import slugify
from typing import List

from app.models.tag import Tag
from app.schemas.tag import TagCreate, TagUpdate


def get_tags(
    db: Session,
    tag_type: str | None = None,
    skip: int = 0,
    limit: int = 100
) -> List[Tag]:
    """Get all tags with optional type filter."""
    query = db.query(Tag)
    
    if tag_type:
        query = query.filter(
            (Tag.tag_type == tag_type) | (Tag.tag_type == "both")
        )
    
    return query.offset(skip).limit(limit).all()


def get_tag_by_id(db: Session, tag_id: int) -> Tag | None:
    """Get a tag by ID."""
    return db.query(Tag).filter(Tag.id == tag_id).first()


def get_tag_by_slug(db: Session, slug: str) -> Tag | None:
    """Get a tag by slug."""
    return db.query(Tag).filter(Tag.slug == slug).first()


def create_tag(db: Session, tag_data: TagCreate) -> Tag:
    """Create a new tag."""
    # Generate slug if not provided
    slug = tag_data.slug or slugify(tag_data.name)
    
    # Ensure unique slug
    existing = get_tag_by_slug(db, slug)
    if existing:
        slug = f"{slug}-{db.query(Tag).count() + 1}"
    
    tag = Tag(
        name=tag_data.name,
        slug=slug,
        tag_type=tag_data.tag_type,
        color=tag_data.color
    )
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag


def update_tag(db: Session, tag_id: int, tag_data: TagUpdate) -> Tag | None:
    """Update a tag."""
    tag = get_tag_by_id(db, tag_id)
    if not tag:
        return None
    
    update_data = tag_data.model_dump(exclude_unset=True)
    
    # Update slug if name changed
    if "name" in update_data and "slug" not in update_data:
        update_data["slug"] = slugify(update_data["name"])
    
    for field, value in update_data.items():
        setattr(tag, field, value)
    
    db.commit()
    db.refresh(tag)
    return tag


def delete_tag(db: Session, tag_id: int) -> bool:
    """Delete a tag."""
    tag = get_tag_by_id(db, tag_id)
    if not tag:
        return False
    
    db.delete(tag)
    db.commit()
    return True
