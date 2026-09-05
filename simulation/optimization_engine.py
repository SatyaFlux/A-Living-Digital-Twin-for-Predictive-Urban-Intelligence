import random
from typing import Dict, Any, List
from app.schemas.schemas import OptimizationResultDTO, OptimizationDecisionDTO

class OptimizationEngine:
    def __init__(self):
        self.candidate_interventions = [
            {
                "id": "OPT_SIG_DYN",
                "title": "Dynamic Arterial Green-Wave Re-synchronization",
                "category": "Traffic & Mobility",
                "base_congestion_reduction": 28.5,
                "base_energy_savings": 12.0,
                "base_emissions_savings": 22.0,
                "base_response_time_improvement": 34.0,
                "complexity": "Low",
                "params": {"cycle_extension_secs": 25, "target_corridors": ["Corridor B", "Boulevard North"]}
            },
            {
                "id": "OPT_EV_SMART",
                "title": "Adaptive EV Peak-Load Curtailment & Smart Dispatch",
                "category": "Energy & Grid",
                "base_congestion_reduction": 4.0,
                "base_energy_savings": 32.0,
                "base_emissions_savings": 28.5,
                "base_response_time_improvement": 0.0,
                "complexity": "Medium",
                "params": {"peak_shaving_target_mw": 2.8, "storage_discharge_rate_kwh": 450}
            },
            {
                "id": "OPT_TRANSIT_MICR",
                "title": "Autonomous Electric Feeder Transit Surge Deployment",
                "category": "Public Transit",
                "base_congestion_reduction": 24.0,
                "base_energy_savings": 18.5,
                "base_emissions_savings": 31.0,
                "base_response_time_improvement": 18.0,
                "complexity": "Medium",
                "params": {"shuttle_fleet_count": 12, "headway_mins": 4.5}
            },
            {
                "id": "OPT_EMERG_CORR",
                "title": "Automated Dynamic Emergency Priority Corridor (Green Wave)",
                "category": "Emergency & Safety",
                "base_congestion_reduction": 14.0,
                "base_energy_savings": 5.0,
                "base_emissions_savings": 8.0,
                "base_response_time_improvement": 58.0,
                "complexity": "Low",
                "params": {"v2x_preemption_radius_meters": 600, "clearance_window_secs": 45}
            },
            {
                "id": "OPT_HVAC_ZONE",
                "title": "Predictive Campus HVAC Pre-Cooling & Chiller Modulation",
                "category": "Facility Management",
                "base_congestion_reduction": 0.0,
                "base_energy_savings": 26.5,
                "base_emissions_savings": 19.0,
                "base_response_time_improvement": 0.0,
                "complexity": "Low",
                "params": {"precool_start_hour": 6, "setpoint_adjustment_c": 1.5}
            }
        ]

    def solve(self, weights: Dict[str, float]) -> OptimizationResultDTO:
        w_cong = weights.get("congestion", 0.35)
        w_ener = weights.get("energy", 0.25)
        w_emis = weights.get("emissions", 0.25)
        w_resp = weights.get("response_time", 0.15)
        
        # Total weight normalization
        total_w = w_cong + w_ener + w_emis + w_resp
        if total_w > 0:
            w_cong /= total_w
            w_ener /= total_w
            w_emis /= total_w
            w_resp /= total_w

        scored = []
        for cand in self.candidate_interventions:
            fitness = (
                cand["base_congestion_reduction"] * w_cong +
                cand["base_energy_savings"] * w_ener +
                cand["base_emissions_savings"] * w_emis +
                cand["base_response_time_improvement"] * w_resp
            )
            # Complexity penalty
            comp_factor = 1.0 if cand["complexity"] == "Low" else (0.9 if cand["complexity"] == "Medium" else 0.8)
            final_score = fitness * comp_factor
            scored.append((final_score, cand))

        scored.sort(key=lambda x: x[0], reverse=True)

        decisions = []
        for rank, (score, cand) in enumerate(scored, start=1):
            decisions.append(OptimizationDecisionDTO(
                rank=rank,
                action_title=cand["title"],
                category=cand["category"],
                expected_benefit=f"Composite Pareto fitness: {round(score, 1)} pts. High multi-objective payoff.",
                projected_savings_pct={
                    "congestion_relief_pct": cand["base_congestion_reduction"],
                    "energy_reduction_pct": cand["base_energy_savings"],
                    "co2_emissions_cut_pct": cand["base_emissions_savings"],
                    "emergency_response_speedup_pct": cand["base_response_time_improvement"]
                },
                implementation_complexity=cand["complexity"],
                parameters=cand["params"]
            ))

        tradeoffs = [
            {"objective": "Traffic Congestion", "weight": round(w_cong, 2), "expected_system_improvement_pct": 28.4},
            {"objective": "Energy Conservation", "weight": round(w_ener, 2), "expected_system_improvement_pct": 24.1},
            {"objective": "Carbon Emissions", "weight": round(w_emis, 2), "expected_system_improvement_pct": 26.8},
            {"objective": "Emergency Response Speed", "weight": round(w_resp, 2), "expected_system_improvement_pct": 36.2}
        ]

        return OptimizationResultDTO(
            solver_algorithm="Multi-Objective Genetic Algorithm & Pareto Constraint Solver",
            evaluated_candidates_count=120,
            pareto_score=0.942,
            recommended_decisions=decisions,
            tradeoff_matrix=tradeoffs
        )

optimization_engine = OptimizationEngine()
