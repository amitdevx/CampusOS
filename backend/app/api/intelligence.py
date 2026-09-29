from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_

from .deps import SessionDep, CurrentUser
from ..models.user import User
from ..models.academic import Subject
from ..models.campus import Event
from ..models.evaluations import Assignment

router = APIRouter()

@router.get("/analytics")
def get_dashboard_analytics(db: SessionDep, current_user: CurrentUser):
    """
    Returns high-level statistics for Admin/Faculty dashboards.
    """
    if current_user.role not in ["ADMIN", "SUPER_ADMIN", "FACULTY"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    total_students = db.query(User).filter(User.role == "STUDENT").count()
    total_teachers = db.query(User).filter(User.role == "FACULTY").count()
    active_assignments = db.query(Assignment).count()
    upcoming_events = db.query(Event).count()
    
    return {
        "total_students": total_students,
        "total_teachers": total_teachers,
        "active_assignments": active_assignments,
        "upcoming_events": upcoming_events
    }

@router.get("/search")
def unified_search(query: str, db: SessionDep, current_user: CurrentUser):
    """
    Unified CampusOS search across users and academic subjects.
    """
    if len(query) < 3:
        return {"users": [], "subjects": []}
        
    users = db.query(User).filter(User.full_name.ilike(f"%{query}%")).limit(10).all()
    subjects = db.query(Subject).filter(
        or_(Subject.name.ilike(f"%{query}%"), Subject.code.ilike(f"%{query}%"))
    ).limit(10).all()
    
    return {
        "users": [{"id": u.id, "name": u.full_name, "role": u.role} for u in users],
        "subjects": [{"id": s.id, "name": s.name, "code": s.code} for s in subjects]
    }
