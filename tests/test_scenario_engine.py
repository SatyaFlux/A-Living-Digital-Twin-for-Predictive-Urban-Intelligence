import pytest
import sys
import os

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)
BACKEND_DIR = os.path.join(ROOT_DIR, 'backend')
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from simulation.scenario_engine import scenario_engine
from simulation.optimization_engine import optimization_engine

def test_road_closure_simulation():
    res = scenario_engine.run_simulation("road_closure", {"road_id": 1, "road_name": "Avenue 1", "duration_hours": 4})
    assert res["scenario_type"] == "road_closure"
    assert "corridor_b_congestion_pct" in res["simulated_metrics"]
    assert res["simulated_metrics"]["corridor_b_congestion_pct"] > res["baseline_metrics"]["corridor_b_congestion_pct"]
    assert "recommendation" in res

def test_ev_surge_simulation():
    res = scenario_engine.run_simulation("ev_surge", {"ev_penetration_increase_pct": 25.0, "new_chargers_count": 40})
    assert res["scenario_type"] == "ev_surge"
    assert res["simulated_metrics"]["peak_grid_demand_mw"] > res["baseline_metrics"]["peak_grid_demand_mw"]
    assert res["simulated_metrics"]["charger_queue_wait_time_mins"] < res["baseline_metrics"]["charger_queue_wait_time_mins"]

def test_transit_boost_simulation():
    res = scenario_engine.run_simulation("transit_boost", {"bus_frequency_increase_pct": 30.0, "fare_subsidy_pct": 15.0})
    assert res["scenario_type"] == "transit_boost"
    assert res["simulated_metrics"]["arterial_congestion_pct"] < res["baseline_metrics"]["arterial_congestion_pct"]

def test_extreme_weather_simulation():
    res = scenario_engine.run_simulation("extreme_weather", {"rainfall_intensity_mm_hr": 65.0, "wind_gusts_kmh": 55.0})
    assert res["scenario_type"] == "extreme_weather"
    assert res["simulated_metrics"]["city_risk_index"] > res["baseline_metrics"]["city_risk_index"]

def test_optimization_solver_pareto():
    res = optimization_engine.solve({"congestion": 0.4, "energy": 0.3, "emissions": 0.2, "response_time": 0.1})
    assert len(res.recommended_decisions) >= 3
    assert res.pareto_score > 0.8
