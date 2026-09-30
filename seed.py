import sys
import os
import datetime

# Add the backend dir to the python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.app.core.database import SessionLocal
from backend.app.models.user import User, UserRole
from backend.app.models.academic import Subject, Department
from backend.app.models.timetable import ClassSession
from backend.app.core.security import get_password_hash

db = SessionLocal()

# Create Department
dept = db.query(Department).first()
if not dept:
    dept = Department(name="Computer Science", code="CS")
    db.add(dept)
    db.commit()
    db.refresh(dept)

# Create Course
course = db.query(Course).filter_by(name="B.Tech Computer Science").first()
if not course:
    course = Course(name="B.Tech Computer Science", department_id=dept.id)
    db.add(course)
    db.commit()
    db.refresh(course)

# Create Subjects
sub1 = db.query(Subject).filter_by(code="CS101").first()
if not sub1:
    sub1 = Subject(name="Introduction to CS", code="CS101", semester=1, course_id=course.id)
    db.add(sub1)
    
sub2 = db.query(Subject).filter_by(code="CS201").first()
if not sub2:
    sub2 = Subject(name="Data Structures", code="CS201", semester=2, course_id=course.id)
    db.add(sub2)
    
db.commit()

# Create Faculty
faculty = db.query(User).filter_by(email="prof@amitdevx.tech").first()
if not faculty:
    faculty = User(
        email="prof@amitdevx.tech",
        hashed_password=get_password_hash("profpassword"),
        full_name="Professor Smith",
        role=UserRole.FACULTY
    )
    db.add(faculty)
    db.commit()

# Create Student
student = db.query(User).filter_by(email="student@amitdevx.tech").first()
if not student:
    student = User(
        email="student@amitdevx.tech",
        hashed_password=get_password_hash("studentpassword"),
        full_name="Alice Student",
        role=UserRole.STUDENT
    )
    db.add(student)
    db.commit()

# Create some class sessions for today
now = datetime.datetime.utcnow()
cs1 = db.query(ClassSession).filter_by(subject_id=sub1.id).first()
if not cs1:
    cs1 = ClassSession(
        subject_id=sub1.id,
        room="Room 304",
        start_time=now - datetime.timedelta(hours=1),
        end_time=now + datetime.timedelta(hours=1),
        teacher_id=faculty.id
    )
    db.add(cs1)

cs2 = db.query(ClassSession).filter_by(subject_id=sub2.id).first()
if not cs2:
    cs2 = ClassSession(
        subject_id=sub2.id,
        room="Lab 10",
        start_time=now + datetime.timedelta(hours=2),
        end_time=now + datetime.timedelta(hours=4),
        teacher_id=faculty.id
    )
    db.add(cs2)
db.commit()

print("Database seeded with mock academic data, faculty, student, and classes!")
