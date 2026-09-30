import os
import sys
from sqlalchemy import inspect, text
from .database import engine, Base
import app.models.user
import app.models.academic
import app.models.timetable
import app.models.attendance
import app.models.evaluations
import app.models.campus
import app.models.notifications
import app.models.engineering

def add_missing_columns():
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    
    with engine.begin() as conn:
        for table_name, table in Base.metadata.tables.items():
            if table_name in existing_tables:
                existing_columns = [col['name'] for col in inspector.get_columns(table_name)]
                for column in table.columns:
                    if column.name not in existing_columns:
                        # Build column type string
                        col_type = column.type.compile(engine.dialect)
                        # Build alter table statement
                        print(f"Adding missing column {column.name} to {table_name}")
                        try:
                            conn.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {column.name} {col_type}"))
                        except Exception as e:
                            print(f"Warning: Failed to add column {column.name}: {e}")

def init_db():
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    
    if "alembic_version" in existing_tables:
        print("Alembic is already tracking this database. Running upgrade head...")
        # Make sure missing columns are added first
        add_missing_columns()
        ret = os.system("alembic upgrade head")
        if ret != 0:
            sys.exit(ret)
    else:
        if "users" in existing_tables or "departments" in existing_tables:
            print("Legacy/Untracked database detected with existing tables.")
            print("Running create_all() to ensure all current models exist...")
            Base.metadata.create_all(bind=engine)
            # Add any columns to existing tables that create_all skips
            add_missing_columns()
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
