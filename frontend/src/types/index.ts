export type UserRole = 'Admin' | 'Analyst' | 'Viewer';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface KPICardData {
  title: string;
  current_value: string;
  numeric_value: number;
  unit: string;
  prediction_text: string;
  prediction_trend_pct: number;
  status: 'optimal' | 'warning' | 'critical';
  subtext: string;
}

export interface DashboardOverview {
  timestamp: string;
  is_demo_mode: boolean;
  traffic_kpi: KPICardData;
  aqi_kpi: KPICardData;
  energy_kpi: KPICardData;
  risk_kpi: KPICardData;
  active_anomalies_count: number;
  active_alerts_count: number;
  system_health_pct: number;
}

export interface RoadAsset {
  id: number;
  name: string;
  code: string;
  zone_id?: number;
  start_lat: number;
  start_lng: number;
  end_lat: number;
  end_lng: number;
  capacity_vph: number;
  length_km: number;
  speed_limit_kmh: number;
  current_status: string;
  current_congestion_pct: number;
  current_avg_speed: number;
  current_vehicle_count: number;
}

export interface BuildingAsset {
  id: number;
  name: string;
  code: string;
  zone_id?: number;
  building_type: string;
  floor_area_sqm: number;
  base_energy_kwh: number;
  latitude: number;
  longitude: number;
  occupancy_capacity: number;
  current_energy_kwh: number;
  peak_demand_kw: number;
  is_anomaly: boolean;
}

export interface AirQualityNode {
  id: number;
  location_id: number;
  location_name: string;
  timestamp: string;
  aqi: number;
  pm25: number;
  pm10: number;
  no2: number;
  co: number;
  so2: number;
  o3: number;
  primary_pollutant: string;
  is_simulated: boolean;
}

export interface WaterNode {
  id: number;
  location_id: number;
  location_name: string;
  timestamp: string;
  consumption_liters: number;
  flow_rate_lps: number;
  tank_level_pct: number;
  pressure_bar: number;
  is_anomaly: boolean;
  is_simulated: boolean;
}

export interface WeatherData {
  id: number;
  location_id: number;
  location_name: string;
  timestamp: string;
  temperature_c: number;
  humidity_pct: number;
  precipitation_mm: number;
  wind_speed_kmh: number;
  wind_direction_deg: number;
  condition: string;
  visibility_km: number;
  is_simulated: boolean;
}

export interface AnomalyItem {
  id: number;
  timestamp: string;
  entity_type: string;
  entity_id: number;
  entity_name: string;
  metric_name: string;
  actual_value: number;
  expected_value: number;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  confidence: number;
  explanation: string;
  recommended_action: string;
  status: string;
}

export interface PredictionHorizon {
  horizon: string;
  predicted_value: number;
  lower_bound: number;
  upper_bound: number;
  confidence_score: number;
}

export interface PredictionResponse {
  entity_type: string;
  target_id: number;
  target_name: string;
  current_value: number;
  horizons: PredictionHorizon[];
  important_factors: { factor: string; importance_pct: number; impact: string }[];
  explanation: string;
  model_name: string;
}

export interface ScenarioResult {
  scenario_id: number;
  title: string;
  scenario_type: string;
  parameters: Record<string, any>;
  baseline_metrics: Record<string, any>;
  simulated_metrics: Record<string, any>;
  delta_pct: Record<string, number>;
  impact_summary: string;
  affected_nodes: { node_id: number; name: string; role: string; load_increase: string; status: string }[];
  recommendation: string;
  created_at: string;
}

export interface OptimizationDecision {
  rank: number;
  action_title: string;
  category: string;
  expected_benefit: string;
  projected_savings_pct: Record<string, number>;
  implementation_complexity: 'Low' | 'Medium' | 'High';
  parameters: Record<string, any>;
}

export interface OptimizationResult {
  solver_algorithm: string;
  evaluated_candidates_count: number;
  pareto_score: number;
  recommended_decisions: OptimizationDecision[];
  tradeoff_matrix: { objective: string; weight: number; expected_system_improvement_pct: number }[];
}

export interface GroundedSource {
  source_type: string;
  title: string;
  snippet: string;
  confidence: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  sources?: GroundedSource[];
  suggested_followups?: string[];
  is_telemetry_backed?: boolean;
}

export interface DetectionObject {
  id: string;
  label: string;
  confidence: number;
  bbox: [number, number, number, number];
  speed_kmh?: number;
}

export interface CameraFeed {
  camera_id: string;
  location_name: string;
  fps: number;
  total_vehicles: number;
  vehicle_types: Record<string, number>;
  crowd_density_pct: number;
  average_speed_kmh: number;
  detections: DetectionObject[];
  is_simulated_stream: boolean;
}

export interface ModelMetric {
  id: number;
  model_name: string;
  domain: string;
  algorithm: string;
  dataset_version: string;
  mae: number;
  rmse: number;
  mape: number;
  r2_score: number;
  drift_score: number;
  is_active: boolean;
  last_trained: string;
}
