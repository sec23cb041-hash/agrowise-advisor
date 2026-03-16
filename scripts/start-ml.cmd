@echo off
cd ..
cd ml_service
python -m uvicorn main:app --reload --port 8000
