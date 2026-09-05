import math
import random
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Any
from app.schemas.schemas import (
    DashboardOverviewDTO, KPICardDTO, RoadDTO, BuildingDTO,
    AirQualityDTO, WaterDTO, WeatherDTO, AnomalyDTO
)

# Simulated Urban Nodes
LOCATIONS_DATA = [
    {"id": 1, "name": "North Tech Corridor", "code": "ZONE_TECH_N", "zone_type": "Commercial / R&D", "latitude": 28.6139, "longitude": 77.2090, "description": "High-density tech enterprise & incubation zone"},
    {"id": 2, "name": "Central Campus Quad", "code": "ZONE_CAMPUS_C", "zone_type": "Institutional / Academic", "latitude": 28.6190, "longitude": 77.2150, "description": "Academic departments, main library, and student hub"},
    {"id": 3, "name": "South Gateway & Transit Hub", "code": "ZONE_TRANSIT_S", "zone_type": "Transit / Commercial", "latitude": 28.6080, "longitude": 77.2020, "description": "Intermodal metro station and arterial interchange"},
    {"id": 4, "name": "East Eco-Park & Bio-Valley", "code": "ZONE_ECO_E", "zone_type": "Recreational / Green Zone", "latitude": 28.6250, "longitude": 77.2280, "description": "Urban green belt, retention lakes, and solar canopy"},
    {"id": 5, "name": "West Innovation District", "code": "ZONE_INNOV_W", "zone_type": "Mixed-Use / Residential", "latitude": 28.6050, "longitude": 77.2210, "description": "Smart residential lofts and light research facilities"}
]

ROADS_DATA = [
    {"id": 1, "name": "Avenue 1 - Boulevard North", "code": "RD_AVE1", "zone_id": 1, "start_lat": 28.6139, "start_lng": 77.2090, "end_lat": 28.6190, "end_lng": 77.2150, "capacity_vph": 2400, "length_km": 1.8, "speed_limit_kmh": 60.0, "current_status": "Open"},
    {"id": 2, "name": "Corridor B - Central Arterial", "code": "RD_CORR_B", "zone_id": 2, "start_lat": 28.6190, "start_lng": 77.2150, "end_lat": 28.6080, "end_lng": 77.2020, "capacity_vph": 3200, "length_km": 2.4, "speed_limit_kmh": 70.0, "current_status": "Open"},
    {"id": 3, "name": "Road C - Tech Expressway", "code": "RD_EXPR_C", "zone_id": 1, "start_lat": 28.6139, "start_lng": 77.2090, "end_lat": 28.6080, "end_lng": 77.2020, "capacity_vph": 3600, "length_km": 2.1, "speed_limit_kmh": 80.0, "current_status": "Open"},
    {"id": 4, "name": "Ringway D - East Loop", "code": "RD_RING_D", "zone_id": 4, "start_lat": 28.6190, "start_lng": 77.2150, "end_lat": 28.6250, "end_lng": 77.2280, "capacity_vph": 1800, "length_km": 1.6, "speed_limit_kmh": 50.0, "current_status": "Open"},
    {"id": 5, "name": "Gateway Link 5 - West Access", "code": "RD_LINK_5", "zone_id": 5, "start_lat": 28.6080, "start_lng": 77.2020, "end_lat": 28.6050, "end_lng": 77.2210, "capacity_vph": 2000, "length_km": 1.9, "speed_limit_kmh": 60.0, "current_status": "Open"},
    {"id": 6, "name": "Eco-Drive 6 - South Crossway", "code": "RD_ECO_6", "zone_id": 4, "start_lat": 28.6250, "start_lng": 77.2280, "end_lat": 28.6050, "end_lng": 77.2210, "capacity_vph": 1600, "length_km": 2.7, "speed_limit_kmh": 50.0, "current_status": "Open"}
]

BUILDINGS_DATA = [
    {"id": 1, "name": "Cybernetics & AI Institute", "code": "BLD_AI_INST", "zone_id": 2, "building_type": "Academic / Lab", "floor_area_sqm": 8500.0, "base_energy_kwh": 65.0, "latitude": 28.6185, "longitude": 77.2145, "occupancy_capacity": 800},
    {"id": 2, "name": "Apex Cloud Data Center", "code": "BLD_DC_APEX", "zone_id": 1, "building_type": "Data Center", "floor_area_sqm": 4200.0, "base_energy_kwh": 120.0, "latitude": 28.6145, "longitude": 77.2095, "occupancy_capacity": 120},
    {"id": 3, "name": "Smart Mobility Command Tower", "code": "BLD_TOWER_OPS", "zone_id": 3, "building_type": "Operations Center", "floor_area_sqm": 6000.0, "base_energy_kwh": 48.0, "latitude": 28.6085, "longitude": 77.2025, "occupancy_capacity": 450},
    {"id": 4, "name": "Bio-Sciences Research Pavilion", "code": "BLD_BIO_RES", "zone_id": 4, "building_type": "Lab / Cleanroom", "floor_area_sqm": 7200.0, "base_energy_kwh": 78.0, "latitude": 28.6245, "longitude": 77.2275, "occupancy_capacity": 350},
    {"id": 5, "name": "Futura Residential Pods 1", "code": "BLD_RES_POD1", "zone_id": 5, "building_type": "Residential", "floor_area_sqm": 11000.0, "base_energy_kwh": 40.0, "latitude": 28.6055, "longitude": 77.2205, "occupancy_capacity": 950},
    {"id": 6, "name": "Solar & Microgrid Substation", "code": "BLD_GRID_SUB", "zone_id": 4, "building_type": "Infrastructure", "floor_area_sqm": 2500.0, "base_energy_kwh": 15.0, "latitude": 28.6230, "longitude": 77.2260, "occupancy_capacity": 40}
]

class TelemetryService:
    def __init__(self):
        self.tick_count = 0

    def get_current_time_factor(self) -> float:
        # Diurnal wave modeling daily peak at 9am-11am and 5pm-8pm
        now = datetime.now(timezone.utc)
        hour = now.hour + (now.minute / 60.0)
        # Peak traffic factor
        morning_peak = math.exp(-0.5 * ((hour - 9.0) / 1.8) ** 2)
        evening_peak = math.exp(-0.5 * ((hour - 18.0) / 2.2) ** 2)
        base = 0.35 + 0.50 * morning_peak + 0.55 * evening_peak
        return min(max(base, 0.2), 1.0)

    def get_live_roads(self) -> List[RoadDTO]:
        tf = self.get_current_time_factor()
        roads = []
        for r in ROADS_DATA:
            noise = math.sin(self.tick_count * 0.1 + r["id"]) * 0.08
            congestion = min(max(tf * 80.0 + (r["id"] * 4.0) + noise * 10.0, 15.0), 96.0)
            avg_speed = max(r["speed_limit_kmh"] * (1.0 - (congestion / 100.0) * 0.75), 12.0)
            v_count = int((congestion / 100.0) * r["capacity_vph"] * 0.8)
            status = "Congested" if congestion > 75.0 else ("Moderate" if congestion > 45.0 else "Optimal")
            
            roads.append(RoadDTO(
                id=r["id"],
                name=r["name"],
                code=r["code"],
                zone_id=r["zone_id"],
                start_lat=r["start_lat"],
                start_lng=r["start_lng"],
                end_lat=r["end_lat"],
                end_lng=r["end_lng"],
                capacity_vph=r["capacity_vph"],
                length_km=r["length_km"],
                speed_limit_kmh=r["speed_limit_kmh"],
                current_status=status,
                current_congestion_pct=round(congestion, 1),
                current_avg_speed=round(avg_speed, 1),
                current_vehicle_count=v_count
            ))
        return roads

    def get_live_buildings(self) -> List[BuildingDTO]:
        tf = self.get_current_time_factor()
        buildings = []
        for b in BUILDINGS_DATA:
            noise = math.sin(self.tick_count * 0.15 + b["id"]) * 0.1
            kwh = b["base_energy_kwh"] * (0.6 + 0.7 * tf + noise)
            peak_kw = kwh * 1.35
            is_anomaly = False
            if b["id"] == 2 and (self.tick_count % 12 > 7):
                # Data center thermal / compute load spike anomaly demonstration
                kwh *= 1.48
                peak_kw *= 1.55
                is_anomaly = True

            buildings.append(BuildingDTO(
                id=b["id"],
                name=b["name"],
                code=b["code"],
                zone_id=b["zone_id"],
                building_type=b["building_type"],
                floor_area_sqm=b["floor_area_sqm"],
                base_energy_kwh=b["base_energy_kwh"],
                latitude=b["latitude"],
                longitude=b["longitude"],
                occupancy_capacity=b["occupancy_capacity"],
                current_energy_kwh=round(kwh, 1),
                peak_demand_kw=round(peak_kw, 1),
                is_anomaly=is_anomaly
            ))
        return buildings

    def get_live_air_quality(self) -> List[AirQualityDTO]:
        now = datetime.now(timezone.utc)
        aqi_list = []
        for loc in LOCATIONS_DATA:
            base_aqi = 110 if loc["id"] in [1, 3] else (72 if loc["id"] == 4 else 95)
            fluctuation = math.sin(self.tick_count * 0.08 + loc["id"]) * 14.0
            current_aqi = int(base_aqi + fluctuation)
            pm25 = round(current_aqi * 0.42, 1)
            pm10 = round(current_aqi * 0.78, 1)
            no2 = round(32.0 + (current_aqi * 0.18), 1)
            co = round(0.8 + (current_aqi * 0.01), 2)
            so2 = round(12.0 + (current_aqi * 0.08), 1)
            o3 = round(45.0 + math.sin(loc["id"]) * 8.0, 1)

            aqi_list.append(AirQualityDTO(
                id=loc["id"],
                location_id=loc["id"],
                location_name=loc["name"],
                timestamp=now,
                aqi=current_aqi,
                pm25=pm25,
                pm10=pm10,
                no2=no2,
                co=co,
                so2=so2,
                o3=o3,
                primary_pollutant="PM2.5" if pm25 > 35.0 else "NO2",
                is_simulated=True
            ))
        return aqi_list

    def get_live_water(self) -> List[WaterDTO]:
        now = datetime.now(timezone.utc)
        water_list = []
        for loc in LOCATIONS_DATA:
            tank_pct = max(35.0, min(92.0, 75.0 + math.cos(self.tick_count * 0.05 + loc["id"]) * 18.0))
            flow = max(1.2, 4.5 + math.sin(self.tick_count * 0.1 + loc["id"]) * 2.1)
            consumption = flow * 3600.0 * 0.8
            is_anomaly = loc["id"] == 1 and (self.tick_count % 16 > 11)  # Potential leak in tech zone

            water_list.append(WaterDTO(
                id=loc["id"],
                location_id=loc["id"],
                location_name=loc["name"],
                timestamp=now,
                consumption_liters=round(consumption, 0),
                flow_rate_lps=round(flow, 2),
                tank_level_pct=round(tank_pct, 1),
                pressure_bar=round(3.2 + (0.5 if not is_anomaly else -1.2), 2),
                is_anomaly=is_anomaly,
                is_simulated=True
            ))
        return water_list

    def get_live_weather(self) -> WeatherDTO:
        now = datetime.now(timezone.utc)
        temp = 28.5 + math.sin(self.tick_count * 0.04) * 3.5
        humidity = 58.0 + math.cos(self.tick_count * 0.04) * 12.0
        wind = 14.0 + math.sin(self.tick_count * 0.1) * 4.0
        return WeatherDTO(
            id=1,
            location_id=1,
            location_name="Metropolitan Central Station",
            timestamp=now,
            temperature_c=round(temp, 1),
            humidity_pct=round(humidity, 1),
            precipitation_mm=0.0,
            wind_speed_kmh=round(wind, 1),
            wind_direction_deg=215.0,
            condition="Partly Cloudy",
            visibility_km=8.5,
            is_simulated=True
        )

    def get_dashboard_overview(self) -> DashboardOverviewDTO:
        self.tick_count += 1
        roads = self.get_live_roads()
        buildings = self.get_live_buildings()
        aqi_nodes = self.get_live_air_quality()

        avg_congestion = sum(r.current_congestion_pct for r in roads) / len(roads)
        avg_aqi = sum(a.aqi for a in aqi_nodes) / len(aqi_nodes)
        total_energy = sum(b.current_energy_kwh for b in buildings)
        anomaly_count = sum(1 for b in buildings if b.is_anomaly)

        # Risk Index calculation
        risk_score = (avg_congestion * 0.35) + (avg_aqi * 0.30) + (anomaly_count * 15.0)
        risk_level = "Critical" if risk_score > 75 else ("Elevated" if risk_score > 55 else ("Moderate" if risk_score > 35 else "Low"))

        now = datetime.now(timezone.utc)
        return DashboardOverviewDTO(
            timestamp=now,
            is_demo_mode=True,
            traffic_kpi=KPICardDTO(
                title="Traffic Congestion",
                current_value=f"{int(avg_congestion)}%",
                numeric_value=round(avg_congestion, 1),
                unit="%",
                prediction_text="+18% in next 60m",
                prediction_trend_pct=18.4,
                status="warning" if avg_congestion > 65 else "optimal",
                subtext="Peak arterial density across Corridor B & Expressway"
            ),
            aqi_kpi=KPICardDTO(
                title="Air Quality Index",
                current_value=f"{int(avg_aqi)} AQI",
                numeric_value=round(avg_aqi, 0),
                unit="AQI",
                prediction_text="Moderate deterioration",
                prediction_trend_pct=8.2,
                status="warning" if avg_aqi > 100 else "optimal",
                subtext="PM2.5 predominant pollutant in Tech Corridor"
            ),
            energy_kpi=KPICardDTO(
                title="Grid Energy Consumption",
                current_value=f"{int(total_energy)} kWh",
                numeric_value=round(total_energy, 1),
                unit="kWh",
                prediction_text="+11% at 14:00 peak",
                prediction_trend_pct=11.0,
                status="warning" if total_energy > 400 else "optimal",
                subtext="Data Center operating near high thermal capacity"
            ),
            risk_kpi=KPICardDTO(
                title="Composite Urban Risk",
                current_value=risk_level,
                numeric_value=round(risk_score, 1),
                unit="Index",
                prediction_text="Elevated threat probability",
                prediction_trend_pct=14.5,
                status="critical" if risk_level == "Critical" else ("warning" if risk_level == "Elevated" else "optimal"),
                subtext="Traffic queue spilling into Transit Hub"
            ),
            active_anomalies_count=anomaly_count + 1,
            active_alerts_count=3,
            system_health_pct=98.4
        )

    def get_live_anomalies(self) -> List[AnomalyDTO]:
        now = datetime.now(timezone.utc)
        return [
            AnomalyDTO(
                id=101,
                timestamp=now - timedelta(minutes=4),
                entity_type="energy",
                entity_id=2,
                entity_name="Apex Cloud Data Center",
                metric_name="consumption_kwh",
                actual_value=178.5,
                expected_value=120.0,
                severity="High",
                confidence=0.94,
                explanation="Potential anomaly detected: HVAC thermal cooling ramp exceeded baseline diurnal threshold by 48.7%.",
                recommended_action="Initiate auxiliary cooling chiller unit and redistribute compute workloads across rack bank B.",
                status="Active"
            ),
            AnomalyDTO(
                id=102,
                timestamp=now - timedelta(minutes=12),
                entity_type="traffic",
                entity_id=2,
                entity_name="Corridor B - Central Arterial",
                metric_name="occupancy_pct",
                actual_value=89.2,
                expected_value=55.0,
                severity="Medium",
                confidence=0.91,
                explanation="Potential anomaly detected: Abrupt bottleneck formed near Gate 2 intersection with average speed dropping to 14 km/h.",
                recommended_action="Extend green signal phase by 25 seconds on North-South direction via dynamic signal controller.",
                status="Active"
            ),
            AnomalyDTO(
                id=103,
                timestamp=now - timedelta(minutes=28),
                entity_type="water",
                entity_id=1,
                entity_name="North Tech Corridor Station",
                metric_name="flow_rate_lps",
                actual_value=6.8,
                expected_value=3.4,
                severity="Medium",
                confidence=0.87,
                explanation="Potential anomaly detected: Sustained pressure loss (-1.2 bar) with high continuous night flow indicating sub-surface pipeline leak.",
                recommended_action="Dispatch maintenance crew to Valve Vault #4B for acoustic inspection.",
                status="Investigating"
            )
        ]

telemetry_service = TelemetryService()
