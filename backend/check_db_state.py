import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.models.timetable import ClassSession
from app.models.academic import Subject, Enrollment, Course
from app.models.campus import Resource, Booking
from app.models.user import User

db = SessionLocal()

print(f"Users: {db.query(User).count()}")
print(f"Courses: {db.query(Course).count()}")
print(f"Subjects: {db.query(Subject).count()}")
print(f"Enrollments: {db.query(Enrollment).count()}")
print(f"Resources: {db.query(Resource).count()}")
print(f"Bookings: {db.query(Booking).count()}")
print(f"ClassSessions: {db.query(ClassSession).count()}")

# Check for orphaned or invalid records
orphaned_sessions = db.query(ClassSession).filter(ClassSession.subject_id == None).count()
if orphaned_sessions:
    print(f"WARNING: {orphaned_sessions} orphaned class sessions!")

bad_resources = db.query(Resource).filter(Resource.name.like('%Test%')).count()
if bad_resources:
    print(f"WARNING: {bad_resources} bad resources found!")

db.close()
