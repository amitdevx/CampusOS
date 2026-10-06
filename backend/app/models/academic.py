from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from ..core.database import Base

class Department(Base):
    __tablename__ = "departments"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    code = Column(String, nullable=False, unique=True)
    
    courses = relationship("Course", back_populates="department", cascade="all, delete-orphan")

class Course(Base):
    __tablename__ = "courses"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), index=True)
    
    department = relationship("Department", back_populates="courses")
    subjects = relationship("Subject", back_populates="course", cascade="all, delete-orphan")

class Subject(Base):
    __tablename__ = "subjects"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    code = Column(String, nullable=False, unique=True)
    semester = Column(Integer, nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), index=True)
    
    course = relationship("Course", back_populates="subjects")
    classes = relationship("ClassSession", back_populates="subject_ref")

class Batch(Base):
    __tablename__ = "batches"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False) # e.g. "Batch 2024-2028"
    course_id = Column(Integer, ForeignKey("courses.id"), index=True)
    start_year = Column(Integer, nullable=False)
    end_year = Column(Integer, nullable=False)
    
    divisions = relationship("Division", back_populates="batch", cascade="all, delete-orphan")

class Division(Base):
    __tablename__ = "divisions"
    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(Integer, ForeignKey("batches.id"), index=True)
    name = Column(String, nullable=False) # e.g. "A", "B"
    
    batch = relationship("Batch", back_populates="divisions")
    enrollments = relationship("Enrollment", back_populates="division", cascade="all, delete-orphan")
    classes = relationship("ClassSession", back_populates="division")

class Enrollment(Base):
    __tablename__ = "enrollments"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), index=True)
    division_id = Column(Integer, ForeignKey("divisions.id"), index=True)
    status = Column(String, default="ACTIVE") # ACTIVE, DROPPED, GRADUATED
    
    division = relationship("Division", back_populates="enrollments")
