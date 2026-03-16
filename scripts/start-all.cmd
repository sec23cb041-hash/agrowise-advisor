@echo off
start cmd /k "cd .. && npm run dev"
start cmd /k "cd .. && cd backend && npm run dev"
start cmd /k "cd .. && cd ml_service && python -m uvicorn main:app --reload --port 8000"
