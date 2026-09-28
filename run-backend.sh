#!/bin/bash
echo "Starting Backend on 8000"
cd /home/amitdevx/Code/CampusOS/backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000
