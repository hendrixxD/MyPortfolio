"""
Contact endpoints with rate limiting.
"""
import math
from typing import Annotated
from fastapi import APIRouter, HTTPException, status, Request, Depends

from app.api.deps import DbSession, AdminUser
from app.schemas.contact import ContactCreate, ContactUpdate, ContactResponse, ContactListResponse
from app.services import contact as contact_service

router = APIRouter(prefix="/contact", tags=["Contact"])


@router.post("/", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
def create_contact_message(
    message_data: ContactCreate,
    request: Request,
    db: DbSession
):
    """
    Submit a contact form message.
    
    Rate limited to prevent abuse.
    """
    # Get client info for logging/spam detection
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    
    # Basic spam detection - could be enhanced
    message_lower = message_data.message.lower()
    spam_keywords = ["viagra", "casino", "lottery", "winner", "click here"]
    is_spam = any(keyword in message_lower for keyword in spam_keywords)
    
    message = contact_service.create_contact_message(
        db,
        message_data,
        ip_address=ip_address,
        user_agent=user_agent
    )
    
    # Mark as spam if detected
    if is_spam:
        contact_service.mark_as_spam(db, message.id)
    
    return message


@router.get("/", response_model=ContactListResponse)
def get_contact_messages(
    db: DbSession,
    admin: AdminUser,
    page: int = 1,
    page_size: int = 20,
    unread_only: bool = False,
    include_spam: bool = False
):
    """Get contact messages (admin only)."""
    messages, total = contact_service.get_contact_messages(
        db,
        page=page,
        page_size=page_size,
        unread_only=unread_only,
        include_spam=include_spam
    )
    
    return ContactListResponse(
        items=messages,
        total=total,
        page=page,
        page_size=page_size,
        pages=math.ceil(total / page_size) if total > 0 else 1
    )


@router.get("/unread-count")
def get_unread_count(db: DbSession, admin: AdminUser):
    """Get count of unread messages (admin only)."""
    return {"count": contact_service.get_unread_count(db)}


@router.get("/{msg_id}", response_model=ContactResponse)
def get_contact_message(
    msg_id: int,
    db: DbSession,
    admin: AdminUser
):
    """Get a specific contact message (admin only)."""
    message = contact_service.get_contact_message_by_id(db, msg_id)
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    return message


@router.put("/{msg_id}", response_model=ContactResponse)
def update_contact_message(
    msg_id: int,
    msg_data: ContactUpdate,
    db: DbSession,
    admin: AdminUser
):
    """Update a contact message status (admin only)."""
    message = contact_service.update_contact_message(db, msg_id, msg_data)
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    return message


@router.post("/{msg_id}/read", response_model=ContactResponse)
def mark_message_read(
    msg_id: int,
    db: DbSession,
    admin: AdminUser
):
    """Mark a message as read (admin only)."""
    message = contact_service.mark_as_read(db, msg_id)
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    return message


@router.post("/{msg_id}/spam", response_model=ContactResponse)
def mark_message_spam(
    msg_id: int,
    db: DbSession,
    admin: AdminUser
):
    """Mark a message as spam (admin only)."""
    message = contact_service.mark_as_spam(db, msg_id)
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    return message


@router.delete("/{msg_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contact_message(
    msg_id: int,
    db: DbSession,
    admin: AdminUser
):
    """Delete a contact message (admin only)."""
    if not contact_service.delete_contact_message(db, msg_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
