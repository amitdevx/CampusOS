import re

file = 'backend/app/api/campus.py'
with open(file, 'r') as f:
    content = f.read()

# I need to add Notification import if not present
if "from ..models.notifications import Notification" not in content:
    content = content.replace("from ..models.campus import Event", "from ..models.notifications import Notification\nfrom ..models.user import User\nfrom ..models.campus import Event")

new_func = """@router.post("/notices", response_model=NoticeResponse)
def create_notice(notice: NoticeCreate, db: SessionDep, current_user: CurrentUser):
    if current_user.role not in ["FACULTY", "ADMIN", "SUPER_ADMIN"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    db_notice = Notice(**notice.model_dump(), author_id=current_user.id)
    db.add(db_notice)
    db.commit()
    db.refresh(db_notice)
    
    # Create persistent notifications for everyone
    users = db.query(User).all()
    notifs = []
    for u in users:
        notifs.append(Notification(user_id=u.id, title=db_notice.title, message="New Campus Notice: " + notice.content[:50], type="SYSTEM_ALERT"))
    
    if notifs:
        db.bulk_save_objects(notifs)
        db.commit()

    # Broadcast to all connected clients
    try:
        loop = asyncio.get_event_loop()
        loop.create_task(manager.broadcast({
            "type": "notification",
            "payload": {
                "title": db_notice.title,
                "message": "New Campus Notice: " + notice.content[:50],
                "type": "SYSTEM_ALERT"
            }
        }))
    except Exception as e:
        pass
        
    return db_notice
"""

# Replace existing
content = re.sub(r'@router\.post\("/notices".*?return db_notice', new_func, content, flags=re.DOTALL)

with open(file, 'w') as f:
    f.write(content)
