#!/bin/bash
set -e

echo "Running Smart Database Initialization..."
python -m app.core.init_db

# Note: seed.py, add_college_data.py, and generate_showcase.py 
# have been disabled on startup to prevent unique constraint violations on Supabase.
# Run them manually if you are spinning up a fresh database.

echo "Starting FastAPI Server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
