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

@router.get("/my-schedule", response_model=List[ClassSessionResponse])
def get_my_schedule(db: SessionDep, current_user: CurrentUser):
    """
    Get the schedule for the currently logged in user.
    If student, we would filter by their enrolled course/batch.
    If teacher, we filter by their assigned classes.
    """
    if current_user.role == "FACULTY" or current_user.role == "ADMIN":
        return db.query(ClassSession).filter(ClassSession.teacher_id == current_user.id).all()
    else:
        # Student logic requires batch/course mapping (part of Phase 2 extension)
        # Returning empty list for students until enrollment mapping is built
        return []
