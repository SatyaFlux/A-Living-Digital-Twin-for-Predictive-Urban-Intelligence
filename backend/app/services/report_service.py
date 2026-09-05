import json
import csv
import io
from datetime import datetime, timezone
from typing import Dict, Any, List
from app.services.telemetry_service import telemetry_service
from app.services.ml_service import ml_service
from simulation.scenario_engine import scenario_engine
from simulation.optimization_engine import optimization_engine

class ReportService:
    def __init__(self):
        pass

    def generate_comprehensive_report(self, report_type: str = "Comprehensive") -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        overview = telemetry_service.get_dashboard_overview()
        roads = telemetry_service.get_live_roads()
        buildings = telemetry_service.get_live_buildings()
        aqi_nodes = telemetry_service.get_live_air_quality()
        anomalies = telemetry_service.get_live_anomalies()
        metrics = ml_service.get_model_metrics()
        
        # Sample What-If Scenario run for the report
        scenario_run = scenario_engine.run_simulation(
            "road_closure",
            {"road_id": 1, "road_name": "Avenue 1 - Boulevard North", "duration_hours": 4}
        )
        
        # Optimization run
        opt_run = optimization_engine.solve({"congestion": 0.40, "energy": 0.25, "emissions": 0.20, "response_time": 0.15})

        report_data = {
            "metadata": {
                "report_title": f"AI-CityTwin Urban Intelligence Executive Audit ({report_type})",
                "generated_at": now.isoformat(),
                "version": "1.0-Production",
                "platform": "AI-CityTwin Digital Twin Framework",
                "classification": "Official Research / Operations Briefing",
                "data_mode": "Simulated Live Telemetry & Model Benchmark Verification"
            },
            "executive_summary": (
                f"The AI-CityTwin digital twin platform evaluated metropolitan sensor feeds across 5 zones, 6 arterial roads, "
                f"and 6 smart infrastructure facilities. Current system congestion averages {overview.traffic_kpi.current_value} "
                f"with a projected peak increase of {overview.traffic_kpi.prediction_trend_pct}% in the next 60 minutes. "
                f"Composite risk index is currently {overview.risk_kpi.current_value} with {overview.active_anomalies_count} active anomalies "
                f"flagged by Isolation Forest diagnostic systems."
            ),
            "kpi_overview": {
                "traffic_congestion": overview.traffic_kpi.model_dump(),
                "air_quality_index": overview.aqi_kpi.model_dump(),
                "grid_energy_consumption": overview.energy_kpi.model_dump(),
                "composite_risk": overview.risk_kpi.model_dump()
            },
            "network_arterials": [r.model_dump() for r in roads],
            "smart_facilities": [b.model_dump() for b in buildings],
            "air_quality_stations": [a.model_dump() for a in aqi_nodes],
            "active_anomalies": [anom.model_dump() for anom in anomalies],
            "what_if_scenario_audit": scenario_run,
            "decision_optimization": opt_run.model_dump(),
            "ml_model_governance": [m.model_dump() for m in metrics]
        }
        return report_data

    def export_csv(self, report_data: Dict[str, Any]) -> str:
        output = io.StringIO()
        writer = csv.writer(output)
        
        writer.writerow(["=== AI-CityTwin Urban Intelligence Report ==="])
        writer.writerow(["Generated At", report_data["metadata"]["generated_at"]])
        writer.writerow([])
        
        writer.writerow(["=== ARTERIAL ROADS TELEMETRY ==="])
        writer.writerow(["ID", "Name", "Capacity (vph)", "Congestion %", "Avg Speed (km/h)", "Vehicle Count", "Status"])
        for r in report_data.get("network_arterials", []):
            writer.writerow([r["id"], r["name"], r["capacity_vph"], r["current_congestion_pct"], r["current_avg_speed"], r["current_vehicle_count"], r["current_status"]])
        writer.writerow([])
        
        writer.writerow(["=== ACTIVE ANOMALIES & DIAGNOSTICS ==="])
        writer.writerow(["ID", "Entity", "Severity", "Actual Val", "Expected Val", "Confidence", "Diagnostic Explanation", "Recommended Action"])
        for a in report_data.get("active_anomalies", []):
            writer.writerow([a["id"], a["entity_name"], a["severity"], a["actual_value"], a["expected_value"], a["confidence"], a["explanation"], a["recommended_action"]])
        writer.writerow([])
        
        writer.writerow(["=== ML MODEL GOVERNANCE & BENCHMARKS ==="])
        writer.writerow(["Model Name", "Algorithm", "Domain", "MAE", "RMSE", "MAPE (%)", "R2 Score"])
        for m in report_data.get("ml_model_governance", []):
            writer.writerow([m["model_name"], m["algorithm"], m["domain"], m["mae"], m["rmse"], m["mape"], m["r2_score"]])
            
        return output.getvalue()

report_service = ReportService()
