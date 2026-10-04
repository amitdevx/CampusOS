from app.core.database import SessionLocal
import app.models.timetable
from app.models.academic import Subject, Division, Course, Department
from app.models.user import User
from app.models.timetable import ClassSession
import datetime

db = SessionLocal()
s = db.query(Subject).first()
division = db.query(Division).first()
teacher = db.query(User).filter_by(email="teacher@campusos.com").first()

now = datetime.datetime.utcnow()
db.query(ClassSession).filter_by(teacher_id=teacher.id).delete()
db.commit()

session = ClassSession(
    subject_id=s.id,
    division_id=division.id,
    teacher_id=teacher.id,
    room="Room 101",
    start_time=now - datetime.timedelta(hours=1),
    end_time=now + datetime.timedelta(hours=1)
)
db.add(session)
db.commit()
print("Success")
