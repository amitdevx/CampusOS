import sys
import os

# Ensure backend modules can be imported
sys.path.append(os.path.join(os.path.dirname(__file__), '.'))

from app.models.timetable import ClassSession
from app.models.user import User, StudentProfile, StaffProfile
from app.core.database import SessionLocal
from app.models.academic import Department, Course

db = SessionLocal()

departments_data = {
    "Arts": [
        "B.A. Economics", "B.A. English", "B.A. Marathi", 
        "B.A. Hindi", "B.A. Geography", "B.A. Political Science",
        "M.A. Economics", "M.A. Marathi"
    ],
    "Commerce": [
        "B.Com.",
        "M.Com. Business Administration"
    ],
    "Science": [
        "B.Sc. Chemistry", "B.Sc. Botany", "B.Sc. Physics",
        "M.Sc. Analytical Chemistry"
    ],
    "Computer Science": [
        "B.Sc. Computer Science"
    ]
}

print("Syncing KPG College Igatpuri Departments and Courses...")

for dept_name, courses in departments_data.items():
    # Get or create department
    dept = db.query(Department).filter_by(name=dept_name).first()
    if not dept:
        # Create department code automatically (e.g. "Arts" -> "ARTS")
        dept = Department(name=dept_name, code=dept_name.upper()[:4])
        db.add(dept)
        db.commit()
        db.refresh(dept)
        print(f"Created Department: {dept.name}")
    
    # Get or create courses under this department
    for course_name in courses:
        course = db.query(Course).filter_by(name=course_name, department_id=dept.id).first()
        if not course:
            course = Course(name=course_name, department_id=dept.id)
            db.add(course)
            print(f"  -> Added Course: {course.name}")

db.commit()
print("College data successfully synced to the database!")
