from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
import datetime
from ..core.database import Base

class Assignment(Base):
    __tablename__ = "assignments"
    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), index=True)
    division_id = Column(Integer, ForeignKey("divisions.id"), index=True, nullable=True)
    teacher_id = Column(Integer, ForeignKey("users.id"), index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    deadline = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    submissions = relationship("Submission", back_populates="assignment", cascade="all, delete-orphan")

class Submission(Base):
    __tablename__ = "submissions"
    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id"), index=True)
    student_id = Column(Integer, ForeignKey("users.id"), index=True)
    file_url = Column(String, nullable=True)
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow)
    marks = Column(Integer, nullable=True)
    feedback = Column(Text, nullable=True)
    
    assignment = relationship("Assignment", back_populates="submissions")

class Exam(Base):
    __tablename__ = "exams"
    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), index=True)
    division_id = Column(Integer, ForeignKey("divisions.id"), index=True, nullable=True)
    title = Column(String, nullable=False)
    exam_date = Column(DateTime, nullable=False)
    total_marks = Column(Integer, nullable=False)
    
    marks = relationship("ExamMark", back_populates="exam", cascade="all, delete-orphan")

class ExamMark(Base):
    __tablename__ = "exam_marks"
    id = Column(Integer, primary_key=True, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id"), index=True)
    student_id = Column(Integer, ForeignKey("users.id"), index=True)
    marks_obtained = Column(Integer, nullable=False)
    
    exam = relationship("Exam", back_populates="marks")
