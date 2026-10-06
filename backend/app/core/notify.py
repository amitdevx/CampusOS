import asyncio
import httpx
from typing import List
from sqlalchemy.orm import Session
from ..models.notifications import Notification
from ..models.user import User
from ..api.websockets import manager

async def send_notification(db: Session, user_ids: List[int], title: str, message: str, notif_type: str):
    push_messages = []
    
    for uid in set(user_ids):
        notif = Notification(user_id=uid, title=title, message=message, type=notif_type)
        db.add(notif)
        db.flush()
        
        ws_msg = {
            "type": "notification",
            "data": {
                "id": notif.id, "title": title, "message": message,
                "type": notif_type, "is_read": False, "created_at": notif.created_at.isoformat()
            }
        }
        
        # Isolate WebSocket failure (Ponytail: don't let WS crash DB commit)
        try:
            await manager.send_personal_message(ws_msg, uid)
        except Exception as e:
            print(f"WS error for user {uid}: {e}")
        
        user = db.query(User).filter(User.id == uid).first()
        # Expo push tokens always start with ExponentPushToken or ExpoPushToken
        if user and user.push_token and ("ExponentPushToken" in user.push_token or "ExpoPushToken" in user.push_token):
            push_messages.append({
                "to": user.push_token,
                "sound": "default", "title": title, "body": message,
                "data": {"notification_id": notif.id, "type": notif_type},
                "priority": "high"
            })
    
    db.commit()
    
    # Send Expo pushes in batches of 100 (Ponytail: chunks)
    if push_messages:
        async def _send():
            async with httpx.AsyncClient() as client:
                for i in range(0, len(push_messages), 100):
                    batch = push_messages[i:i+100]
                    try:
                        res = await client.post(
                            "https://exp.host/--/api/v2/push/send",
                            json=batch,
                            headers={"Accept": "application/json", "Content-Type": "application/json"}
                        )
                        res.raise_for_status()
                    except Exception as e:
                        print(f"Expo push error: {e}")
        # Run push sending in background to not block the request
        asyncio.create_task(_send())
