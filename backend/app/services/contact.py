"""
Contact service.
"""
from sqlalchemy.orm import Session
from typing import List, Tuple

from app.models.contact import ContactMessage
from app.schemas.contact import ContactCreate, ContactUpdate


def get_contact_messages(
    db: Session,
    page: int = 1,
    page_size: int = 20,
    unread_only: bool = False,
    include_spam: bool = False
) -> Tuple[List[ContactMessage], int]:
    """Get contact messages with pagination."""
    query = db.query(ContactMessage)
    
    if not include_spam:
        query = query.filter(ContactMessage.is_spam == False)
    
    if unread_only:
        query = query.filter(ContactMessage.is_read == False)
    
    total = query.count()
    
    messages = (
        query
        .order_by(ContactMessage.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    
    return messages, total


def get_contact_message_by_id(db: Session, msg_id: int) -> ContactMessage | None:
    """Get a contact message by ID."""
    return db.query(ContactMessage).filter(ContactMessage.id == msg_id).first()


def create_contact_message(
    db: Session,
    msg_data: ContactCreate,
    ip_address: str | None = None,
    user_agent: str | None = None
) -> ContactMessage:
    """Create a new contact message."""
    msg = ContactMessage(
        **msg_data.model_dump(),
        ip_address=ip_address,
        user_agent=user_agent
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg


def update_contact_message(db: Session, msg_id: int, msg_data: ContactUpdate) -> ContactMessage | None:
    """Update a contact message status."""
    msg = get_contact_message_by_id(db, msg_id)
    if not msg:
        return None
    
    update_data = msg_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(msg, field, value)
    
    db.commit()
    db.refresh(msg)
    return msg


def delete_contact_message(db: Session, msg_id: int) -> bool:
    """Delete a contact message."""
    msg = get_contact_message_by_id(db, msg_id)
    if not msg:
        return False
    
    db.delete(msg)
    db.commit()
    return True


def mark_as_read(db: Session, msg_id: int) -> ContactMessage | None:
    """Mark a message as read."""
    return update_contact_message(db, msg_id, ContactUpdate(is_read=True))


def mark_as_spam(db: Session, msg_id: int) -> ContactMessage | None:
    """Mark a message as spam."""
    return update_contact_message(db, msg_id, ContactUpdate(is_spam=True))


def get_unread_count(db: Session) -> int:
    """Get count of unread messages."""
    return (
        db.query(ContactMessage)
        .filter(ContactMessage.is_read == False)
        .filter(ContactMessage.is_spam == False)
        .count()
    )
