from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .deps import SessionDep, CurrentUser, get_current_active_admin
from ..models.campus import Event, EventRegistration, Resource, Booking, Notice
from ..schemas.campus import (
    EventCreate, EventResponse,
    EventRegistrationCreate, EventRegistrationResponse,
    ResourceCreate, ResourceResponse,
    BookingCreate, BookingResponse,
    NoticeCreate, NoticeResponse
)

router = APIRouter()

# --- Events ---
@router.post("/events", response_model=EventResponse)
def create_event(event: EventCreate, db: SessionDep, current_user: CurrentUser):
    if current_user.role not in ["FACULTY", "ADMIN", "SUPER_ADMIN"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    db_event = Event(**event.model_dump(), organizer_id=current_user.id)
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@router.get("/events", response_model=List[EventResponse])
def get_events(db: SessionDep, current_user: CurrentUser):
    return db.query(Event).order_by(Event.event_date.asc()).all()

@router.post("/events/register", response_model=EventRegistrationResponse)
def register_event(reg: EventRegistrationCreate, db: SessionDep, current_user: CurrentUser):
    db_reg = EventRegistration(**reg.model_dump(), student_id=current_user.id)
    db.add(db_reg)
    db.commit()
    db.refresh(db_reg)
    return db_reg

# --- Notices ---
@router.post("/notices", response_model=NoticeResponse)
def create_notice(notice: NoticeCreate, db: SessionDep, current_user: CurrentUser):
    if current_user.role not in ["FACULTY", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    db_notice = Notice(**notice.model_dump(), author_id=current_user.id)
    db.add(db_notice)
    db.commit()
    db.refresh(db_notice)
    return db_notice

@router.get("/notices", response_model=List[NoticeResponse])
def get_notices(db: SessionDep, current_user: CurrentUser):
    return db.query(Notice).order_by(Notice.created_at.desc()).all()
