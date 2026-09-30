import sys
import os
import datetime

# Add the backend dir to the python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.app.core.database import SessionLocal
from backend.app.models.user import User, UserRole
from backend.app.models.academic import Subject, Department, Course, Batch, Division, Enrollment, StudentProfile
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

# Create Batch
batch = db.query(Batch).filter_by(name="2023-2027").first()
if not batch:
    batch = Batch(name="2023-2027", start_year=2023, end_year=2027, course_id=course.id)
    db.add(batch)
    db.commit()
    db.refresh(batch)

# Create Division
division = db.query(Division).filter_by(name="A").first()
if not division:
    division = Division(name="A", batch_id=batch.id)
    db.add(division)
    db.commit()
    db.refresh(division)

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
db.refresh(sub1)
db.refresh(sub2)

# Create Faculty
faculty = db.query(User).filter_by(email="prof@amitdevx.tech").first()
if not faculty:
    faculty = User(
        email="prof@amitdevx.tech",
        hashed_password=get_password_hash("profpassword"),
        full_name="Professor Smith",
        role=UserRole.TEACHER
    )
    db.add(faculty)
    db.commit()
    db.refresh(faculty)

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
    db.refresh(student)

# Ensure StudentProfile
student_profile = db.query(StudentProfile).filter_by(user_id=student.id).first()
if not student_profile:
    student_profile = StudentProfile(
        user_id=student.id,
        enrollment_number="12345678",
        current_semester=1,
        department_id=dept.id,
        batch_id=batch.id
    )
    db.add(student_profile)
    db.commit()

# Enroll Student in Division
enrollment = db.query(Enrollment).filter_by(student_id=student.id).first()
if not enrollment:
    enrollment = Enrollment(
        student_id=student.id,
        division_id=division.id,
        status="ACTIVE"
    )
    db.add(enrollment)
    db.commit()

# Create some class sessions for today
now = datetime.datetime.utcnow()
cs1 = db.query(ClassSession).filter_by(subject_id=sub1.id).first()
if not cs1:
    cs1 = ClassSession(
        subject_id=sub1.id,
        division_id=division.id,
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
        division_id=division.id,
        room="Lab 10",
        start_time=now + datetime.timedelta(hours=2),
        end_time=now + datetime.timedelta(hours=4),
        teacher_id=faculty.id
    )
    db.add(cs2)
db.commit()

print("Database seeded with full academic hierarchy (Course -> Batch -> Division -> Enrollment) and Classes!")
