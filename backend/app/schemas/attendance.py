from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Attendance Session
class AttendanceSessionBase(BaseModel):
    class_session_id: int
    is_active: bool = True

class AttendanceSessionCreate(AttendanceSessionBase):
    pass

class AttendanceSessionResponse(AttendanceSessionBase):
    id: int
    qr_code_secret: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

# Attendance Record
class AttendanceRecordBase(BaseModel):
    student_id: int
    status: str = "PRESENT"

class AttendanceRecordCreate(AttendanceRecordBase):
    qr_code_secret: Optional[str] = None # Used by student scanning the QR

class AttendanceRecordResponse(AttendanceRecordBase):
    id: int
    session_id: int
    timestamp: datetime
    class Config:
        from_attributes = True
