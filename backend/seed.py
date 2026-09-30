import os
import sys

from app.core.database import SessionLocal, engine
from app.models.user import User, UserRole, StudentProfile, StaffProfile
from app.models.academic import Subject, Department, Course, Batch, Division, Enrollment
from app.models.timetable import ClassSession
from app.models.attendance import AttendanceSession, AttendanceRecord

from app.core.security import get_password_hash

db = SessionLocal()

roles_data = [
    {"email": "superadmin@campusos.com", "name": "Super Admin User", "role": "SUPER_ADMIN", "pass": "campusos2026"},
    {"email": "admin@campusos.com", "name": "Admin User", "role": "ADMIN", "pass": "campusos2026"},
    {"email": "faculty@campusos.com", "name": "Faculty Staff", "role": "FACULTY", "pass": "campusos2026"},
    {"email": "teacher@campusos.com", "name": "Teacher User", "role": "TEACHER", "pass": "campusos2026"},
    {"email": "student@campusos.com", "name": "Student User", "role": "STUDENT", "pass": "campusos2026"},
]

for r in roles_data:
    user = db.query(User).filter_by(email=r["email"]).first()
    if not user:
        new_user = User(
            email=r["email"],
            hashed_password=get_password_hash(r["pass"]),
            full_name=r["name"],
            role=r["role"]
        )
        db.add(new_user)
        db.commit()
        print(f"Created {r['role']}")

print("Seeding completed.")
