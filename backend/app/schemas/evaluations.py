from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# Assignment
class AssignmentBase(BaseModel):
    subject_id: int
    title: str
    description: Optional[str] = None
    deadline: datetime

class AssignmentCreate(AssignmentBase):
    pass

class AssignmentResponse(AssignmentBase):
    id: int
    teacher_id: int
    created_at: datetime
    class Config:
        from_attributes = True

# Submission
class SubmissionBase(BaseModel):
    file_url: Optional[str] = None

class SubmissionCreate(SubmissionBase):
    pass

class SubmissionResponse(SubmissionBase):
    id: int
    assignment_id: int
    student_id: int
    submitted_at: datetime
    marks: Optional[int] = None
    feedback: Optional[str] = None
    class Config:
        from_attributes = True

# Exam
class ExamBase(BaseModel):
    subject_id: int
    title: str
    exam_date: datetime
    total_marks: int

class ExamCreate(ExamBase):
    pass

class ExamResponse(ExamBase):
    id: int
    class Config:
        from_attributes = True

# ExamMark
class ExamMarkBase(BaseModel):
    student_id: int
    marks_obtained: int

class ExamMarkCreate(ExamMarkBase):
    pass

class ExamMarkResponse(ExamMarkBase):
    id: int
    exam_id: int
    class Config:
        from_attributes = True

