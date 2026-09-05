from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON, Index
)
from sqlalchemy.orm import relationship
from app.core.database import Base

def utcnow():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="Viewer", nullable=False)  # Admin, Analyst, Viewer
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    
    scenarios = relationship("Scenario", back_populates="creator")
    reports = relationship("Report", back_populates="user")
    chats = relationship("ChatHistory", back_populates="user")


class Location(Base):
    __tablename__ = "locations"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    code = Column(String(50), unique=True, index=True, nullable=False)
    zone_type = Column(String(100), nullable=False)  # Residential, Commercial, Industrial, Campus, Institutional
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    boundary_geojson = Column(JSON, nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    
    roads = relationship("Road", back_populates="zone")
    buildings = relationship("Building", back_populates="zone")
    air_quality_records = relationship("AirQualityData", back_populates="location")
    water_records = relationship("WaterUsage", back_populates="location")
    weather_records = relationship("WeatherData", back_populates="location")


class Road(Base):
    __tablename__ = "roads"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    code = Column(String(50), unique=True, index=True, nullable=False)
    zone_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    start_lat = Column(Float, nullable=False)
    start_lng = Column(Float, nullable=False)
    end_lat = Column(Float, nullable=False)
    end_lng = Column(Float, nullable=False)
    capacity_vph = Column(Integer, default=2000)  # Vehicles per hour
    length_km = Column(Float, default=1.5)
    speed_limit_kmh = Column(Float, default=60.0)
    current_status = Column(String(50), default="Open")  # Open, Closed, Congested, Restricted
    
    zone = relationship("Location", back_populates="roads")
    traffic_records = relationship("TrafficData", back_populates="road")


class Building(Base):
    __tablename__ = "buildings"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    code = Column(String(50), unique=True, index=True, nullable=False)
    zone_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    building_type = Column(String(100), nullable=False)  # Academic, Lab, Office, Residential, Data Center
    floor_area_sqm = Column(Float, default=5000.0)
    base_energy_kwh = Column(Float, default=50.0)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    occupancy_capacity = Column(Integer, default=500)
    
    zone = relationship("Location", back_populates="buildings")
    energy_records = relationship("EnergyUsage", back_populates="building")


class TrafficData(Base):
    __tablename__ = "traffic_data"
    
    id = Column(Integer, primary_key=True, index=True)
    road_id = Column(Integer, ForeignKey("roads.id"), index=True, nullable=False)
    timestamp = Column(DateTime(timezone=True), default=utcnow, index=True)
    vehicle_count = Column(Integer, nullable=False)
    avg_speed_kmh = Column(Float, nullable=False)
    occupancy_pct = Column(Float, nullable=False)
    congestion_pct = Column(Float, nullable=False)
    level_of_service = Column(String(10), default="C")  # A, B, C, D, E, F
    is_simulated = Column(Boolean, default=True)  # Clearly labels demo/simulated vs real
    
    road = relationship("Road", back_populates="traffic_records")


class AirQualityData(Base):
    __tablename__ = "air_quality"
    
    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), index=True, nullable=False)
    timestamp = Column(DateTime(timezone=True), default=utcnow, index=True)
    aqi = Column(Integer, nullable=False)
    pm25 = Column(Float, nullable=False)
    pm10 = Column(Float, nullable=False)
    no2 = Column(Float, nullable=False)
    co = Column(Float, nullable=False)
    so2 = Column(Float, nullable=False)
    o3 = Column(Float, nullable=False)
    primary_pollutant = Column(String(50), default="PM2.5")
    is_simulated = Column(Boolean, default=True)
    
    location = relationship("Location", back_populates="air_quality_records")


class EnergyUsage(Base):
    __tablename__ = "energy_usage"
    
    id = Column(Integer, primary_key=True, index=True)
    building_id = Column(Integer, ForeignKey("buildings.id"), index=True, nullable=False)
    timestamp = Column(DateTime(timezone=True), default=utcnow, index=True)
    consumption_kwh = Column(Float, nullable=False)
    peak_kw = Column(Float, nullable=False)
    power_factor = Column(Float, default=0.95)
    temperature_c = Column(Float, default=26.0)
    is_anomaly = Column(Boolean, default=False)
    is_simulated = Column(Boolean, default=True)
    
    building = relationship("Building", back_populates="energy_records")


class WaterUsage(Base):
    __tablename__ = "water_usage"
    
    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), index=True, nullable=False)
    timestamp = Column(DateTime(timezone=True), default=utcnow, index=True)
    consumption_liters = Column(Float, nullable=False)
    flow_rate_lps = Column(Float, nullable=False)
    tank_level_pct = Column(Float, nullable=False)
    pressure_bar = Column(Float, default=3.2)
    is_anomaly = Column(Boolean, default=False)
    is_simulated = Column(Boolean, default=True)
    
    location = relationship("Location", back_populates="water_records")


