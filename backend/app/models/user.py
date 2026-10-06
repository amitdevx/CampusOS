from sqlalchemy import Column, Integer, String, Enum, ForeignKey
from sqlalchemy.orm import relationship
import enum
from ..core.database import Base

class UserRole(str, enum.Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    ADMIN = "ADMIN"
    FACULTY = "FACULTY"
    TEACHER = "TEACHER"
    STUDENT = "STUDENT"
    DEACTIVATED = "DEACTIVATED"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, default=UserRole.STUDENT.value, nullable=False)
    push_token = Column(String, nullable=True)

    # Relationships
    classes = relationship("ClassSession", back_populates="teacher")
    student_profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    staff_profile = relationship("StaffProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")

class StudentProfile(Base):
    __tablename__ = "student_profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, unique=True)
    enrollment_number = Column(String, unique=True, index=True, nullable=False)
    current_semester = Column(Integer, nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id"), index=True, nullable=True)
    batch_id = Column(Integer, ForeignKey("batches.id"), index=True, nullable=True)
    
    user = relationship("User", back_populates="student_profile")
    # relationships to Batch and Dept can be added if needed

class StaffProfile(Base):
    __tablename__ = "staff_profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, unique=True)
    employee_id = Column(String, unique=True, index=True, nullable=False)
    designation = Column(String, nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id"), index=True, nullable=True)
    
    user = relationship("User", back_populates="staff_profile")
