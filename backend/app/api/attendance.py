from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid
import datetime

from .deps import SessionDep, CurrentUser, get_current_teacher_or_admin, get_current_student
from ..models.attendance import AttendanceSession, AttendanceRecord
from ..models.timetable import ClassSession
from ..models.academic import Enrollment
from ..schemas.attendance import (
    AttendanceSessionCreate, AttendanceSessionResponse,
    AttendanceRecordCreate, AttendanceRecordResponse
)
from ..core.notify import send_notification

router = APIRouter()

@router.post("/sessions", response_model=AttendanceSessionResponse)
async def start_attendance_session(session: AttendanceSessionCreate, db: SessionDep, current_user=Depends(get_current_teacher_or_admin)):
    # Verify the class exists
    class_session = db.query(ClassSession).filter(ClassSession.id == session.class_session_id).first()
    if not class_session:
        raise HTTPException(status_code=404, detail="Class session not found")
        
    # Security: A teacher can only start a session for their own class
    if current_user.role == "TEACHER" and class_session.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to start attendance for another teacher's class")
    
    now = datetime.datetime.utcnow()
    # Time window validation: Can only start 30 mins before and up to 90 mins after class starts
    grace_before = datetime.timedelta(minutes=30)
    grace_after = datetime.timedelta(minutes=90)
    if now < (class_session.start_time - grace_before) or now > (class_session.end_time + grace_after):
        raise HTTPException(status_code=400, detail="Cannot start attendance outside the class schedule time window")

    # Close any currently active sessions for this class
    active_sessions = db.query(AttendanceSession).filter(
        AttendanceSession.class_session_id == session.class_session_id,
        AttendanceSession.is_active == True
    ).all()
    for active_s in active_sessions:
        active_s.is_active = False
        active_s.closed_at = now
    
    # Generate temporary QR secret for this session
    qr_secret = str(uuid.uuid4())
    
    expires_at = now + datetime.timedelta(minutes=session.duration_minutes or 60)
    
    db_session = AttendanceSession(
        class_session_id=session.class_session_id,
        is_active=True,
        qr_code_secret=qr_secret,
        expires_at=expires_at
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    
    # Notify students that attendance has started
    if class_session.division_id:
        enrollments = db.query(Enrollment).filter(Enrollment.division_id == class_session.division_id, Enrollment.status == "ACTIVE").all()
        student_ids = [e.student_id for e in enrollments]
        if student_ids:
            await send_notification(
                db, 
                student_ids, 
                "Attendance Started", 
                f"Attendance for your class in Room {class_session.room} is now active.", 
                "SYSTEM_ALERT"
            )

    return db_session

@router.post("/sessions/{session_id}/close", response_model=AttendanceSessionResponse)
def close_attendance_session(session_id: int, db: SessionDep, current_user=Depends(get_current_teacher_or_admin)):
    session = db.query(AttendanceSession).filter(AttendanceSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    class_session = db.query(ClassSession).filter(ClassSession.id == session.class_session_id).first()
    if current_user.role == "TEACHER" and class_session.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    session.is_active = False
    session.closed_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(session)
    return session

@router.post("/sessions/{session_id}/scan", response_model=AttendanceRecordResponse)
def scan_qr_attendance(session_id: int, record_in: AttendanceRecordCreate, db: SessionDep, current_user=Depends(get_current_student)):
    # Find session
    session = db.query(AttendanceSession).filter(AttendanceSession.id == session_id).first()
    if not session or not session.is_active:
        raise HTTPException(status_code=400, detail="Attendance session is not active or invalid")
        
    now = datetime.datetime.utcnow()
    if session.expires_at and now > session.expires_at:
        session.is_active = False
        session.closed_at = now
        db.commit()
        raise HTTPException(status_code=400, detail="QR Code has expired. Please ask your teacher to generate a new one.")
        
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

@router.get("/sessions/{session_id}/records", response_model=List[AttendanceRecordResponse])
def get_attendance_records(session_id: int, db: SessionDep, current_user=Depends(get_current_teacher_or_admin)):
    # Returns all records for a session
    records = db.query(AttendanceRecord).filter(AttendanceRecord.session_id == session_id).all()
    return records
