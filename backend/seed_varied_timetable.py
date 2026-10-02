import sys
import os
import random
from datetime import datetime, timedelta, date, timezone

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.models.user import User
from app.models.academic import Course, Subject, Batch, Division
from app.models.timetable import ClassSession

db = SessionLocal()

print("Starting varied timetable seed...")

# Fetch F.Y, S.Y, T.Y
dept_cs = db.query(Course).filter(Course.name == "T.Y.B.Sc. (Computer Science)").first()
ty_bsc = dept_cs

subjects = db.query(Subject).filter(Subject.course_id == ty_bsc.id).all()
# separate practicals
theories = [s for s in subjects if 'Practical' not in s.name]
practicals = [s for s in subjects if 'Practical' in s.name]

batch = db.query(Batch).filter(Batch.name == "2026-27", Batch.course_id == ty_bsc.id).first()
div_a = db.query(Division).filter(Division.name == "A", Division.batch_id == batch.id).first()

teacher = db.query(User).filter_by(email="teacher@campusos.com").first()
faculty = db.query(User).filter_by(email="faculty@campusos.com").first()
admin = db.query(User).filter_by(email="admin@campusos.com").first()

teachers = [teacher, faculty, admin] # Just to add variety

start_date = date(2026, 10, 2)
end_date = date(2026, 11, 1)
holidays = [date(2026, 10, 2), date(2026, 10, 31), date(2026, 11, 1)]

# Clear existing timetable for this division (Oct/Nov) to avoid overlaps
db.query(ClassSession).filter(ClassSession.division_id == div_a.id).delete()
db.commit()

current_date = start_date
sessions_added = 0

rooms = ["Smart Classroom 1", "Computer Science Lab 1", "Seminar Hall", "Electronics Lab"]

while current_date <= end_date:
    if current_date.weekday() != 6 and current_date not in holidays:
        # Schedule: 10-11, 11-12, 12-1 (Break), 1-2, 2-3, 3-5 (Practical)
        
        # 10:00 - 11:00
        db.add(ClassSession(
            subject_id=random.choice(theories).id, teacher_id=random.choice(teachers).id,
            division_id=div_a.id, room=random.choice(rooms[:2]),
            start_time=datetime(current_date.year, current_date.month, current_date.day, 10, 0, tzinfo=timezone.utc),
            end_time=datetime(current_date.year, current_date.month, current_date.day, 11, 0, tzinfo=timezone.utc),
        ))
        # 11:00 - 12:00
        db.add(ClassSession(
            subject_id=random.choice(theories).id, teacher_id=random.choice(teachers).id,
            division_id=div_a.id, room=random.choice(rooms[:2]),
            start_time=datetime(current_date.year, current_date.month, current_date.day, 11, 0, tzinfo=timezone.utc),
            end_time=datetime(current_date.year, current_date.month, current_date.day, 12, 0, tzinfo=timezone.utc),
        ))
        
        # 1:00 - 2:00
        db.add(ClassSession(
            subject_id=random.choice(theories).id, teacher_id=random.choice(teachers).id,
            division_id=div_a.id, room=random.choice(rooms[:2]),
            start_time=datetime(current_date.year, current_date.month, current_date.day, 13, 0, tzinfo=timezone.utc),
            end_time=datetime(current_date.year, current_date.month, current_date.day, 14, 0, tzinfo=timezone.utc),
        ))
        
        # 2:00 - 3:00
        db.add(ClassSession(
            subject_id=random.choice(theories).id, teacher_id=random.choice(teachers).id,
            division_id=div_a.id, room=random.choice(rooms[:2]),
            start_time=datetime(current_date.year, current_date.month, current_date.day, 14, 0, tzinfo=timezone.utc),
            end_time=datetime(current_date.year, current_date.month, current_date.day, 15, 0, tzinfo=timezone.utc),
        ))
        
        # 3:00 - 5:00 (Practical block)
        if practicals:
            db.add(ClassSession(
                subject_id=random.choice(practicals).id, teacher_id=faculty.id,
                division_id=div_a.id, room="Computer Science Lab 1",
                start_time=datetime(current_date.year, current_date.month, current_date.day, 15, 0, tzinfo=timezone.utc),
                end_time=datetime(current_date.year, current_date.month, current_date.day, 17, 0, tzinfo=timezone.utc),
            ))
            sessions_added += 5
        else:
            sessions_added += 4
        
    current_date += timedelta(days=1)

db.commit()
print(f"Varied seed complete! Added {sessions_added} class sessions for Oct 2 - Nov 1 (10 AM to 5 PM).")
