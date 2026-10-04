from app.core.database import SessionLocal
import app.models.timetable
from app.models.user import User
from app.models.academic import Enrollment, Division
db = SessionLocal()
student = db.query(User).filter_by(email="student@campusos.com").first()
division = db.query(Division).first()
if not db.query(Enrollment).filter_by(student_id=student.id).first():
    e = Enrollment(student_id=student.id, division_id=division.id, status="ACTIVE")
    db.add(e)
    db.commit()
    print("Enrolled!")
else:
    print("Already enrolled.")
