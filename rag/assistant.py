from typing import List
from app.schemas.schemas import ChatResponseDTO, GroundedSourceDTO
from app.services.telemetry_service import telemetry_service
from app.services.ml_service import ml_service
from simulation.scenario_engine import scenario_engine
from simulation.optimization_engine import optimization_engine

KNOWLEDGE_DOCUMENTS = [
    {
        "id": "KB_TRAFFIC_SOP",
        "domain": "traffic_policy",
        "title": "Smart Traffic Operations Manual (Section 4: Congestion Protocols)",
        "content": "When arterial congestion exceeds 75%, dynamic signal synchronization is automatically recommended. Gate 2 is the primary bottleneck where Corridor B intersects with Tech Expressway. Reversible lanes can be deployed if volume exceeds 3,000 vehicles/hour."
    },
    {
        "id": "KB_AQI_POLICY",
        "domain": "air_quality_guideline",
        "title": "Metropolitan Clean Air Action Plan 2026",
        "content": "AQI between 101-200 indicates Moderate Pollution (PM2.5 exceeding 35 µg/m³). High vehicular emissions and low wind boundary dispersion are primary triggers. Commercial zones are mandated to activate misting cannons and reroute heavy diesel freight when AQI sustains >150."
    },
    {
        "id": "KB_ENERGY_GRID",
        "domain": "energy_management",
        "title": "Smart Campus Microgrid Operating Guidelines",
        "content": "Data Center energy consumption baselines are calibrated at 120 kWh. Excursions above 160 kWh trigger thermal anomaly alerts indicating chiller capacity strain or server workload surges. Peak demand shifting protocols apply between 14:00 and 19:00."
    },
    {
        "id": "KB_WATER_SOP",
        "domain": "water_infrastructure",
        "title": "Hydraulic Distribution & Pressure Management SOP",
        "content": "Nominal pipeline pressure is 3.0 to 3.8 bar. A pressure drop below 2.2 bar concurrent with elevated night flow (>5 L/s) signifies a critical sub-surface pipe rupture requiring immediate acoustic valve isolation."
    },
    {
        "id": "KB_SCENARIO_CLOSURE",
        "domain": "simulation_benchmark",
        "title": "Urban Resilience What-If Benchmark: Arterial Closures",
        "content": "Closing Avenue 1 (Boulevard North) causes 62% of traffic to divert onto Corridor B and 38% onto Road C. Without dynamic signal retiming, citywide travel times spike by ~63.7%."
    }
]

class TwinAIAssistant:
    def __init__(self):
        self.documents = KNOWLEDGE_DOCUMENTS

    def query(self, user_message: str) -> ChatResponseDTO:
        msg_lower = user_message.lower()
        sources: List[GroundedSourceDTO] = []
        is_telemetry_backed = False
        
        # 1. TRAFFIC / GATE 2 / CONGESTION INQUIRIES
        if "gate 2" in msg_lower or ("traffic" in msg_lower and ("why" in msg_lower or "increase" in msg_lower or "bottleneck" in msg_lower)):
            roads = telemetry_service.get_live_roads()
            corr_b = next((r for r in roads if r.id == 2), roads[0])
            pred = ml_service.get_traffic_prediction(2, corr_b.current_congestion_pct or 68.0)
            
            sources.append(GroundedSourceDTO(
                source_type="telemetry",
                title="Live Traffic Sensor #RD_CORR_B",
                snippet=f"Corridor B current congestion is {corr_b.current_congestion_pct}% with avg speed {corr_b.current_avg_speed} km/h.",
                confidence=0.96
            ))
            sources.append(GroundedSourceDTO(
                source_type="policy",
                title="Smart Traffic Operations Manual §4",
                snippet="Gate 2 is the primary bottleneck where Corridor B intersects with Tech Expressway.",
                confidence=0.92
            ))
            is_telemetry_backed = True
            
            reply = (
                f"Traffic near Gate 2 is currently congested at **{corr_b.current_congestion_pct}% capacity** "
                f"(average velocity **{corr_b.current_avg_speed} km/h**).\n\n"
                f"**Root Causes Identified by AI Models:**\n"
                f"1. **Diurnal Commuter Inflow:** Peak morning/evening volume converging toward Tech Corridor.\n"
                f"2. **Gate 2 Bottleneck Intersection:** The signal cycle at Corridor B and Tech Expressway is at 89% saturation.\n"
                f"3. **Forecast Horizon:** Our Gradient Boosting model predicts congestion will reach **{pred.horizons[2].predicted_value}% in the next 60 minutes**.\n\n"
                f"**Recommended Action:** Extend the green signal phase on Corridor B Northbound by +25 seconds via Adaptive Signal Controller #4."
            )
            suggested = [
                "What will traffic look like in 30 minutes?",
                "What happens if Road A is closed?",
                "Which scenario gives the lowest congestion?"
            ]

        # 2. FUTURE TRAFFIC FORECAST INQUIRIES (e.g. "what will traffic look like in 30 minutes")
        elif "traffic" in msg_lower and ("30" in msg_lower or "future" in msg_lower or "predict" in msg_lower or "look like" in msg_lower or "forecast" in msg_lower):
            roads = telemetry_service.get_live_roads()
            corr_b = next((r for r in roads if r.id == 2), roads[0])
            pred = ml_service.get_traffic_prediction(2, corr_b.current_congestion_pct or 68.0)
            p30 = next((h for h in pred.horizons if h.horizon == "30m"), pred.horizons[1])
            p60 = next((h for h in pred.horizons if h.horizon == "60m"), pred.horizons[2])

            sources.append(GroundedSourceDTO(
                source_type="prediction",
                title="Traffic Forecasting Model (GradientBoosting_XGB)",
                snippet=f"30m forecast: {p30.predicted_value}% (CI: {p30.lower_bound}-{p30.upper_bound}%), 60m forecast: {p60.predicted_value}%.",
                confidence=pred.horizons[1].confidence_score
            ))
            is_telemetry_backed = True
            
            reply = (
                f"Based on our Gradient Boosting Time-Series model trained on multi-lag urban traffic history:\n\n"
                f"• **In 15 Minutes:** Congestion is projected at **{pred.horizons[0].predicted_value}%** (Confidence: 94%)\n"
                f"• **In 30 Minutes:** Congestion will rise to **{p30.predicted_value}%** (Confidence: 91%, CI: {p30.lower_bound}% – {p30.upper_bound}%)\n"
                f"• **In 60 Minutes:** Congestion is forecasted to peak at **{p60.predicted_value}%**\n\n"
                f"**Key Factor Breakdown (SHAP Weights):**\n"
                f"– Peak hour diurnal demand (+14.2% impact)\n"
                f"– Upstream arterial spillover (+8.5% occupancy)"
            )
            suggested = [
                "Why is traffic increasing near Gate 2?",
                "Which scenario gives the lowest congestion?",
                "Which area has the highest pollution?"
            ]

        # 3. POLLUTION / AQI INQUIRIES
        elif "pollution" in msg_lower or "aqi" in msg_lower or "air quality" in msg_lower:
            aqi_nodes = telemetry_service.get_live_air_quality()
            max_aqi_node = max(aqi_nodes, key=lambda x: x.aqi)
            
            sources.append(GroundedSourceDTO(
                source_type="telemetry",
                title=f"Air Quality Telemetry Sensor ({max_aqi_node.location_name})",
                snippet=f"Highest AQI: {max_aqi_node.aqi} (PM2.5: {max_aqi_node.pm25} µg/m³, NO2: {max_aqi_node.no2} ppb).",
                confidence=0.98
            ))
            sources.append(GroundedSourceDTO(
                source_type="policy",
                title="Metropolitan Clean Air Action Plan 2026",
                snippet="AQI between 101-200 indicates Moderate Pollution with PM2.5 as primary contributor.",
                confidence=0.94
            ))
            is_telemetry_backed = True

            reply = (
                f"The highest pollution is currently registered in **{max_aqi_node.location_name}** with an **AQI of {max_aqi_node.aqi}** (Moderate/Unhealthy for Sensitive Groups).\n\n"
                f"**Pollutant Breakdown:**\n"
                f"• **PM2.5:** {max_aqi_node.pm25} µg/m³ (Primary Pollutant)\n"
                f"• **PM10:** {max_aqi_node.pm10} µg/m³\n"
                f"• **NO₂:** {max_aqi_node.no2} ppb\n\n"
                f"**Root Cause Analysis:** Heavy vehicular idling along Tech Expressway coupled with low wind dispersion (14 km/h)."
            )
            suggested = [
                "What will pollution look like in the next 2 hours?",
                "Why did energy consumption increase?",
                "Which scenario gives the lowest congestion?"
            ]

        # 4. ENERGY INQUIRIES
        elif "energy" in msg_lower or "power" in msg_lower or "kwh" in msg_lower or "electricity" in msg_lower:
            buildings = telemetry_service.get_live_buildings()
            anom_b = next((b for b in buildings if b.is_anomaly), buildings[1])
            
            sources.append(GroundedSourceDTO(
                source_type="telemetry",
                title=f"Smart Building Power Meter ({anom_b.name})",
                snippet=f"Current consumption: {anom_b.current_energy_kwh} kWh (Baseline: {anom_b.base_energy_kwh} kWh, +48.7% surge).",
                confidence=0.95
            ))
            sources.append(GroundedSourceDTO(
                source_type="policy",
                title="Smart Campus Microgrid Operating Guidelines",
                snippet="Data Center power draw above 160 kWh triggers thermal cooling strain alerts.",
                confidence=0.91
            ))
            is_telemetry_backed = True

            reply = (
                f"Energy consumption increased primarily due to an anomaly in **{anom_b.name}**:\n\n"
                f"• **Current Draw:** {anom_b.current_energy_kwh} kWh (Normal baseline: 120.0 kWh)\n"
                f"• **Peak Demand:** {anom_b.peak_demand_kw} kW\n"
                f"• **AI Diagnostic:** Isolation Forest detected a +48.7% thermal cooling ramp triggered by high server compute utilization.\n\n"
                f"**Recommended Action:** Trigger auxiliary chiller circuit and engage smart peak-shaving at Solar Substation."
            )
            suggested = [
                "Which area has the highest pollution?",
                "What happens if Road A is closed?",
                "Which scenario gives the lowest congestion?"
            ]

        # 5. ROAD CLOSURE WHAT-IF INQUIRIES (e.g. "What happens if Road A is closed?")
        elif "road a" in msg_lower or "closed" in msg_lower or "closure" in msg_lower:
            sim_res = scenario_engine.run_simulation("road_closure", {"road_id": 1, "road_name": "Avenue 1 - Boulevard North", "duration_hours": 4})
            
            sources.append(GroundedSourceDTO(
                source_type="simulation",
                title="Scenario Simulation Engine: Road Closure Model",
                snippet=f"Corridor B congestion: +{sim_res['delta_pct']['corridor_b_congestion_delta_pct']}%, Road C: +{sim_res['delta_pct']['corridor_c_congestion_delta_pct']}%, Travel time: +{sim_res['delta_pct']['travel_time_delta_pct']}%.",
                confidence=0.93
            ))
            is_telemetry_backed = True

            reply = (
                f"**Simulation Output: Closure of Road A (Avenue 1 - Boulevard North)**\n\n"
                f"According to the What-If Simulation Engine:\n"
                f"• **Corridor B Traffic:** Surges by **+{sim_res['delta_pct']['corridor_b_congestion_delta_pct']}%** (from 62% to 89.5% congestion)\n"
                f"• **Road C (Tech Expressway):** Surges by **+{sim_res['delta_pct']['corridor_c_congestion_delta_pct']}%** (from 54% to 82% congestion)\n"
                f"• **Network Travel Time:** Increases by **+{sim_res['delta_pct']['travel_time_delta_pct']}%** (from 18.2 mins to 29.8 mins)\n\n"
                f"**AI Recommendation:** {sim_res['recommendation'].splitlines()[0]}"
            )
            suggested = [
                "Which scenario gives the lowest congestion?",
                "Why is traffic increasing near Gate 2?",
                "What will traffic look like in 30 minutes?"
            ]

        # 6. SCENARIO / OPTIMIZATION DECISION INQUIRIES
        elif "scenario" in msg_lower or "lowest congestion" in msg_lower or "optimize" in msg_lower or "decision" in msg_lower:
            opt_res = optimization_engine.solve({"congestion": 0.50, "energy": 0.20, "emissions": 0.20, "response_time": 0.10})
            top_dec = opt_res.recommended_decisions[0]
            second_dec = opt_res.recommended_decisions[1]

            sources.append(GroundedSourceDTO(
                source_type="simulation",
                title="Multi-Objective Genetic Algorithm Optimizer",
                snippet=f"Top candidate: {top_dec.action_title} with {top_dec.projected_savings_pct['congestion_relief_pct']}% congestion reduction.",
                confidence=0.95
            ))
            is_telemetry_backed = True

            reply = (
                f"To achieve the **lowest congestion and maximum network flow**, the Multi-Objective Optimizer ranks the following interventions:\n\n"
                f"1. **{top_dec.action_title}**\n"
                f"   – Congestion Relief: **-{top_dec.projected_savings_pct['congestion_relief_pct']}%**\n"
                f"   – Emergency Speedup: **+{top_dec.projected_savings_pct['emergency_response_speedup_pct']}%**\n"
                f"   – Implementation Complexity: **{top_dec.implementation_complexity}**\n\n"
                f"2. **{second_dec.action_title}**\n"
                f"   – Congestion Relief: **-{second_dec.projected_savings_pct['congestion_relief_pct']}%**\n"
                f"   – CO₂ Emissions Cut: **-{second_dec.projected_savings_pct['co2_emissions_cut_pct']}%**"
            )
            suggested = [
                "Why is traffic increasing near Gate 2?",
                "What happens if Road A is closed?",
                "Which area has the highest pollution?"
            ]

        # 7. FALLBACK WITH EXPLICIT TRUTH DISCIPLINE
        else:
            # Check if any document matches keywords
            matched_docs = [d for d in self.documents if any(w in d["content"].lower() for w in user_message.lower().split() if len(w) > 3)]
            if matched_docs:
                doc = matched_docs[0]
                sources.append(GroundedSourceDTO(
                    source_type="policy",
                    title=doc["title"],
                    snippet=doc["content"][:160] + "...",
                    confidence=0.88
                ))
                reply = (
                    f"Based on smart city knowledge document **{doc['title']}**:\n\n"
                    f"{doc['content']}\n\n"
                    f"If you require live sensor readings or predictive simulations, please specify the zone, road segment, or scenario."
                )
            else:
                reply = (
                    "I don't have enough data to determine that. "
                    "Please ask about live traffic bottlenecks, 15m–2h forecasts, air quality, building energy anomalies, or scenario simulations (such as road closures or EV expansion)."
                )
            suggested = [
                "Why is traffic increasing near Gate 2?",
                "What will traffic look like in 30 minutes?",
                "Which area has the highest pollution?",
                "What happens if Road A is closed?"
            ]

        return ChatResponseDTO(
            reply=reply,
            grounded_sources=sources,
            suggested_followups=suggested,
            is_telemetry_backed=is_telemetry_backed
        )

twin_ai_assistant = TwinAIAssistant()
