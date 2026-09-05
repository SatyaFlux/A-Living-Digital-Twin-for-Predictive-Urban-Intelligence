from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "Viewer"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# Location & Asset Schemas
class LocationDTO(BaseModel):
    id: int
    name: str
    code: str
    zone_type: str
    latitude: float
    longitude: float
    description: Optional[str] = None

    class Config:
        from_attributes = True

class RoadDTO(BaseModel):
    id: int
    name: str
    code: str
    zone_id: Optional[int]
    start_lat: float
    start_lng: float
    end_lat: float
    end_lng: float
    capacity_vph: int
    length_km: float
    speed_limit_kmh: float
    current_status: str
    current_congestion_pct: Optional[float] = 0.0
    current_avg_speed: Optional[float] = 60.0
    current_vehicle_count: Optional[int] = 0

    class Config:
        from_attributes = True

class BuildingDTO(BaseModel):
    id: int
    name: str
    code: str
    zone_id: Optional[int]
    building_type: str
    floor_area_sqm: float
    base_energy_kwh: float
    latitude: float
    longitude: float
    occupancy_capacity: int
    current_energy_kwh: Optional[float] = 0.0
    peak_demand_kw: Optional[float] = 0.0
    is_anomaly: Optional[bool] = False

    class Config:
        from_attributes = True

# Telemetry Schemas
class TrafficDataDTO(BaseModel):
    id: int
    road_id: int
    road_name: Optional[str] = None
    timestamp: datetime
    vehicle_count: int
    avg_speed_kmh: float
    occupancy_pct: float
    congestion_pct: float
    level_of_service: str
    is_simulated: bool = True

    class Config:
        from_attributes = True

class AirQualityDTO(BaseModel):
    id: int
    location_id: int
    location_name: Optional[str] = None
    timestamp: datetime
    aqi: int
    pm25: float
    pm10: float
    no2: float
    co: float
    so2: float
    o3: float
    primary_pollutant: str
    is_simulated: bool = True

    class Config:
        from_attributes = True

class EnergyDTO(BaseModel):
    id: int
    building_id: int
    building_name: Optional[str] = None
    timestamp: datetime
    consumption_kwh: float
    peak_kw: float
    power_factor: float
    temperature_c: float
    is_anomaly: bool
    is_simulated: bool = True

    class Config:
        from_attributes = True

class WaterDTO(BaseModel):
    id: int
    location_id: int
    location_name: Optional[str] = None
    timestamp: datetime
    consumption_liters: float
    flow_rate_lps: float
    tank_level_pct: float
    pressure_bar: float
    is_anomaly: bool
    is_simulated: bool = True

    class Config:
        from_attributes = True

class WeatherDTO(BaseModel):
    id: int
    location_id: int
    location_name: Optional[str] = None
    timestamp: datetime
    temperature_c: float
    humidity_pct: float
    precipitation_mm: float
    wind_speed_kmh: float
    wind_direction_deg: float
    condition: str
    visibility_km: float
    is_simulated: bool = True

    class Config:
        from_attributes = True

# Dashboard Summary Schema
class KPICardDTO(BaseModel):
    title: str
    current_value: str
    numeric_value: float
    unit: str
    prediction_text: str
    prediction_trend_pct: float
    status: str  # optimal, warning, critical
    subtext: str

class DashboardOverviewDTO(BaseModel):
    timestamp: datetime
    is_demo_mode: bool
    traffic_kpi: KPICardDTO
    aqi_kpi: KPICardDTO
    energy_kpi: KPICardDTO
    risk_kpi: KPICardDTO
    active_anomalies_count: int
    active_alerts_count: int
    system_health_pct: float

# Anomaly Schema
class AnomalyDTO(BaseModel):
    id: int
    timestamp: datetime
    entity_type: str
    entity_id: int
    entity_name: str
    metric_name: str
    actual_value: float
    expected_value: float
    severity: str
    confidence: float
    explanation: str
    recommended_action: str
    status: str

    class Config:
        from_attributes = True

# Prediction Schemas
class PredictionHorizonDTO(BaseModel):
    horizon: str  # 15m, 30m, 60m, 2h
    predicted_value: float
    lower_bound: float
    upper_bound: float
    confidence_score: float

class PredictionResponseDTO(BaseModel):
    entity_type: str
    target_id: int
    target_name: str
    current_value: float
    horizons: List[PredictionHorizonDTO]
    important_factors: List[Dict[str, Any]]
    explanation: str
    model_name: str

# Scenario & Simulation Schemas
class ScenarioCreateDTO(BaseModel):
    title: str
    description: Optional[str] = None
    scenario_type: str  # road_closure, ev_surge, transit_boost, extreme_weather
    parameters: Dict[str, Any]

class ScenarioResultDTO(BaseModel):
    scenario_id: int
    title: str
    scenario_type: str
    parameters: Dict[str, Any]
    baseline_metrics: Dict[str, Any]
    simulated_metrics: Dict[str, Any]
    delta_pct: Dict[str, float]
    impact_summary: str
    affected_nodes: List[Dict[str, Any]]
    recommendation: str
    created_at: datetime

# Optimization Schemas
class OptimizationRequestDTO(BaseModel):
    objective_weights: Dict[str, float] = Field(
        default={"congestion": 0.35, "energy": 0.25, "emissions": 0.25, "response_time": 0.15}
    )
    constraints: Optional[Dict[str, Any]] = None

class OptimizationDecisionDTO(BaseModel):
    rank: int
    action_title: str
    category: str
    expected_benefit: str
    projected_savings_pct: Dict[str, float]
    implementation_complexity: str  # Low, Medium, High
    parameters: Dict[str, Any]

class OptimizationResultDTO(BaseModel):
    solver_algorithm: str
    evaluated_candidates_count: int
    pareto_score: float
    recommended_decisions: List[OptimizationDecisionDTO]
    tradeoff_matrix: List[Dict[str, Any]]

# TwinAI / RAG Schemas
class GroundedSourceDTO(BaseModel):
    source_type: str  # telemetry, policy, simulation, manual
    title: str
    snippet: str
    confidence: float

class ChatRequestDTO(BaseModel):
    message: str
    session_id: Optional[str] = "default_session"

class ChatResponseDTO(BaseModel):
    reply: str
    grounded_sources: List[GroundedSourceDTO]
    suggested_followups: List[str]
    is_telemetry_backed: bool

# Model Monitoring Schemas
class ModelMetricDTO(BaseModel):
    id: int
    model_name: str
    domain: str
    algorithm: str
    dataset_version: str
    mae: float
    rmse: float
    mape: float
    r2_score: float
    drift_score: float
    is_active: bool
    last_trained: datetime

    class Config:
        from_attributes = True

# Vision Analytics Schemas
class DetectionObjectDTO(BaseModel):
    id: str
    label: str  # car, bus, truck, motorcycle, pedestrian, bicycle
    confidence: float
    bbox: List[float]  # [x, y, width, height] normalized
    speed_kmh: Optional[float] = None

class CameraFeedDTO(BaseModel):
    camera_id: str
    location_name: str
    fps: float
    total_vehicles: int
    vehicle_types: Dict[str, int]
    crowd_density_pct: float
    average_speed_kmh: float
    detections: List[DetectionObjectDTO]
    is_simulated_stream: bool = True
