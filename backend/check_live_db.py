import os
from sqlalchemy import create_engine, text

DB_URL = "postgresql+psycopg2://postgres:Uxwr0Nuxc4JQv1EM@db.wqtphprgstseajqtkygk.supabase.co:5432/postgres"
engine = create_engine(DB_URL)

try:
    with engine.connect() as conn:
        print("Successfully connected to live DB!")
        
        # Check users count
        res = conn.execute(text("SELECT role, COUNT(*) FROM users GROUP BY role;")).fetchall()
        print("\nUser Counts by Role:")
        for r in res:
            print(f"  {r[0]}: {r[1]}")
            
        # Check classes
        classes = conn.execute(text("SELECT COUNT(*) FROM class_sessions;")).scalar()
        print(f"\nTotal Class Sessions: {classes}")
        
        # Check if division_id was added successfully
        cols = conn.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'class_sessions';")).fetchall()
        print("\nColumns in class_sessions:")
        for c in cols:
            print(f"  {c[0]}: {c[1]}")
            
except Exception as e:
    print(f"Database error: {e}")
