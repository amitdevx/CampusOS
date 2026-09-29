from sqlalchemy import create_engine
from sqlalchemy.sql import text

DB_URL = "postgresql+psycopg2://postgres:Uxwr0Nuxc4JQv1EM@db.wqtphprgstseajqtkygk.supabase.co:5432/postgres"

try:
    engine = create_engine(DB_URL, connect_args={'connect_timeout': 10})
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        print("SUCCESS! Successfully connected to Supabase PostgreSQL.")
except Exception as e:
    print(f"FAILED: {e}")
