from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Attendance Session
class AttendanceSessionBase(BaseModel):
    class_session_id: int
    is_active: bool = True

class AttendanceSessionCreate(AttendanceSessionBase):
    duration_minutes: Optional[int] = 60 # Default 60 mins

class AttendanceSessionResponse(AttendanceSessionBase):
    id: int
    qr_code_secret: Optional[str] = None
    created_at: datetime
    expires_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None
    class Config:
        from_attributes = True

# Attendance Record
class AttendanceRecordBase(BaseModel):
    student_id: int
    status: str = "PRESENT"

class AttendanceRecordCreate(BaseModel):
    qr_code_secret: str # Used by student scanning the QR

class AttendanceRecordResponse(AttendanceRecordBase):
    id: int
    session_id: int
    timestamp: datetime
    class Config:
        from_attributes = True
