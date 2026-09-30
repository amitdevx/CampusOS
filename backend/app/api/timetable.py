from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List

from .deps import SessionDep, get_current_active_admin, CurrentUser
from ..models.timetable import ClassSession
from ..models.academic import Enrollment, Division
from ..schemas.academic import ClassSessionCreate, ClassSessionResponse
from ..core.notify import send_notification

router = APIRouter()

@router.post("/", response_model=ClassSessionResponse, status_code=status.HTTP_201_CREATED)
async def create_class_session(session: ClassSessionCreate, db: SessionDep, admin=Depends(get_current_active_admin)):
    # Conflict detection logic (Phase 5)
    overlapping = db.query(ClassSession).filter(
        ClassSession.start_time < session.end_time,
        ClassSession.end_time > session.start_time
    ).filter(
        (ClassSession.teacher_id == session.teacher_id) |
        (ClassSession.room == session.room) |
        (ClassSession.division_id == session.division_id)
    ).first()
    
    if overlapping:
        if overlapping.teacher_id == session.teacher_id:
            raise HTTPException(status_code=400, detail="Teacher already has a class at this time")
        if overlapping.room == session.room:
            raise HTTPException(status_code=400, detail="Room is already booked at this time")
        if overlapping.division_id == session.division_id:
            raise HTTPException(status_code=400, detail="Division already has a class at this time")

    db_session = ClassSession(**session.model_dump())
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    
    # Notify Students (Phase 6)
    enrollments = db.query(Enrollment).filter(Enrollment.division_id == session.division_id, Enrollment.status == "ACTIVE").all()
    student_ids = [e.student_id for e in enrollments]
    if student_ids:
        await send_notification(
            db, 
            student_ids, 
            "New Class Scheduled", 
            f"A new class has been scheduled in Room {session.room}.", 
            "TIMETABLE_CHANGE"
        )
    
    return db_session

@router.get("/", response_model=List[ClassSessionResponse])
def get_class_sessions(db: SessionDep, current_user: CurrentUser):
    # Depending on role, we could filter here. For now, return all or implement basic filters.
    return db.query(ClassSession).all()

from ..models.academic import Enrollment

@router.get("/my-schedule", response_model=List[ClassSessionResponse])
def get_my_schedule(db: SessionDep, current_user: CurrentUser):
    """
    Get the schedule for the currently logged in user.
    """
    if current_user.role in ["FACULTY", "ADMIN", "TEACHER"]:
        return db.query(ClassSession).filter(ClassSession.teacher_id == current_user.id).all()
    elif current_user.role == "STUDENT":
        # Find student's active enrollments
        enrollments = db.query(Enrollment).filter(
            Enrollment.student_id == current_user.id,
            Enrollment.status == "ACTIVE"
        ).all()
        
        if not enrollments:
            return []
            
        division_ids = [e.division_id for e in enrollments if e.division_id is not None]
        
        if not division_ids:
            return []
            
        return db.query(ClassSession).filter(ClassSession.division_id.in_(division_ids)).all()
    else:
        return []
