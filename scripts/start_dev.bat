@echo off
echo ========================================================
echo    Starting AI-CityTwin Platform (Full-Stack Dev)
echo    Observe. Predict. Simulate. Decide.
echo ========================================================

echo 1. Launching FastAPI Backend on http://localhost:8000 ...
start cmd /k "python -m uvicorn app.main:app --app-dir backend --reload --port 8000"

timeout /t 2 /nobreak >nul

echo 2. Launching React Frontend on http://localhost:5173 ...
start cmd /k "cd frontend && npm run dev"

echo.
echo AI-CityTwin is launching!
echo Backend Docs: http://localhost:8000/docs
echo Frontend App: http://localhost:5173
echo ========================================================
