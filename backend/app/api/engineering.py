from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from .deps import SessionDep, get_current_active_admin
from ..models.engineering import AuditLog

router = APIRouter()

@router.get("/audit-logs", response_model=List[Dict[str, Any]])
def get_audit_logs(db: SessionDep, admin=Depends(get_current_active_admin), limit: int = 50):
    """
    Returns recent system audit logs for Super Admins.
    """
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()
    
    return [
        {
            "id": log.id,
            "user_id": log.user_id,
            "action": log.action,
            "resource": log.resource,
            "timestamp": log.timestamp,
            "ip_address": log.ip_address
        }
        for log in logs
    ]

# Utility function to be imported globally to log actions
def log_action(db: Session, user_id: int, action: str, resource: str = None, ip: str = None):
    new_log = AuditLog(
        user_id=user_id,
        action=action,
        resource=resource,
        ip_address=ip
    )
    db.add(new_log)
    db.commit()
