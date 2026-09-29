from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .deps import SessionDep, get_current_active_admin, CurrentUser
from ..models.academic import Department, Course, Subject
from ..schemas.academic import (
    DepartmentCreate, DepartmentResponse,
    CourseCreate, CourseResponse,
    SubjectCreate, SubjectResponse
)

router = APIRouter()

# --- Departments ---
@router.post("/departments", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED)
def create_department(dept: DepartmentCreate, db: SessionDep, admin=Depends(get_current_active_admin)):
    db_dept = Department(**dept.model_dump())
    db.add(db_dept)
    db.commit()
    db.refresh(db_dept)
    return db_dept

@router.get("/departments", response_model=List[DepartmentResponse])
def get_departments(db: SessionDep, current_user: CurrentUser):
    return db.query(Department).all()

# --- Courses ---
@router.post("/courses", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
def create_course(course: CourseCreate, db: SessionDep, admin=Depends(get_current_active_admin)):
    db_course = Course(**course.model_dump())
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course

@router.get("/courses", response_model=List[CourseResponse])
def get_courses(db: SessionDep, current_user: CurrentUser):
    return db.query(Course).all()

# --- Subjects ---
@router.post("/subjects", response_model=SubjectResponse, status_code=status.HTTP_201_CREATED)
def create_subject(subject: SubjectCreate, db: SessionDep, admin=Depends(get_current_active_admin)):
    db_subject = Subject(**subject.model_dump())
    db.add(db_subject)
    db.commit()
    db.refresh(db_subject)
    return db_subject

@router.get("/subjects", response_model=List[SubjectResponse])
def get_subjects(db: SessionDep, current_user: CurrentUser):
    return db.query(Subject).all()
