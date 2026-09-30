#!/bin/bash
set -e

echo "Running Smart Database Initialization..."
python -m app.core.init_db

echo "Seeding Demo Accounts..."
python seed.py
python add_college_data.py
python generate_showcase.py
python generate_audit_logs.py

echo "Starting FastAPI Server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
