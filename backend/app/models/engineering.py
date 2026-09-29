from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
import datetime
from ..core.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Could be system action
    action = Column(String, nullable=False) # e.g. "USER_LOGIN", "TIMETABLE_CREATED"
    resource = Column(String, nullable=True) # e.g. "/api/v1/timetable"
    details = Column(Text, nullable=True) # JSON or descriptive string
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    ip_address = Column(String, nullable=True)
    
    user = relationship("User")
