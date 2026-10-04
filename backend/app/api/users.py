from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any, List, Optional

from .deps import SessionDep, get_current_active_admin
from ..models.user import User
from ..schemas.user import UserResponse, UserCreate, UserUpdate
from ..core.security import get_password_hash

router = APIRouter()

@router.get("/", response_model=List[UserResponse])
def read_users(
    db: SessionDep,
    skip: int = 0,
    limit: int = 100,
    current_admin: User = Depends(get_current_active_admin),
) -> Any:
    """
    Retrieve users (Admin only).
    """
    query = db.query(User)
    if current_admin.role != "SUPER_ADMIN":
        query = query.filter(User.role.in_(["STUDENT", "TEACHER", "FACULTY"]))
    return query.offset(skip).limit(limit).all()

@router.delete("/{user_id}", response_model=UserResponse)
def delete_user(
    *,
    db: SessionDep,
    user_id: int,
    current_admin: User = Depends(get_current_active_admin),
) -> Any:
    """
    Delete a user (Admin only).
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_admin.id:
        raise HTTPException(status_code=400, detail="Admins cannot delete themselves")
    
    if current_admin.role != "SUPER_ADMIN" and user.role in ["ADMIN", "SUPER_ADMIN"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete admin users")

    # Soft delete to preserve historical records (attendance, classes, bookings)
    user.role = "DEACTIVATED"
    # Also invalidate their push token so they stop receiving background notifications
    user.push_token = None
    db.commit()
    db.refresh(user)
    return user

from pydantic import BaseModel
from .deps import CurrentUser

class RoleUpdate(BaseModel):
    role: str

@router.put("/{user_id}/role", response_model=UserResponse)
def update_user_role(
    *,
    db: SessionDep,
    user_id: int,
    role_update: RoleUpdate,
    current_admin: User = Depends(get_current_active_admin),
) -> Any:
    """
    Update a user's role.
    """
    if current_admin.role != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="Only SUPER_ADMIN can change roles")
        
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user.id == current_admin.id:
        raise HTTPException(status_code=400, detail="Cannot change your own role")
        
    valid_roles = ["STUDENT", "TEACHER", "FACULTY", "ADMIN", "SUPER_ADMIN"]
    if role_update.role not in valid_roles:
        raise HTTPException(status_code=400, detail="Invalid role specified")

    user.role = role_update.role
    db.commit()
    db.refresh(user)
    return user

class PushTokenUpdate(BaseModel):
    push_token: Optional[str] = None

@router.post("/push-token")
def update_push_token(
    *,
    db: SessionDep,
    token_update: PushTokenUpdate,
    current_user: CurrentUser,
):
    """
    Save Expo push token for real-time offline notifications (Phase 9).
    """
    current_user.push_token = token_update.push_token
    db.commit()
    return {"status": "ok"}
