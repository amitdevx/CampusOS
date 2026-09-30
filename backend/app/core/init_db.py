import os
import sys
from sqlalchemy import inspect
from .database import engine, Base
import app.models.user
import app.models.academic
import app.models.timetable
import app.models.attendance
import app.models.evaluations
import app.models.campus
import app.models.notifications
import app.models.engineering

def init_db():
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    
    if "alembic_version" in existing_tables:
        print("Alembic is already tracking this database. Running upgrade head...")
        ret = os.system("alembic upgrade head")
        if ret != 0:
            sys.exit(ret)
    else:
        if "users" in existing_tables or "departments" in existing_tables:
            print("Legacy/Untracked database detected with existing tables.")
            print("Running create_all() to ensure all current models exist...")
            Base.metadata.create_all(bind=engine)
            print("Stamping Alembic head to sync state...")
            ret = os.system("alembic stamp head")
            if ret != 0:
                sys.exit(ret)
        else:
            print("Fresh database detected. Running full Alembic migrations...")
            ret = os.system("alembic upgrade head")
            if ret != 0:
                sys.exit(ret)

if __name__ == "__main__":
    init_db()
