from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .deps import SessionDep, CurrentUser
from ..models.notifications import Notification
from ..schemas.notifications import NotificationResponse

router = APIRouter()

@router.get("/", response_model=List[NotificationResponse])
def get_my_notifications(db: SessionDep, current_user: CurrentUser):
    """
    Get all notifications for the currently logged-in user.
    """
    return db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).all()

@router.put("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_as_read(notification_id: int, db: SessionDep, current_user: CurrentUser):
    """
    Mark a specific notification as read.
    """
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification
