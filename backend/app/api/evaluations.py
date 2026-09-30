from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .deps import SessionDep, CurrentUser
from ..models.evaluations import Assignment, Submission, Exam, ExamMark
from ..schemas.evaluations import (
    AssignmentCreate, AssignmentResponse,
    SubmissionCreate, SubmissionResponse,
    ExamCreate, ExamResponse,
    ExamMarkCreate, ExamMarkResponse
)
from pydantic import BaseModel

router = APIRouter()

@router.post("/assignments", response_model=AssignmentResponse)
def create_assignment(assignment: AssignmentCreate, db: SessionDep, current_user: CurrentUser):
    if current_user.role not in ["FACULTY", "ADMIN", "TEACHER"]:
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
    if current_user.role not in ["FACULTY", "ADMIN", "TEACHER"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db_exam = Exam(**exam.model_dump())
    db.add(db_exam)
    db.commit()
    db.refresh(db_exam)
    return db_exam

@router.get("/assignments", response_model=List[AssignmentResponse])
def get_assignments(db: SessionDep, current_user: CurrentUser):
    if current_user.role in ["FACULTY", "ADMIN", "TEACHER"]:
        return db.query(Assignment).all() # Or filter by teacher ID
    else:
        # Students should only see assignments for their subjects
        return db.query(Assignment).all() # Simplified for now

@router.get("/exams", response_model=List[ExamResponse])
def get_exams(db: SessionDep, current_user: CurrentUser):
    return db.query(Exam).all()

class GradeSubmissionReq(BaseModel):
    marks: int
    feedback: str = ""

@router.post("/assignments/{assignment_id}/submissions/{submission_id}/grade", response_model=SubmissionResponse)
def grade_submission(assignment_id: int, submission_id: int, req: GradeSubmissionReq, db: SessionDep, current_user: CurrentUser):
    if current_user.role not in ["FACULTY", "ADMIN", "TEACHER"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    submission = db.query(Submission).filter(Submission.id == submission_id, Submission.assignment_id == assignment_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
        
    submission.marks = req.marks
    submission.feedback = req.feedback
    db.commit()
    db.refresh(submission)
    return submission

@router.post("/exams/{exam_id}/marks", response_model=List[ExamMarkResponse])
def post_exam_marks(exam_id: int, marks: List[ExamMarkCreate], db: SessionDep, current_user: CurrentUser):
    if current_user.role not in ["FACULTY", "ADMIN", "TEACHER"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
        
    db_marks = []
    for mark in marks:
        # Check if exists
        existing = db.query(ExamMark).filter(ExamMark.exam_id == exam_id, ExamMark.student_id == mark.student_id).first()
        if existing:
            existing.marks_obtained = mark.marks_obtained
            db_marks.append(existing)
        else:
            new_mark = ExamMark(exam_id=exam_id, student_id=mark.student_id, marks_obtained=mark.marks_obtained)
            db.add(new_mark)
            db_marks.append(new_mark)
            
    db.commit()
    for m in db_marks:
        db.refresh(m)
        
    return db_marks
