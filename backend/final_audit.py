from app.core.database import SessionLocal
from app.models.user import User
from app.models.academic import Subject, Division, Course, Department, Enrollment
from app.models.timetable import ClassSession
from app.models.attendance import AttendanceSession, AttendanceRecord
from app.models.notifications import Notification
from app.models.campus import Event, EventRegistration, Resource
import sqlalchemy as sa
import datetime

db = SessionLocal()
now = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)

print("=== PERMANENT DATA ===")
print(f"Users: {db.query(User).count()}")
print(f"Departments: {db.query(Department).count()}")
print(f"Courses: {db.query(Course).count()}")
print(f"Subjects: {db.query(Subject).count()}")
print(f"Divisions: {db.query(Division).count()}")
print(f"Enrollments: {db.query(Enrollment).count()}")
print(f"ClassSessions: {db.query(ClassSession).count()}")

print("\n=== DRY-RUN CLEANUP CANDIDATES ===")
total_att = db.query(AttendanceSession).count()
expired_att = db.query(AttendanceSession).filter(
    sa.or_(AttendanceSession.expires_at < now, AttendanceSession.is_active == False)
).count()
print(f"AttendanceSessions: {total_att} total, {expired_att} expired/inactive (safe to delete)")

records = db.query(AttendanceRecord).count()
print(f"AttendanceRecords: {records} (linked to sessions; keep all)")

total_events = db.query(Event).count()
past_events = db.query(Event).filter(Event.event_date < now).count()
print(f"Events: {total_events} total, {past_events} past event_date (keep for history)")

total_reg = db.query(EventRegistration).count()
print(f"EventRegistrations: {total_reg} (keep for history)")

total_resources = db.query(Resource).count()
print(f"Resources: {total_resources}")

try:
    rb_total = db.execute(sa.text("SELECT COUNT(*) FROM resource_bookings")).scalar()
    rb_stale = db.execute(sa.text(
        "SELECT COUNT(*) FROM resource_bookings WHERE status='PENDING' AND created_at < datetime('now', '-30 days')"
    )).scalar()
    print(f"ResourceBookings: {rb_total} total, {rb_stale} stale pending >30d")
except Exception as e:
    print(f"ResourceBookings: {e}")

total_notifs = db.query(Notification).count()
old_notifs = db.query(Notification).filter(
    Notification.created_at < now - datetime.timedelta(days=90)
).count()
print(f"Notifications: {total_notifs} total, {old_notifs} older than 90 days")

with_token = db.query(User).filter(User.push_token != None).count()
print(f"Users with push_token: {with_token}")

db.close()
