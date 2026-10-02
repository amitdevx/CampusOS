from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# --- Department ---
class DepartmentBase(BaseModel):
    name: str
    code: str

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentResponse(DepartmentBase):
    id: int
    class Config:
        from_attributes = True

# --- Course ---
class CourseBase(BaseModel):
    name: str
    department_id: int

class CourseCreate(CourseBase):
    pass

class CourseResponse(CourseBase):
    id: int
    department: DepartmentResponse
    class Config:
        from_attributes = True

# --- Subject ---
class SubjectBase(BaseModel):
    name: str
    code: str
    semester: int
    course_id: int

class SubjectCreate(SubjectBase):
    pass

class SubjectResponse(SubjectBase):
    id: int
    course: CourseResponse
    class Config:
        from_attributes = True

# --- Timetable / ClassSession ---
class ClassSessionBase(BaseModel):
    subject_id: int
    division_id: int
    room: str
    start_time: datetime
    end_time: datetime
    teacher_id: int

class ClassSessionCreate(ClassSessionBase):
    pass

class ConflictDetail(BaseModel):
    """Structured detail returned in a 409 conflict error."""
    subject: Optional[str] = None
    teacher: Optional[str] = None
    division: Optional[str] = None
    room: Optional[str] = None
    start: Optional[datetime] = None
    end: Optional[datetime] = None

class ClassSessionResponse(ClassSessionBase):
    id: int
    # Resolved display names — populated by the API layer via joinedload
    subject_name: Optional[str] = None
    subject_code: Optional[str] = None
    teacher_name: Optional[str] = None
    division_name: Optional[str] = None
    class Config:
        from_attributes = True

# --- Batch ---
class BatchBase(BaseModel):
    name: str
    course_id: int
    start_year: int
    end_year: int

class BatchCreate(BatchBase):
    pass

class BatchResponse(BatchBase):
    id: int
    class Config:
        from_attributes = True

# --- Division ---
class DivisionBase(BaseModel):
    name: str
    batch_id: int

class DivisionCreate(DivisionBase):
    pass

class DivisionResponse(DivisionBase):
    id: int
    class Config:
        from_attributes = True

# --- Enrollment ---
class EnrollmentBase(BaseModel):
    student_id: int
    division_id: int
    status: str = "ACTIVE"

class EnrollmentCreate(EnrollmentBase):
    pass

class EnrollmentResponse(EnrollmentBase):
    id: int
    class Config:
        from_attributes = True

