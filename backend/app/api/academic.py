from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .deps import SessionDep, get_current_active_admin, CurrentUser
from ..models.academic import Department, Course, Subject, Batch, Division, Enrollment
from ..schemas.academic import (
    DepartmentCreate, DepartmentResponse,
    CourseCreate, CourseResponse,
    SubjectCreate, SubjectResponse,
    BatchCreate, BatchResponse,
    DivisionCreate, DivisionResponse,
    EnrollmentCreate, EnrollmentResponse
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

# --- Batches ---
@router.post("/batches", response_model=BatchResponse, status_code=status.HTTP_201_CREATED)
def create_batch(batch: BatchCreate, db: SessionDep, admin=Depends(get_current_active_admin)):
    db_batch = Batch(**batch.model_dump())
    db.add(db_batch)
    db.commit()
    db.refresh(db_batch)
    return db_batch

@router.get("/batches", response_model=List[BatchResponse])
def get_batches(db: SessionDep, current_user: CurrentUser):
    return db.query(Batch).all()

# --- Divisions ---
@router.post("/divisions", response_model=DivisionResponse, status_code=status.HTTP_201_CREATED)
def create_division(division: DivisionCreate, db: SessionDep, admin=Depends(get_current_active_admin)):
    db_division = Division(**division.model_dump())
    db.add(db_division)
    db.commit()
    db.refresh(db_division)
    return db_division

@router.get("/divisions", response_model=List[DivisionResponse])
def get_divisions(db: SessionDep, current_user: CurrentUser):
    return db.query(Division).all()

# --- Enrollments ---
@router.post("/enrollments", response_model=EnrollmentResponse, status_code=status.HTTP_201_CREATED)
def create_enrollment(enrollment: EnrollmentCreate, db: SessionDep, admin=Depends(get_current_active_admin)):
    db_enrollment = Enrollment(**enrollment.model_dump())
    db.add(db_enrollment)
    db.commit()
    db.refresh(db_enrollment)
    return db_enrollment

@router.get("/enrollments", response_model=List[EnrollmentResponse])
def get_enrollments(db: SessionDep, admin=Depends(get_current_active_admin)):
    return db.query(Enrollment).all()

