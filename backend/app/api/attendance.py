from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from .deps import SessionDep, CurrentUser
from ..models.attendance import AttendanceSession, AttendanceRecord
from ..schemas.attendance import (
    AttendanceSessionCreate, AttendanceSessionResponse,
    AttendanceRecordCreate, AttendanceRecordResponse
)

router = APIRouter()

@router.post("/sessions", response_model=AttendanceSessionResponse)
def start_attendance_session(session: AttendanceSessionCreate, db: SessionDep, current_user: CurrentUser):
    # Only faculty can start attendance
    if current_user.role not in ["FACULTY", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Not authorized to start attendance")
    
    # Generate temporary QR secret for this session
    qr_secret = str(uuid.uuid4())
    
    db_session = AttendanceSession(
        class_session_id=session.class_session_id,
        is_active=True,
        qr_code_secret=qr_secret
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

@router.post("/sessions/{session_id}/scan", response_model=AttendanceRecordResponse)
def scan_qr_attendance(session_id: int, record_in: AttendanceRecordCreate, db: SessionDep, current_user: CurrentUser):
    # Find session
    session = db.query(AttendanceSession).filter(AttendanceSession.id == session_id).first()
    if not session or not session.is_active:
        raise HTTPException(status_code=400, detail="Attendance session is not active or invalid")
    
    # Validate QR secret (prevent fake attendance)
    if session.qr_code_secret != record_in.qr_code_secret:
        raise HTTPException(status_code=400, detail="Invalid or expired QR code")
    
    # Prevent duplicate scans
    existing = db.query(AttendanceRecord).filter(
        AttendanceRecord.session_id == session_id,
        AttendanceRecord.student_id == current_user.id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Attendance already recorded")
    
    record = AttendanceRecord(
        session_id=session_id,
        student_id=current_user.id,
        status="PRESENT"
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record
