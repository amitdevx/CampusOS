from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .deps import SessionDep, CurrentUser
from ..models.evaluations import Assignment, Submission, Exam
from ..schemas.evaluations import (
    AssignmentCreate, AssignmentResponse,
    SubmissionCreate, SubmissionResponse,
    ExamCreate, ExamResponse
)

router = APIRouter()

@router.post("/assignments", response_model=AssignmentResponse)
def create_assignment(assignment: AssignmentCreate, db: SessionDep, current_user: CurrentUser):
    if current_user.role not in ["FACULTY", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db_assignment = Assignment(**assignment.model_dump(), teacher_id=current_user.id)
    db.add(db_assignment)
    db.commit()
    db.refresh(db_assignment)
    return db_assignment

@router.post("/assignments/{assignment_id}/submit", response_model=SubmissionResponse)
def submit_assignment(assignment_id: int, submission: SubmissionCreate, db: SessionDep, current_user: CurrentUser):
    db_submission = Submission(
        assignment_id=assignment_id,
        student_id=current_user.id,
        file_url=submission.file_url
    )
    db.add(db_submission)
    db.commit()
    db.refresh(db_submission)
    return db_submission

@router.post("/exams", response_model=ExamResponse)
def create_exam(exam: ExamCreate, db: SessionDep, current_user: CurrentUser):
    if current_user.role not in ["FACULTY", "ADMIN"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db_exam = Exam(**exam.model_dump())
    db.add(db_exam)
    db.commit()
    db.refresh(db_exam)
    return db_exam
