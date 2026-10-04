from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session, joinedload
from typing import List
from datetime import datetime

from .deps import SessionDep, get_current_faculty_or_admin, CurrentUser
from ..models.timetable import ClassSession
from ..models.academic import Enrollment, Division, Subject
from ..models.user import User
from ..schemas.academic import ClassSessionCreate, ClassSessionResponse
from ..core.notify import send_notification

router = APIRouter()


def _resolve_session(session: ClassSession) -> ClassSessionResponse:
    """Build a ClassSessionResponse with resolved display names."""
    data = ClassSessionResponse(
        id=session.id,
        subject_id=session.subject_id,
        division_id=session.division_id,
        room=session.room,
        start_time=session.start_time,
        end_time=session.end_time,
        teacher_id=session.teacher_id,
        # Resolved names via relationships
        subject_name=session.subject_ref.name if session.subject_ref else None,
        subject_code=session.subject_ref.code if session.subject_ref else None,
        teacher_name=session.teacher.full_name if session.teacher else None,
        division_name=session.division.name if session.division else None,
    )
    return data


def _query_with_joins(db: Session):
    """Return a query that eagerly loads subject, teacher, and division."""
    return db.query(ClassSession).options(
        joinedload(ClassSession.subject_ref),
        joinedload(ClassSession.teacher),
        joinedload(ClassSession.division),
    )


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_class_session(
    session: ClassSessionCreate,
    db: SessionDep,
    current_user=Depends(get_current_faculty_or_admin),
):
    """
    Create a new class session.
    Allowed roles: FACULTY, ADMIN, SUPER_ADMIN.
    Faculty may only schedule classes for their department (enforced at API level).
    Returns a structured 409 with conflicting class details when a conflict is detected.
    """
    # Validate times
    now = datetime.utcnow()
    if session.start_time.tzinfo is not None:
        from datetime import timezone
        now = datetime.now(timezone.utc)
        
    if session.end_time <= session.start_time:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="end_time must be after start_time",
        )
    if session.start_time < now:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Cannot schedule a class in the past",
        )

    # Conflict detection — teacher, room, OR division overlap
    overlapping: ClassSession = (
        _query_with_joins(db)
        .filter(
            ClassSession.start_time < session.end_time,
            ClassSession.end_time > session.start_time,
        )
        .filter(
            (ClassSession.teacher_id == session.teacher_id)
            | (ClassSession.room == session.room)
            | (ClassSession.division_id == session.division_id)
        )
        .first()
    )

    if overlapping:
        # Determine conflict reason and build structured detail
        if overlapping.teacher_id == session.teacher_id:
            reason = "Teacher already has a class at this time"
        elif overlapping.room == session.room:
            reason = "Room is already booked at this time"
        else:
            reason = "Division already has a class at this time"

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "message": reason,
                "conflict": {
                    "subject": overlapping.subject_ref.name if overlapping.subject_ref else None,
                    "teacher": overlapping.teacher.full_name if overlapping.teacher else None,
                    "division": overlapping.division.name if overlapping.division else None,
                    "room": overlapping.room,
                    "start": overlapping.start_time.isoformat() if overlapping.start_time else None,
                    "end": overlapping.end_time.isoformat() if overlapping.end_time else None,
                },
            },
        )

    db_session = ClassSession(**session.model_dump())
    db.add(db_session)
    db.commit()
    db.refresh(db_session)

    # Reload with joins so we can resolve names
    created = _query_with_joins(db).filter(ClassSession.id == db_session.id).first()

    # Notify enrolled students about the new class
    enrollments = (
        db.query(Enrollment)
        .filter(
            Enrollment.division_id == session.division_id,
            Enrollment.status == "ACTIVE",
        )
        .all()
    )
    student_ids = [e.student_id for e in enrollments]
    if student_ids:
        subject_label = created.subject_ref.name if created and created.subject_ref else "a subject"
        await send_notification(
            db,
            student_ids,
            "New Class Scheduled",
            f"A new class for {subject_label} has been scheduled in Room {session.room}.",
            "TIMETABLE_CHANGE",
        )

    return _resolve_session(created)


@router.get("/", response_model=List[ClassSessionResponse])
def get_class_sessions(db: SessionDep, current_user: CurrentUser):
    """
    Return class sessions scoped by role:
    - STUDENT  → only sessions for their enrolled division(s)
    - TEACHER  → only sessions assigned to them
    - FACULTY / ADMIN / SUPER_ADMIN → all sessions
    """
    base_q = _query_with_joins(db)

    if current_user.role == "STUDENT":
        enrollments = (
            db.query(Enrollment)
            .filter(
                Enrollment.student_id == current_user.id,
                Enrollment.status == "ACTIVE",
            )
            .all()
        )
        division_ids = [e.division_id for e in enrollments if e.division_id]
        if not division_ids:
            return []
        sessions = base_q.filter(ClassSession.division_id.in_(division_ids)).all()
    elif current_user.role == "TEACHER":
        sessions = base_q.filter(ClassSession.teacher_id == current_user.id).all()
    else:
        # FACULTY, ADMIN, SUPER_ADMIN — all sessions
        sessions = base_q.all()

    return [_resolve_session(s) for s in sessions]


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_class_session(
    session_id: int,
    db: SessionDep,
    current_user=Depends(get_current_faculty_or_admin),
):
    """Cancel (delete) a scheduled class session. Allowed: FACULTY, ADMIN, SUPER_ADMIN."""
    session = db.query(ClassSession).filter(ClassSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Class session not found")
    db.delete(session)
    db.commit()


@router.get("/my-schedule", response_model=List[ClassSessionResponse])
def get_my_schedule(db: SessionDep, current_user: CurrentUser):
    """
    Get the schedule for the currently logged-in user.
    - Teachers/Faculty/Admin → their assigned sessions
    - Students → sessions for their enrolled divisions
    """
    base_q = _query_with_joins(db)

    if current_user.role in ["FACULTY", "ADMIN", "TEACHER", "SUPER_ADMIN"]:
        sessions = base_q.filter(ClassSession.teacher_id == current_user.id).all()
    elif current_user.role == "STUDENT":
        enrollments = (
            db.query(Enrollment)
            .filter(
                Enrollment.student_id == current_user.id,
                Enrollment.status == "ACTIVE",
            )
            .all()
        )
        division_ids = [e.division_id for e in enrollments if e.division_id]
        if not division_ids:
            return []
        sessions = base_q.filter(ClassSession.division_id.in_(division_ids)).all()
    else:
        return []

    # Filter to next 7 days
    now = datetime.datetime.utcnow()
    next_week = now + datetime.timedelta(days=7)
    
    filtered_sessions = [
        s for s in sessions 
        if s.start_time >= now.replace(hour=0, minute=0, second=0) 
        and s.start_time <= next_week
    ]

    return [_resolve_session(s) for s in filtered_sessions]
