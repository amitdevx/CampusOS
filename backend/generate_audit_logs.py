import sys
import os
import random
import datetime

sys.path.append(os.path.join(os.path.dirname(__file__), '.'))

from app.core.database import SessionLocal
from app.models.engineering import AuditLog
from app.models.timetable import ClassSession
from app.models.academic import Department, Course, Batch, Division, Enrollment, Subject
from app.models.user import User

db = SessionLocal()

print("Generating showcase audit logs...")
users = db.query(User).all()
if not users:
    print("No users found.")
    sys.exit()

actions = ["USER_LOGIN", "TIMETABLE_CREATED", "RESOURCE_BOOKED", "EVENT_CREATED", "PROFILE_UPDATED"]
resources = ["/api/v1/auth/login", "/api/v1/timetable", "/api/v1/campus/bookings", "/api/v1/campus/events", "/api/v1/users/me"]

for _ in range(15):
    u = random.choice(users)
    a = random.choice(actions)
    r = random.choice(resources)
    t = datetime.datetime.now(datetime.UTC) - datetime.timedelta(hours=random.randint(1, 48), minutes=random.randint(1, 59))
    log = AuditLog(
        user_id=u.id,
        action=a,
        resource=r,
        details=f"Showcase mock action: {a}",
        timestamp=t,
        ip_address=f"192.168.1.{random.randint(10, 255)}"
    )
    db.add(log)

db.commit()
print("Audit logs generated.")
