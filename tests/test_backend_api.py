import pytest
import sys
import os
from httpx import AsyncClient, ASGITransport

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
BACKEND_DIR = os.path.join(ROOT_DIR, 'backend')
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.main import app

@pytest.mark.asyncio
async def test_health_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "AI-CityTwin"

@pytest.mark.asyncio
async def test_auth_login_admin():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post("/api/v1/auth/login", json={"email": "admin@citytwin.ai", "password": "admin123"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "Admin"

@pytest.mark.asyncio
async def test_dashboard_overview():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/dashboard/overview")
    assert response.status_code == 200
    data = response.json()
    assert "traffic_kpi" in data
    assert "aqi_kpi" in data
    assert "energy_kpi" in data
    assert "risk_kpi" in data
    assert data["is_demo_mode"] is True

@pytest.mark.asyncio
async def test_digital_twin_state():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/digital-twin/state")
    assert response.status_code == 200
    data = response.json()
    assert len(data["roads"]) > 0
    assert len(data["buildings"]) > 0
    assert len(data["air_quality"]) > 0

@pytest.mark.asyncio
async def test_traffic_prediction():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/traffic/prediction/1")
    assert response.status_code == 200
    data = response.json()
    assert data["entity_type"] == "traffic"
    assert len(data["horizons"]) == 4
    assert len(data["important_factors"]) > 0

@pytest.mark.asyncio
async def test_what_if_simulation_road_closure():
    transport = ASGITransport(app=app)
    payload = {
        "title": "Road A Shutdown",
        "scenario_type": "road_closure",
        "parameters": {"road_id": 1, "road_name": "Avenue 1", "duration_hours": 4}
    }
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post("/api/v1/scenarios/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "baseline_metrics" in data
    assert "simulated_metrics" in data
    assert "delta_pct" in data
    assert len(data["affected_nodes"]) > 0

@pytest.mark.asyncio
async def test_optimization_solver():
    transport = ASGITransport(app=app)
    payload = {
        "objective_weights": {"congestion": 0.4, "energy": 0.3, "emissions": 0.2, "response_time": 0.1}
    }
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post("/api/v1/optimization/solve", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["recommended_decisions"]) > 0
    assert data["pareto_score"] > 0

@pytest.mark.asyncio
async def test_twin_ai_chat_grounded():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post("/api/v1/ai/chat", json={"message": "Why is traffic increasing near Gate 2?"})
    assert response.status_code == 200
    data = response.json()
    assert "Gate 2" in data["reply"] or "Corridor B" in data["reply"]
    assert len(data["grounded_sources"]) > 0
    assert data["is_telemetry_backed"] is True