class WeatherData(Base):
    __tablename__ = "weather_data"
    
    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), index=True, nullable=False)
    timestamp = Column(DateTime(timezone=True), default=utcnow, index=True)
    temperature_c = Column(Float, nullable=False)
    humidity_pct = Column(Float, nullable=False)
    precipitation_mm = Column(Float, default=0.0)
    wind_speed_kmh = Column(Float, default=12.0)
    wind_direction_deg = Column(Float, default=180.0)
    condition = Column(String(100), default="Clear")  # Clear, Partly Cloudy, Rain, Thunderstorm, Fog
    visibility_km = Column(Float, default=10.0)
    is_simulated = Column(Boolean, default=True)
    
    location = relationship("Location", back_populates="weather_records")


class Prediction(Base):
    __tablename__ = "predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    model_id = Column(String(100), index=True, nullable=False)
    entity_type = Column(String(50), index=True, nullable=False)  # traffic, aqi, energy, water
    target_id = Column(Integer, index=True, nullable=False)
    forecast_horizon = Column(String(20), nullable=False)  # 15m, 30m, 60m, 2h
    predicted_value = Column(Float, nullable=False)
    lower_bound = Column(Float, nullable=False)
    upper_bound = Column(Float, nullable=False)
    confidence_score = Column(Float, default=0.92)
    explanation_json = Column(JSON, nullable=True)  # SHAP / factor breakdown
    created_at = Column(DateTime(timezone=True), default=utcnow)


class Anomaly(Base):
    __tablename__ = "anomalies"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), default=utcnow, index=True)
    entity_type = Column(String(50), index=True, nullable=False)  # traffic, energy, aqi, water
    entity_id = Column(Integer, nullable=False)
    entity_name = Column(String(255), nullable=False)
    metric_name = Column(String(100), nullable=False)
    actual_value = Column(Float, nullable=False)
    expected_value = Column(Float, nullable=False)
    severity = Column(String(50), default="Medium")  # Low, Medium, High, Critical
    confidence = Column(Float, default=0.88)
    explanation = Column(Text, nullable=False)
    recommended_action = Column(Text, nullable=False)
    status = Column(String(50), default="Active")  # Active, Investigating, Resolved


class Scenario(Base):
    __tablename__ = "scenarios"
    
    id = Column(Integer, primary_key=True, index=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    scenario_type = Column(String(100), nullable=False)  # road_closure, ev_surge, transit_boost, extreme_weather
    parameters = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    
    creator = relationship("User", back_populates="scenarios")
    results = relationship("ScenarioResult", back_populates="scenario", uselist=False)


class ScenarioResult(Base):
    __tablename__ = "scenario_results"
    
    id = Column(Integer, primary_key=True, index=True)
    scenario_id = Column(Integer, ForeignKey("scenarios.id"), unique=True, nullable=False)
    baseline_metrics = Column(JSON, nullable=False)
    simulated_metrics = Column(JSON, nullable=False)
    delta_pct = Column(JSON, nullable=False)
    impact_summary = Column(Text, nullable=False)
    affected_nodes = Column(JSON, nullable=False)
    recommendation = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    
    scenario = relationship("Scenario", back_populates="results")


class ModelMetric(Base):
    __tablename__ = "model_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(100), unique=True, index=True, nullable=False)
    domain = Column(String(50), index=True, nullable=False)  # traffic, aqi, energy, anomaly
    algorithm = Column(String(100), nullable=False)  # LinearRegression, RandomForest, XGBoost, LSTM, IsolationForest
    dataset_version = Column(String(50), default="v1.0")
    mae = Column(Float, nullable=False)
    rmse = Column(Float, nullable=False)
    mape = Column(Float, nullable=False)
    r2_score = Column(Float, nullable=False)
    drift_score = Column(Float, default=0.02)
    is_active = Column(Boolean, default=True)
    last_trained = Column(DateTime(timezone=True), default=utcnow)


class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    category = Column(String(50), nullable=False)  # Traffic, AQI, Energy, Water, Weather, Security
    severity = Column(String(50), default="Medium")  # Low, Medium, High, Critical
    message = Column(Text, nullable=False)
    location_name = Column(String(255), nullable=False)
    status = Column(String(50), default="Active")  # Active, Acknowledged, Resolved
    created_at = Column(DateTime(timezone=True), default=utcnow, index=True)


class Report(Base):
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String(255), nullable=False)
    report_type = Column(String(50), default="Comprehensive")  # Comprehensive, Executive, Traffic, Energy, Scenario
    executive_summary = Column(Text, nullable=False)
    data_payload = Column(JSON, nullable=False)
    file_path = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    
    user = relationship("User", back_populates="reports")


class Document(Base):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    domain = Column(String(100), index=True, nullable=False)  # policy, infrastructure, sensor_manual, emergency_sop, research
    content = Column(Text, nullable=False)
    embedding_json = Column(JSON, nullable=True)
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)


class ChatHistory(Base):
    __tablename__ = "chat_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    session_id = Column(String(100), index=True, nullable=False)
    role = Column(String(50), nullable=False)  # user, assistant
    content = Column(Text, nullable=False)
    context_sources_json = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    
    user = relationship("User", back_populates="chats")
