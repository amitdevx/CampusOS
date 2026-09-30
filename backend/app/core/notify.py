import asyncio
import httpx
from typing import List
from sqlalchemy.orm import Session
from ..models.notifications import Notification
from ..models.user import User
from ..api.websockets import manager

async def send_notification(db: Session, user_ids: List[int], title: str, message: str, notif_type: str):
    """
    Creates DB notification, pushes it via WebSockets, AND sends Expo Push Notification.
    """
    push_messages = []
    
    for uid in set(user_ids):
        # Create DB record
        notif = Notification(
            user_id=uid,
            title=title,
            message=message,
            type=notif_type
        )
        db.add(notif)
        db.flush() # get ID
        
        # 1. Send WebSocket msg (Foreground)
        ws_msg = {
            "type": "notification",
            "data": {
                "id": notif.id,
                "title": title,
                "message": message,
                "type": notif_type,
                "is_read": False,
                "created_at": notif.created_at.isoformat()
            }
        }
        await manager.send_personal_message(ws_msg, uid)
        
        # 2. Prepare Expo Push Notification (Background)
        user = db.query(User).filter(User.id == uid).first()
        if user and user.push_token:
            push_messages.append({
                "to": user.push_token,
                "sound": "default",
                "title": title,
                "body": message,
                "data": {"notification_id": notif.id, "type": notif_type}
            })
    
    db.commit()
    
    # Send batch push notifications via Expo API
    if push_messages:
        try:
            async with httpx.AsyncClient() as client:
                await client.post(
                    "https://exp.host/--/api/v2/push/send",
                    json=push_messages,
                    headers={"Accept": "application/json", "Accept-encoding": "gzip, deflate", "Content-Type": "application/json"}
                )
        except Exception as e:
            print(f"Failed to send push notifications: {e}")
