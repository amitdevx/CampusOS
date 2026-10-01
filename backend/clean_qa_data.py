import os
from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql+psycopg2://postgres:Uxwr0Nuxc4JQv1EM@db.wqtphprgstseajqtkygk.supabase.co:5432/postgres"
engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    print("Cleaning events...")
    conn.execute(text("DELETE FROM events WHERE title ILIKE '%QA Check%' OR title ILIKE '%test%' OR title ILIKE '%clq%'"))
    conn.commit()
    print("Done cleaning.")
