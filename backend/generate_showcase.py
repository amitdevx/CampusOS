import sys
import os
import random
import datetime

sys.path.append(os.path.join(os.path.dirname(__file__), '.'))

from sqlalchemy import text
from app.core.database import SessionLocal
from app.models.user import User, UserRole, StudentProfile, StaffProfile
from app.models.academic import Department, Course, Batch, Division, Enrollment, Subject
from app.models.timetable import ClassSession
from app.models.campus import Event, Resource, Notice
from app.core.security import get_password_hash

db = SessionLocal()

first_names = ["Aarav", "Rohan", "Rahul", "Aditya", "Vivek", "Karan", "Priya", "Sneha", "Neha", "Pooja", "Anjali", "Riya", "Vikas", "Siddharth", "Amit", "Manish", "Nisha", "Kiran"]
last_names = ["Sharma", "Patil", "Deshmukh", "Joshi", "Kulkarni", "Jadhav", "Singh", "Verma", "Gupta", "Iyer", "Chavan", "Pawar", "Shinde", "Kale", "Bhosale"]

def get_name():
    return f"{random.choice(first_names)} {random.choice(last_names)}"

print("Starting Showcase Data Generation...")

student_count = db.query(User).filter(User.role == "STUDENT").count()
if student_count > 1000:
    print("Database already has many students. Skipping showcase generation to prevent duplicates.")
    sys.exit(0)

default_pass = get_password_hash("campusos2026")

def safe_create_user(email, name, role, password):
    user = db.query(User).filter_by(email=email).first()
    if user:
        return user
    new_user = User(
        email=email,
        hashed_password=password,
        full_name=name,
        role=role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

admin_user = db.query(User).filter_by(email="admin@campusos.com").first()
admin_id = admin_user.id if admin_user else 1

# 2. Generate Resources & Notices
resources = [("Computer Lab 1", "LAB"), ("Seminar Hall", "ROOM"), ("Projector A", "EQUIPMENT")]
for r_name, r_type in resources:
    if not db.query(Resource).filter_by(name=r_name).first():
        db.add(Resource(name=r_name, type=r_type))

notices = [
    ("Mid-Term Examinations", "Mid-term exams will commence from the 15th of next month. Check your timetable."),
    ("Annual TechFest 2026", "Registrations for the campus TechFest are now open!"),
    ("Diwali Holidays", "College will remain closed from Monday to Friday for Diwali.")
]
for title, content in notices:
    if not db.query(Notice).filter_by(title=title).first():
        db.add(Notice(title=title, content=content, author_id=admin_id))

events = [
    ("Campus Recruitment Drive", "TCS and Infosys recruitment drive for TY students.", datetime.datetime.utcnow() + datetime.timedelta(days=5), "Main Auditorium"),
    ("Guest Lecture: AI & Future", "Seminar by industry experts on GenAI.", datetime.datetime.utcnow() + datetime.timedelta(days=2), "Seminar Hall")
]
for t, d, dt, loc in events:
    if not db.query(Event).filter_by(title=t).first():
        db.add(Event(title=t, description=d, event_date=dt, location=loc, organizer_id=admin_id))

db.commit()

# 3. Generate Teachers
teachers = []
for i in range(1, 6):
    name = get_name()
    email = f"prof{i}@kpgcollege.edu.in"
    t = safe_create_user(email, name, "TEACHER", default_pass)
    
    profile = db.query(StaffProfile).filter_by(user_id=t.id).first()
    if not profile:
        db.add(StaffProfile(user_id=t.id, employee_id=f"EMP100{i}", designation="Assistant Professor"))
        db.commit()
    teachers.append(t)

# 4. Generate Academic Structure (Batches, Divisions, Subjects)
courses = db.query(Course).all()
all_divisions = []

subject_names = {
    "Arts": ["History of India", "Macroeconomics", "Political Theory", "World Geography", "Literature Basics"],
    "Commerce": ["Financial Accounting", "Business Law", "Auditing", "Cost Accounting"],
    "Science": ["Organic Chemistry", "Quantum Mechanics", "Plant Biology", "Analytical Tools"],
    "Computer Science": ["Data Structures", "Operating Systems", "Python Programming", "Database Management"]
}

for course in courses:
    dept = db.query(Department).filter_by(id=course.department_id).first()
    if not dept: continue
    
    # Batch
    batch_name = "2024-2027"
    batch = db.query(Batch).filter_by(name=batch_name, course_id=course.id).first()
    if not batch:
        batch = Batch(name=batch_name, start_year=2024, end_year=2027, course_id=course.id)
        db.add(batch)
        db.commit()
        db.refresh(batch)
    
    # Division
    div = db.query(Division).filter_by(name="A", batch_id=batch.id).first()
    if not div:
        div = Division(name="A", batch_id=batch.id)
        db.add(div)
        db.commit()
        db.refresh(div)
    all_divisions.append((course, batch, div, dept))

    # Subjects
    subs = subject_names.get(dept.name, ["General Subject 1", "General Subject 2"])
    for s_name in subs[:3]:
        code = f"{dept.code}{random.randint(100,999)}"
        if not db.query(Subject).filter_by(name=s_name, course_id=course.id).first():
            db.add(Subject(name=s_name, code=code, semester=1, course_id=course.id))
db.commit()

# 5. Generate Students
student_idx = 1
for (course, batch, div, dept) in all_divisions:
    for _ in range(3):
        name = get_name()
        email = f"student{student_idx}@kpgcollege.edu.in"
        student_idx += 1
        
        s = safe_create_user(email, name, "STUDENT", default_pass)
        
        profile = db.query(StudentProfile).filter_by(user_id=s.id).first()
        if not profile:
            db.add(StudentProfile(
                user_id=s.id,
                enrollment_number=f"ENR2024{student_idx:04d}",
                current_semester=1,
                department_id=dept.id,
                batch_id=batch.id
            ))
            db.add(Enrollment(student_id=s.id, division_id=div.id, status="ACTIVE"))
            db.commit()

# 6. Generate Timetable (Classes) for today and tomorrow
if teachers and all_divisions:
    now = datetime.datetime.utcnow()
    today_start = now.replace(hour=8, minute=0, second=0, microsecond=0)
    subjects = db.query(Subject).all()

    for div_info in all_divisions:
        div_id = div_info[2].id
        course_id = div_info[0].id
        
        div_subjects = [s for s in subjects if s.course_id == course_id]
        if not div_subjects:
            continue
            
        for day_offset in [0, 1]:
            for hour_offset in [1, 3]:
                start_t = today_start + datetime.timedelta(days=day_offset, hours=hour_offset)
                end_t = start_t + datetime.timedelta(hours=1)
                
                t = random.choice(teachers)
                sub = random.choice(div_subjects)
                
                overlap = db.query(ClassSession).filter(
                    ClassSession.teacher_id == t.id,
                    ClassSession.start_time < end_t,
                    ClassSession.end_time > start_t
                ).first()
                
                if not overlap:
                    cs = ClassSession(
                        subject_id=sub.id,
                        division_id=div_id,
                        room=f"Room {random.randint(101, 305)}",
                        start_time=start_t,
                        end_time=end_t,
                        teacher_id=t.id
                    )
                    db.add(cs)
    db.commit()

print("Showcase Indian Data Generation Complete! Populated Users, Subjects, Classes, Events, and Notices.")
