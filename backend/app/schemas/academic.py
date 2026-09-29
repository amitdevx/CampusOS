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
    room: str
    start_time: datetime
    end_time: datetime
    teacher_id: int

class ClassSessionCreate(ClassSessionBase):
    pass

class ClassSessionResponse(ClassSessionBase):
    id: int
    # Can embed minimal representations for nested data if needed
    class Config:
        from_attributes = True
