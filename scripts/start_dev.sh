#!/usr/bin/env bash
echo "========================================================"
echo "   Starting AI-CityTwin Platform (Full-Stack Dev)"
echo "   Observe. Predict. Simulate. Decide."
echo "========================================================"

# Launch Backend
python -m uvicorn app.main:app --app-dir backend --reload --port 8000 &
BACKEND_PID=$!

# Launch Frontend
cd frontend && npm run dev &
FRONTEND_PID=$!

echo "AI-CityTwin Running!"
echo "Backend: http://localhost:8000/docs"
echo "Frontend: http://localhost:5173"

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
