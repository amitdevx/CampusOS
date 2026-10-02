from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Any

from .deps import SessionDep, CurrentUser, get_current_active_admin
from ..core.security import verify_password, get_password_hash, create_access_token
from ..models.user import User
from ..schemas.user import UserCreate, UserResponse, Token

router = APIRouter()

@router.post("/login", response_model=Token)
def login_access_token(
    db: SessionDep, form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
    
    return {
        "access_token": create_access_token(user.id),
        "token_type": "bearer",
    }

@router.post("/register", response_model=UserResponse)
def register_user(
    *, db: SessionDep, user_in: UserCreate, current_admin: User = Depends(get_current_active_admin)
) -> Any:
    """
    Register a new user (Admin only).
    """
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    
    if user_in.role in ["SUPER_ADMIN", "ADMIN"] and current_admin.role != "SUPER_ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized to create admin accounts")

    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: CurrentUser) -> Any:
    """
    Get current user profile.
    """
    return current_user

from typing import List
from .deps import get_current_active_admin

@router.get("/users", response_model=List[UserResponse])
def get_all_users(db: SessionDep, current_user: CurrentUser) -> Any:
    """
    Get all users
    """
    if current_user.role == "STUDENT":
        raise HTTPException(status_code=403, detail="Students cannot list all users")
    return db.query(User).all()
