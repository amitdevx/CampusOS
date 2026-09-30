from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from .deps import SessionDep, CurrentUser, get_current_teacher_or_admin, get_current_student
from ..models.attendance import AttendanceSession, AttendanceRecord
from ..models.timetable import ClassSession
from ..models.academic import Enrollment
from ..schemas.attendance import (
    AttendanceSessionCreate, AttendanceSessionResponse,
    AttendanceRecordCreate, AttendanceRecordResponse
)

router = APIRouter()

@router.post("/sessions", response_model=AttendanceSessionResponse)
def start_attendance_session(session: AttendanceSessionCreate, db: SessionDep, current_user=Depends(get_current_teacher_or_admin)):
    # Verify the class exists
    class_session = db.query(ClassSession).filter(ClassSession.id == session.class_session_id).first()
    if not class_session:
        raise HTTPException(status_code=404, detail="Class session not found")
        
    # Security: A teacher can only start a session for their own class
    if current_user.role == "TEACHER" and class_session.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to start attendance for another teacher's class")
        
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
def scan_qr_attendance(session_id: int, record_in: AttendanceRecordCreate, db: SessionDep, current_user=Depends(get_current_student)):
    # Find session
    session = db.query(AttendanceSession).filter(AttendanceSession.id == session_id).first()
    if not session or not session.is_active:
        raise HTTPException(status_code=400, detail="Attendance session is not active or invalid")
        
    class_session = db.query(ClassSession).filter(ClassSession.id == session.class_session_id).first()
    if not class_session:
        raise HTTPException(status_code=400, detail="Associated class session not found")
    
    # Validate Enrollment: Is the student actually in this division?
    if class_session.division_id is not None:
        enrollment = db.query(Enrollment).filter(
            Enrollment.student_id == current_user.id,
            Enrollment.division_id == class_session.division_id,
            Enrollment.status == "ACTIVE"
        ).first()
        if not enrollment:
            raise HTTPException(status_code=403, detail="You are not enrolled in this class's division")
    
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
