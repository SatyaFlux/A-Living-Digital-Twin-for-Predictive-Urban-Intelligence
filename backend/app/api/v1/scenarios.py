from fastapi import APIRouter
from typing import Dict, Any, List
from datetime import datetime, timezone
from app.schemas.schemas import ScenarioCreateDTO, ScenarioResultDTO
from simulation.scenario_engine import scenario_engine

router = APIRouter(prefix="/scenarios", tags=["What-If Simulation Engine"])

# Presets for quick evaluation
SCENARIO_PRESETS = [
    {
        "id": "preset_road_closure",
        "title": "Scenario A: Complete Closure of Avenue 1 (Boulevard North)",
        "scenario_type": "road_closure",
        "description": "Simulate arterial shutdown due to structural resurfacing or marathon route.",
        "parameters": {"road_id": 1, "road_name": "Avenue 1 - Boulevard North", "duration_hours": 4}
    },
    {
        "id": "preset_ev_surge",
        "title": "Scenario B: +25% EV Charging Infrastructure Expansion",
        "scenario_type": "ev_surge",
        "description": "Simulate adding 40 DC fast-chargers across Tech Corridor and Substation load impacts.",
        "parameters": {"ev_penetration_increase_pct": 25.0, "new_chargers_count": 40}
    },
    {
        "id": "preset_transit_boost",
        "title": "Scenario C: +30% Bus Transit Frequency & 15% Fare Subsidy",
        "scenario_type": "transit_boost",
        "description": "Model modal shift from personal cars to electric public shuttles along Corridor B.",
        "parameters": {"bus_frequency_increase_pct": 30.0, "fare_subsidy_pct": 15.0}
    },
    {
        "id": "preset_extreme_weather",
        "title": "Scenario D: 65 mm/hr Extreme Cloudburst & Inundation Risk",
        "scenario_type": "extreme_weather",
        "description": "Evaluate urban drainage threshold, underpass flood risk, and speed degradation.",
        "parameters": {"rainfall_intensity_mm_hr": 65.0, "wind_gusts_kmh": 55.0}
    }
]

@router.get("/presets")
async def get_scenario_presets() -> List[Dict[str, Any]]:
    return SCENARIO_PRESETS

@router.post("/simulate", response_model=ScenarioResultDTO)
async def run_scenario_simulation(payload: ScenarioCreateDTO):
    raw_res = scenario_engine.run_simulation(payload.scenario_type, payload.parameters)
    now = datetime.now(timezone.utc)
    return ScenarioResultDTO(
        scenario_id=hash(payload.title) % 10000,
        title=payload.title,
        scenario_type=payload.scenario_type,
        parameters=payload.parameters,
        baseline_metrics=raw_res["baseline_metrics"],
        simulated_metrics=raw_res["simulated_metrics"],
        delta_pct=raw_res["delta_pct"],
        impact_summary=raw_res["impact_summary"],
        affected_nodes=raw_res["affected_nodes"],
        recommendation=raw_res["recommendation"],
        created_at=now
    )
