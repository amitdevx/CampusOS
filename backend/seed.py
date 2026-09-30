import os
import sys
from sqlalchemy import text
from sqlalchemy.exc import DataError, StatementError

from app.core.database import SessionLocal, engine
from app.models.user import User, UserRole, StudentProfile, StaffProfile
from app.models.academic import Subject, Department, Course, Batch, Division, Enrollment
from app.models.timetable import ClassSession
from app.models.attendance import AttendanceSession, AttendanceRecord

from app.core.security import get_password_hash

db = SessionLocal()

roles_data = [
    {"email": "superadmin@campusos.com", "name": "Super Admin User", "role_upper": "SUPER_ADMIN", "role_lower": "super_admin", "pass": "campusos2026"},
    {"email": "admin@campusos.com", "name": "Admin User", "role_upper": "ADMIN", "role_lower": "admin", "pass": "campusos2026"},
    {"email": "faculty@campusos.com", "name": "Faculty Staff", "role_upper": "FACULTY", "role_lower": "faculty", "pass": "campusos2026"},
    {"email": "teacher@campusos.com", "name": "Teacher User", "role_upper": "TEACHER", "role_lower": "teacher", "pass": "campusos2026"},
    {"email": "student@campusos.com", "name": "Student User", "role_upper": "STUDENT", "role_lower": "student", "pass": "campusos2026"},
]

for r in roles_data:
    try:
        user = db.query(User).filter_by(email=r["email"]).first()
        if not user:
            new_user = User(
                email=r["email"],
                hashed_password=get_password_hash(r["pass"]),
                full_name=r["name"],
                role=r["role_upper"]
            )
            db.add(new_user)
            db.commit()
            print(f"Created {r['role_upper']}")
    except (DataError, StatementError) as e:
        db.rollback()
        print(f"Fallback to lowercase raw SQL for {r['email']} due to older schema enum definition.")
        raw_sql = text("INSERT INTO users (email, hashed_password, full_name, role) VALUES (:email, :hashed_password, :full_name, :role)")
        try:
            db.execute(raw_sql, {
                "email": r["email"],
                "hashed_password": get_password_hash(r["pass"]),
                "full_name": r["name"],
                "role": r["role_lower"]
            })
            db.commit()
            print(f"Created {r['role_lower']} via raw SQL")
        except Exception as e2:
            db.rollback()
            print(f"Raw SQL insert also failed for {r['email']}: {e2}")
    except Exception as e:
        db.rollback()
        print(f"Unexpected error: {e}")

print("Seeding completed.")
