from pydantic import BaseModel, EmailStr
from typing import Optional
from ..models.user import UserRole

# Shared properties
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole = UserRole.STUDENT

# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str

# Properties to receive via API on update
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None
    role: Optional[UserRole] = None

# Properties to return to client
class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True

# Token response
class Token(BaseModel):
    access_token: str
    token_type: str
