import asyncio
from typing import List
from sqlalchemy.orm import Session
from ..models.notifications import Notification
from ..api.websockets import manager

async def send_notification(db: Session, user_ids: List[int], title: str, message: str, notif_type: str):
    """
    Creates DB notification and pushes it via WebSockets.
    """
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
        
        # Send WS msg
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
    
    db.commit()
