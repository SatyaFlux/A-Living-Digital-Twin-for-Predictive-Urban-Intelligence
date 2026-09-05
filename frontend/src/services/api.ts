import {
  DashboardOverview, RoadAsset, BuildingAsset, AirQualityNode,
  WaterNode, WeatherData, AnomalyItem, PredictionResponse,
  ScenarioResult, OptimizationResult, CameraFeed, ModelMetric,
  User, ChatMessage
} from '../types';

const API_BASE_URL = 'http://localhost:8000/api/v1';

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('twin_token', token);
    } else {
      localStorage.removeItem('twin_token');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('twin_token');
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string> || {})
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.warn(`Fetch error for ${endpoint}, returning fallback data:`, error);
      throw error;
    }
  }

  // Dashboard
  async getDashboardOverview(): Promise<DashboardOverview> {
    return this.request<DashboardOverview>('/dashboard/overview');
  }

  // Digital Twin Unified State
  async getDigitalTwinState(): Promise<any> {
    return this.request<any>('/digital-twin/state');
  }

  // Traffic
  async getLiveTraffic(): Promise<RoadAsset[]> {
    return this.request<RoadAsset[]>('/traffic/live');
  }

  async getTrafficPrediction(roadId: number): Promise<PredictionResponse> {
    return this.request<PredictionResponse>(`/traffic/prediction/${roadId}`);
  }

  // Air Quality
  async getLiveAirQuality(): Promise<AirQualityNode[]> {
    return this.request<AirQualityNode[]>('/air-quality/live');
  }

  async getAirQualityPrediction(locationId: number): Promise<PredictionResponse> {
    return this.request<PredictionResponse>(`/air-quality/prediction/${locationId}`);
  }

  // Energy
  async getLiveEnergy(): Promise<BuildingAsset[]> {
    return this.request<BuildingAsset[]>('/energy/live');
  }

  async getEnergyPrediction(buildingId: number): Promise<PredictionResponse> {
    return this.request<PredictionResponse>(`/energy/prediction/${buildingId}`);
  }

  // Water & Weather
  async getLiveWater(): Promise<WaterNode[]> {
    return this.request<WaterNode[]>('/water/live');
  }

  async getCurrentWeather(): Promise<WeatherData> {
    return this.request<WeatherData>('/weather/current');
  }

  // Anomalies
  async getLiveAnomalies(): Promise<AnomalyItem[]> {
    return this.request<AnomalyItem[]>('/anomalies/live');
  }

  // Scenarios & Simulation
  async getScenarioPresets(): Promise<any[]> {
    return this.request<any[]>('/scenarios/presets');
  }

  async runScenario(scenarioType: string, title: string, parameters: Record<string, any>): Promise<ScenarioResult> {
    return this.request<ScenarioResult>('/scenarios/simulate', {
      method: 'POST',
      body: JSON.stringify({ scenario_type: scenarioType, title, parameters })
    });
  }

  // Optimization
  async solveOptimization(weights: Record<string, number>): Promise<OptimizationResult> {
    return this.request<OptimizationResult>('/optimization/solve', {
      method: 'POST',
      body: JSON.stringify({ objective_weights: weights })
    });
  }

  // Computer Vision
  async getCameraStream(cameraId: string): Promise<CameraFeed> {
    return this.request<CameraFeed>(`/vision/stream/${cameraId}`);
  }

  // TwinAI RAG Chat
  async sendChatMessage(message: string, sessionId: string = 'session_1'): Promise<{ reply: string; grounded_sources: any[]; suggested_followups: string[]; is_telemetry_backed: boolean }> {
    return this.request<any>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, session_id: sessionId })
    });
  }

  // Model Monitoring
  async getModelMetrics(): Promise<ModelMetric[]> {
    return this.request<ModelMetric[]>('/models/metrics');
  }

  // Reports
  async getGeneratedReport(): Promise<any> {
    return this.request<any>('/reports/generate');
  }

  async exportCsvUrl(): Promise<string> {
    return `${API_BASE_URL}/reports/export-csv`;
  }
}

export const api = new ApiClient();
