#!/bin/bash
set -e

echo "Running Smart Database Initialization..."
python -m app.core.init_db

echo "Starting FastAPI Server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
