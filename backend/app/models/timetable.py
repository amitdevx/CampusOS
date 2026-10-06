from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from ..core.database import Base

class ClassSession(Base):
    __tablename__ = "class_sessions"

    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), index=True)
    division_id = Column(Integer, ForeignKey("divisions.id"), index=True, nullable=True) # Which batch/division is this class for
    room = Column(String, nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    
    teacher_id = Column(Integer, ForeignKey("users.id"), index=True)
    
    teacher = relationship("User", back_populates="classes")
    subject_ref = relationship("Subject", back_populates="classes")
    division = relationship("Division", back_populates="classes")
