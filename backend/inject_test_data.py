import datetime
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.user import User
from app.models.academic import Subject, Division
from app.models.timetable import ClassSession

db = SessionLocal()

teacher = db.query(User).filter_by(email="teacher@campusos.com").first()
student = db.query(User).filter_by(email="student@campusos.com").first()

# Create dummy subject and division
subject = db.query(Subject).first()
if not subject:
    subject = Subject(name="Test Subject", code="TEST101", credits=3)
    db.add(subject)
    db.commit()

division = db.query(Division).first()
if not division:
    division = Division(name="A", capacity=60)
    db.add(division)
    db.commit()

# Create a class session for the teacher right now
now = datetime.datetime.utcnow()
session = ClassSession(
    subject_id=subject.id,
    division_id=division.id,
    teacher_id=teacher.id,
    room="Room 101",
    start_time=now - datetime.timedelta(hours=1),
    end_time=now + datetime.timedelta(hours=1),
    day_of_week=now.weekday()
)
db.add(session)
db.commit()
print("Test timetable data injected successfully.")
