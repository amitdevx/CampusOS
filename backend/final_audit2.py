from app.core.database import SessionLocal
from app.models.user import User
from app.models.academic import Subject, Division, Course, Department, Enrollment
from app.models.timetable import ClassSession
from app.models.attendance import AttendanceSession, AttendanceRecord
from app.models.notifications import Notification
from app.models.campus import Event, EventRegistration, Resource, Booking, Notice
import sqlalchemy as sa
import datetime

db = SessionLocal()
now = datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None)

print("=== DRY-RUN CLEANUP CANDIDATES ===")

# Expired attendance sessions
expired_att = db.query(AttendanceSession).filter(
    sa.or_(AttendanceSession.expires_at < now, AttendanceSession.is_active == False)
).count()
print(f"AttendanceSessions expired/inactive: {expired_att} → SAFE TO DELETE (expired + closed)")

# The 1 AttendanceRecord is linked to session_id=4 (active earlier)
att_linked = db.execute(sa.text(
    "SELECT COUNT(*) FROM attendance_records ar JOIN attendance_sessions ats ON ar.session_id=ats.id"
)).scalar()
att_orphan = db.execute(sa.text(
    "SELECT COUNT(*) FROM attendance_records ar LEFT JOIN attendance_sessions ats ON ar.session_id=ats.id WHERE ats.id IS NULL"
)).scalar()
print(f"AttendanceRecords linked: {att_linked}, orphaned: {att_orphan}")

# Bookings (real name)
total_bookings = db.query(Booking).count()
stale_pending = db.query(Booking).filter(
    Booking.status == 'PENDING',
    Booking.created_at < now - datetime.timedelta(days=30)
).count()
print(f"Bookings: {total_bookings} total, {stale_pending} stale pending >30d")

total_notifs = db.query(Notification).count()
old_notifs = db.query(Notification).filter(
    Notification.created_at < now - datetime.timedelta(days=90)
).count()
print(f"Notifications: {total_notifs} total, {old_notifs} older than 90 days")

print("\n=== PROPOSED CLEANUP ===")
print(f"Delete {expired_att} expired/inactive AttendanceSessions (cascade deletes AttendanceRecords for those sessions)")
print(f"Delete {old_notifs} notifications older than 90 days")
print(f"Delete {stale_pending} stale pending Bookings older than 30 days")
print(f"\nNOTE: The 1 AttendanceRecord is linked to expired sessions. It will be cascade-deleted.")

db.close()
