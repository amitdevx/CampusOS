from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .deps import SessionDep, get_current_active_admin, CurrentUser
from ..models.timetable import ClassSession
from ..schemas.academic import ClassSessionCreate, ClassSessionResponse

router = APIRouter()

@router.post("/", response_model=ClassSessionResponse, status_code=status.HTTP_201_CREATED)
def create_class_session(session: ClassSessionCreate, db: SessionDep, admin=Depends(get_current_active_admin)):
    db_session = ClassSession(**session.model_dump())
    
    # Conflict detection logic could be added here (Phase 5/6)
    
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
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
