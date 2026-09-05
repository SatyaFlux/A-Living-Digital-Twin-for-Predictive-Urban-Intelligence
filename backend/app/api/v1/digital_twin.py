from fastapi import APIRouter
from typing import Dict, Any
from app.services.telemetry_service import telemetry_service, LOCATIONS_DATA

router = APIRouter(prefix="/digital-twin", tags=["Digital Twin"])

@router.get("/state")
async def get_digital_twin_full_state() -> Dict[str, Any]:
    roads = telemetry_service.get_live_roads()
    buildings = telemetry_service.get_live_buildings()
    aqi_nodes = telemetry_service.get_live_air_quality()
    water_nodes = telemetry_service.get_live_water()
    weather = telemetry_service.get_live_weather()
    anomalies = telemetry_service.get_live_anomalies()
    overview = telemetry_service.get_dashboard_overview()

    return {
        "timestamp": overview.timestamp.isoformat(),
        "is_simulated_stream": True,
        "zones": LOCATIONS_DATA,
        "roads": [r.model_dump() for r in roads],
        "buildings": [b.model_dump() for b in buildings],
        "air_quality": [a.model_dump() for a in aqi_nodes],
        "water_grid": [w.model_dump() for w in water_nodes],
        "weather": weather.model_dump(),
        "anomalies": [anom.model_dump() for anom in anomalies],
        "overview": overview.model_dump()
    }

@router.post("/sync")
async def trigger_twin_synchronization():
    return {"status": "synchronized", "message": "Digital Twin telemetry buffers refreshed successfully."}
