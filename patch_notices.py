import sys
import os

file = 'backend/app/api/campus.py'
with open(file, 'r') as f:
    content = f.read()

import_statement = "from .websockets import manager\nimport asyncio"
if "from .websockets import manager" not in content:
    content = content.replace("from fastapi import APIRouter, Depends, HTTPException", f"from fastapi import APIRouter, Depends, HTTPException\n{import_statement}")

new_notice_func = """@router.post("/notices", response_model=NoticeResponse)
def create_notice(notice: NoticeCreate, db: SessionDep, current_user: CurrentUser):
    if current_user.role not in ["FACULTY", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    db_notice = Notice(**notice.model_dump(), author_id=current_user.id)
    db.add(db_notice)
    db.commit()
    db.refresh(db_notice)
    
    # Broadcast to all connected clients
    try:
        loop = asyncio.get_event_loop()
        loop.create_task(manager.broadcast({
            "type": "NEW_NOTICE",
            "title": db_notice.title,
            "message": "A new notice was posted on the notice board."
        }))
    except Exception as e:
        pass
        
    return db_notice
"""

# Replace the existing function
import re
content = re.sub(r'@router\.post\("/notices", response_model=NoticeResponse\).*?db\.commit\(\)', new_notice_func, content, flags=re.DOTALL)

with open(file, 'w') as f:
    f.write(content)

