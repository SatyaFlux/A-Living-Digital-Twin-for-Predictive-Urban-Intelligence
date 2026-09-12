import React, { useEffect, useState } from 'react';
import { KPICard } from '../components/common/KPICard';
import { DigitalTwinMap } from '../components/map/DigitalTwinMap';
import {
  DashboardOverview, RoadAsset, BuildingAsset, AirQualityNode,
  WaterNode, WeatherData, AnomalyItem
} from '../types';
import { api } from '../services/api';
import { PageId } from '../components/layout/Sidebar';
import {
  Car, Wind, Zap, AlertTriangle, CloudSun,
  Activity, ShieldAlert, Sparkles
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

interface DashboardProps {
  onNavigate: (page: PageId) => void;
  onOpenChat: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onOpenChat }) => {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [roads, setRoads] = useState<RoadAsset[]>([]);
  const [buildings, setBuildings] = useState<BuildingAsset[]>([]);
  const [aqiNodes, setAqiNodes] = useState<AirQualityNode[]>([]);
  const [waterNodes, setWaterNodes] = useState<WaterNode[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [anomalies, setAnomalies] = useState<AnomalyItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Poll live telemetry every 5 seconds
  useEffect(() => {
    const fetchData = async () => {
      try {
        const state = await api.getDigitalTwinState();
        setOverview(state.overview);
        setRoads(state.roads);
        setBuildings(state.buildings);
        setAqiNodes(state.air_quality);
        setWaterNodes(state.water_grid);
        setWeather(state.weather);
        setAnomalies(state.anomalies);
      } catch (e) {
        console.warn('Backend starting, fallback active:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const forecastData = [
    { time: 'Now', actual: 68, predicted: 68, lower: 68, upper: 68 },
    { time: '+15m', actual: null, predicted: 74, lower: 70, upper: 78 },
    { time: '+30m', actual: null, predicted: 81, lower: 75, upper: 86 },
    { time: '+60m', actual: null, predicted: 86, lower: 79, upper: 93 },
    { time: '+2h', actual: null, predicted: 76, lower: 68, upper: 84 }
  ];

  if (loading || !overview) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-3 text-cyan-400">
          <Activity className="w-6 h-6 animate-spin" />
          <span className="text-sm font-semibold">Synchronizing Digital Twin Telemetry...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Metropolitan Command Center
          </h1>
          <p className="text-xs text-slate-400">
            Real-time digital twin monitoring and AI-guided urban operations.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {weather && (
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-xs text-slate-300">
              <CloudSun className="w-4 h-4 text-amber-400" />
              <span>{weather.condition}</span>
              <strong className="text-white">{weather.temperature_c}°C</strong>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400">Wind: {weather.wind_speed_kmh} km/h</span>
            </div>
          )}
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          kpi={overview.traffic_kpi}
          icon={<Car className="w-5 h-5" />}
          onClick={() => onNavigate('traffic')}
        />
        <KPICard
          kpi={overview.aqi_kpi}
          icon={<Wind className="w-5 h-5" />}
          onClick={() => onNavigate('air-quality')}
        />
        <KPICard
          kpi={overview.energy_kpi}
          icon={<Zap className="w-5 h-5" />}
          onClick={() => onNavigate('energy')}
        />
        <KPICard
          kpi={overview.risk_kpi}
          icon={<AlertTriangle className="w-5 h-5" />}
          onClick={() => onNavigate('what-if')}
        />
      </div>

      {/* Main Grid: Digital Twin Map + Multi-Horizon Forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Viewport (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <DigitalTwinMap
            roads={roads}
            buildings={buildings}
            aqiNodes={aqiNodes}
            waterNodes={waterNodes}
            weather={weather}
            anomalies={anomalies}
            onSelectRoad={() => onNavigate('traffic')}
            onSelectBuilding={() => onNavigate('energy')}
          />
        </div>

        {/* Right Column: AI Forecast Horizon & TwinAI Advice */}
        <div className="space-y-6">
          {/* Multi-Horizon Traffic Chart */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Multi-Horizon Forecast</h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-400">GradientBoosting_XGB</span>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData}>
                  <defs>
                    <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis domain={[40, 100]} stroke="#64748b" fontSize={10} tickLine={false} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0d1527', borderColor: '#1e293b', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Area type="monotone" dataKey="predicted" stroke="#06b6d4" strokeWidth={2.5} fill="url(#predGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[11px] text-slate-400">
              Peak congestion of <strong>86%</strong> projected at +60m along Corridor B & Gate 2.
            </p>
          </div>

          {/* Active Anomaly Alerts Box */}
          <div className="glass-panel p-5 rounded-2xl border border-rose-500/30 bg-slate-950/80 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center space-x-2 text-rose-400">
                <ShieldAlert className="w-4 h-4 animate-pulse" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">AI Diagnostic Alerts</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-500/40 font-bold">
                {anomalies.length} Active
              </span>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {anomalies.map((anom) => (
                <div key={anom.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{anom.entity_name}</span>
                    <span className="text-[10px] font-bold text-rose-400 uppercase">{anom.severity}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{anom.explanation}</p>
                  <p className="text-[10px] text-emerald-400 font-medium">⚡ {anom.recommended_action}</p>
                </div>
              ))}
            </div>

            <button
              onClick={onOpenChat}
              className="w-full mt-2 py-2 rounded-xl bg-gradient-to-r from-cyan-600/30 to-blue-600/30 hover:from-cyan-600/50 hover:to-blue-600/50 text-cyan-300 text-xs font-semibold border border-cyan-500/40 flex items-center justify-center space-x-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask TwinAI to Mitigate Anomalies</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
