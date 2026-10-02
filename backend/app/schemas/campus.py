from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# --- Events ---
class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    event_date: datetime
    location: Optional[str] = None

class EventCreate(EventBase):
    pass

class EventResponse(EventBase):
    id: int
    organizer_id: int
    class Config:
        from_attributes = True

class EventRegistrationCreate(BaseModel):
    event_id: int

class EventRegistrationResponse(BaseModel):
    id: int
    event_id: int
    student_id: int
    registered_at: datetime
    class Config:
        from_attributes = True

# --- Resources & Booking ---
class ResourceBase(BaseModel):
    name: str
    type: str = "GENERAL"

class ResourceCreate(ResourceBase):
    pass


class ResourceResponse(ResourceBase):
    id: int
    class Config:
        from_attributes = True

class BookingBase(BaseModel):
    resource_id: int
    start_time: datetime
    end_time: datetime

class BookingCreate(BookingBase):
    pass

class BookingResponse(BookingBase):
    id: int
    user_id: int
    status: str
    class Config:
        from_attributes = True

# --- Notices ---
class NoticeBase(BaseModel):
    title: str
    content: str
    target_audience: str = "EVERYONE"

class NoticeCreate(NoticeBase):
    pass

class NoticeResponse(NoticeBase):
    id: int
    author_id: int
    created_at: datetime
    class Config:
        from_attributes = True
