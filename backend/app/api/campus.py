from fastapi import APIRouter, Depends, HTTPException
from .websockets import manager
import asyncio, status
from sqlalchemy.orm import Session
from typing import List

from .deps import SessionDep, CurrentUser
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


@router.get("/events/my-registrations", response_model=List[EventRegistrationResponse])
def get_my_event_registrations(db: SessionDep, current_user: CurrentUser):
    return db.query(EventRegistration).filter(EventRegistration.student_id == current_user.id).all()

@router.post("/events/register", response_model=EventRegistrationResponse)
def register_event(reg: EventRegistrationCreate, db: SessionDep, current_user: CurrentUser):
    existing = db.query(EventRegistration).filter(EventRegistration.event_id == reg.event_id, EventRegistration.student_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already registered")
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
    
    # Broadcast to all connected clients
    try:
        loop = asyncio.get_event_loop()
        loop.create_task(manager.broadcast({
            "type": "notification",
            "title": db_notice.title,
            "payload": "A new notice was posted on the notice board."
        }))
    except Exception as e:
        pass
        
    return db_notice

    db.refresh(db_notice)
    return db_notice

@router.get("/notices", response_model=List[NoticeResponse])
def get_notices(db: SessionDep, current_user: CurrentUser):
    return db.query(Notice).order_by(Notice.created_at.desc()).all()

# --- Resources & Booking ---
@router.post("/resources", response_model=ResourceResponse)
def create_resource(resource: ResourceCreate, db: SessionDep, current_user: CurrentUser):
    if current_user.role not in ["FACULTY", "ADMIN", "SUPER_ADMIN"]:
        raise HTTPException(status_code=403, detail="Not authorized to create resources")
    db_resource = Resource(**resource.model_dump())
    db.add(db_resource)
    db.commit()
    db.refresh(db_resource)
    return db_resource

@router.get("/resources", response_model=List[ResourceResponse])
def get_resources(db: SessionDep, current_user: CurrentUser):
    return db.query(Resource).all()

@router.delete("/resources/{resource_id}", status_code=204)
def delete_resource(resource_id: int, db: SessionDep, current_user: CurrentUser):
    if current_user.role not in ["FACULTY", "ADMIN", "SUPER_ADMIN"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete resources")
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    db.delete(resource)
    db.commit()


@router.post("/bookings", response_model=BookingResponse)
def book_resource(booking: BookingCreate, db: SessionDep, current_user: CurrentUser):
    # Conflict detection
    overlapping = db.query(Booking).filter(
        Booking.resource_id == booking.resource_id,
        Booking.status == "APPROVED",
        Booking.start_time < booking.end_time,
        Booking.end_time > booking.start_time
    ).first()
    
    if overlapping:
        raise HTTPException(status_code=400, detail="Resource is already booked during this time")
        
    db_booking = Booking(**booking.model_dump(), user_id=current_user.id)
    # Auto-approve for admins/faculty, PENDING for students
    if current_user.role in ["ADMIN", "SUPER_ADMIN", "FACULTY", "TEACHER"]:
        db_booking.status = "APPROVED"
        
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking

@router.get("/my-bookings", response_model=List[BookingResponse])
def get_my_bookings(db: SessionDep, current_user: CurrentUser):
    return db.query(Booking).filter(Booking.user_id == current_user.id).order_by(Booking.start_time.asc()).all()
