from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, UniqueConstraint
from sqlalchemy.orm import relationship
import datetime
from ..core.database import Base

class AttendanceSession(Base):
    __tablename__ = "attendance_sessions"
    id = Column(Integer, primary_key=True, index=True)
    class_session_id = Column(Integer, ForeignKey("class_sessions.id"))
    qr_code_secret = Column(String, nullable=True) # Used for dynamic QR validation
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    closed_at = Column(DateTime, nullable=True)
    
    # Relationships
    records = relationship("AttendanceRecord", back_populates="session", cascade="all, delete-orphan")

class AttendanceRecord(Base):
    __tablename__ = "attendance_records"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("attendance_sessions.id"))
    student_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String, default="PRESENT") # PRESENT, ABSENT, LATE
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    
    session = relationship("AttendanceSession", back_populates="records")

    __table_args__ = (
        UniqueConstraint('session_id', 'student_id', name='uix_session_student'),
    )
