import React, { useState } from 'react';
import {
  RoadAsset, BuildingAsset, AirQualityNode, WaterNode,
  WeatherData, AnomalyItem
} from '../../types';
import {
  Layers, Car, Wind, Zap, Droplets,
  AlertTriangle
} from 'lucide-react';

export type MapLayer = 'traffic' | 'aqi' | 'energy' | 'water' | 'risk';

interface DigitalTwinMapProps {
  roads: RoadAsset[];
  buildings: BuildingAsset[];
  aqiNodes: AirQualityNode[];
  waterNodes: WaterNode[];
  weather: WeatherData | null;
  anomalies: AnomalyItem[];
  onSelectRoad?: (road: RoadAsset) => void;
  onSelectBuilding?: (building: BuildingAsset) => void;
}

export const DigitalTwinMap: React.FC<DigitalTwinMapProps> = ({
  roads,
  buildings,
  aqiNodes,
  waterNodes,
  weather,
  anomalies,
  onSelectRoad,
  onSelectBuilding
}) => {
  const [activeLayers, setActiveLayers] = useState<Record<MapLayer, boolean>>({
    traffic: true,
    aqi: true,
    energy: true,
    water: false,
    risk: true
  });

  const [selectedEntity, setSelectedEntity] = useState<any>(null);

  const toggleLayer = (layer: MapLayer) => {
    setActiveLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  // Coordinates mapping to SVG viewport (28.605 - 28.625 lat, 77.202 - 77.228 lng)
  const mapToSvg = (lat: number, lng: number): [number, number] => {
    const minLat = 28.603;
    const maxLat = 28.627;
    const minLng = 77.200;
    const maxLng = 77.230;

    const x = ((lng - minLng) / (maxLng - minLng)) * 760 + 20;
    const y = 500 - (((lat - minLat) / (maxLat - minLat)) * 460 + 20);
    return [x, y];
  };

  const getTrafficColor = (congestion: number) => {
    if (congestion > 75) return '#ef4444'; // Red
    if (congestion > 50) return '#f59e0b'; // Yellow/Amber
    return '#10b981'; // Green
  };

  const getAqiColor = (aqi: number) => {
    if (aqi > 150) return '#ef4444';
    if (aqi > 100) return '#f59e0b';
    return '#06b6d4';
  };

  return (
    <div className="relative w-full h-[540px] rounded-2xl overflow-hidden glass-panel border border-slate-800/80 bg-slate-950/90 flex flex-col">
      {/* Top Layer Control Bar */}
      <div className="p-3 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 z-10 bg-slate-900/60 backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Digital Twin Map Layers</span>
        </div>

        {/* Toggle Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => toggleLayer('traffic')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border font-medium transition-all ${
              activeLayers.traffic
                ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50 shadow-sm'
                : 'bg-slate-900/50 text-slate-400 border-slate-800'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Traffic</span>
          </button>

          <button
            onClick={() => toggleLayer('aqi')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border font-medium transition-all ${
              activeLayers.aqi
                ? 'bg-sky-950/80 text-sky-300 border-sky-500/50 shadow-sm'
                : 'bg-slate-900/50 text-slate-400 border-slate-800'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Air Quality</span>
          </button>

          <button
            onClick={() => toggleLayer('energy')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border font-medium transition-all ${
              activeLayers.energy
                ? 'bg-amber-950/80 text-amber-300 border-amber-500/50 shadow-sm'
                : 'bg-slate-900/50 text-slate-400 border-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Energy</span>
          </button>

          <button
            onClick={() => toggleLayer('water')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border font-medium transition-all ${
              activeLayers.water
                ? 'bg-blue-950/80 text-blue-300 border-blue-500/50 shadow-sm'
                : 'bg-slate-900/50 text-slate-400 border-slate-800'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>Water</span>
          </button>

          <button
            onClick={() => toggleLayer('risk')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border font-medium transition-all ${
              activeLayers.risk
                ? 'bg-rose-950/80 text-rose-300 border-rose-500/50 shadow-sm'
                : 'bg-slate-900/50 text-slate-400 border-slate-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Anomalies / Risk</span>
          </button>
        </div>
      </div>

      {/* SVG Interactive GIS Map View */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        <svg viewBox="0 0 800 500" className="w-full h-full select-none">
          <defs>
            {/* Grid Pattern */}
            <pattern id="twin-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(30, 47, 86, 0.4)" strokeWidth="0.8" />
            </pattern>
            {/* Radial Glow Filters */}
            <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-rose" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Grid */}
          <rect width="800" height="500" fill="url(#twin-grid)" />

          {/* Zone Boundaries */}
          <g opacity="0.35">
            <polygon points="120,60 380,80 340,240 100,200" fill="rgba(6, 182, 212, 0.08)" stroke="#06b6d4" strokeDasharray="4 4" />
            <polygon points="380,80 720,100 680,320 340,240" fill="rgba(59, 130, 246, 0.08)" stroke="#3b82f6" strokeDasharray="4 4" />
            <polygon points="100,200 340,240 380,440 140,420" fill="rgba(16, 185, 129, 0.08)" stroke="#10b981" strokeDasharray="4 4" />
            <polygon points="340,240 680,320 640,460 380,440" fill="rgba(245, 158, 11, 0.08)" stroke="#f59e0b" strokeDasharray="4 4" />
          </g>

          {/* Roads Layer */}
          {activeLayers.traffic && (
            <g className="roads-layer">
              {roads.map((r) => {
                const [x1, y1] = mapToSvg(r.start_lat, r.start_lng);
                const [x2, y2] = mapToSvg(r.end_lat, r.end_lng);
                const color = getTrafficColor(r.current_congestion_pct || 50);

                return (
                  <g key={r.id} className="cursor-pointer group" onClick={() => { setSelectedEntity({ type: 'road', data: r }); onSelectRoad?.(r); }}>
                    {/* Road Glow Halo */}
                    <line
                      x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke={color}
                      strokeWidth="10"
                      strokeOpacity="0.25"
                      strokeLinecap="round"
                    />
                    {/* Main Road Line */}
                    <line
                      x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke={color}
                      strokeWidth="4"
                      strokeLinecap="round"
                      className="transition-all duration-300 group-hover:stroke-width-6"
                    />
                    {/* Midpoint Label Badge */}
                    <circle
                      cx={(x1 + x2) / 2} cy={(y1 + y2) / 2}
                      r="9"
                      fill="#0d1527"
                      stroke={color}
                      strokeWidth="2"
                    />
                    <text
                      x={(x1 + x2) / 2} y={(y1 + y2) / 2 + 3.5}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="8"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {r.id}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* AQI Layer */}
          {activeLayers.aqi && (
            <g className="aqi-layer">
              {aqiNodes.map((a) => {
                const b = buildings.find(b => b.zone_id === a.location_id) || buildings[0];
                const [x, y] = mapToSvg(b.latitude + 0.003, b.longitude - 0.003);
                const color = getAqiColor(a.aqi);

                return (
                  <g key={a.id} className="cursor-pointer" onClick={() => setSelectedEntity({ type: 'aqi', data: a })}>
                    <circle
                      cx={x} cy={y}
                      r="22"
                      fill={color}
                      fillOpacity="0.18"
                      stroke={color}
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                    <circle cx={x} cy={y} r="5" fill={color} />
                    <text x={x} y={y - 9} textAnchor="middle" fill={color} fontSize="9" fontWeight="bold">
                      {a.aqi} AQI
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Buildings / Facilities Layer */}
          {activeLayers.energy && (
            <g className="buildings-layer">
              {buildings.map((b) => {
                const [x, y] = mapToSvg(b.latitude, b.longitude);
                const isAnom = b.is_anomaly;

                return (
                  <g key={b.id} className="cursor-pointer group" onClick={() => { setSelectedEntity({ type: 'building', data: b }); onSelectBuilding?.(b); }}>
                    {isAnom && (
                      <circle
                        cx={x} cy={y}
                        r="16"
                        fill="rgba(244, 63, 94, 0.3)"
                        stroke="#f43f5e"
                        strokeWidth="1.5"
                        className="animate-ping"
                      />
                    )}
                    <rect
                      x={x - 8} y={y - 8}
                      width="16" height="16"
                      rx="3"
                      fill={isAnom ? '#f43f5e' : '#06b6d4'}
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      className="group-hover:scale-125 transition-transform"
                    />
                    <text x={x} y={y + 18} textAnchor="middle" fill="#cbd5e1" fontSize="9" fontWeight="500">
                      {b.name.split(' ')[0]}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Water Infrastructure Layer */}
          {activeLayers.water && waterNodes && (
            <g className="water-layer">
              {waterNodes.map((w, idx) => {
                const b = buildings[idx % buildings.length] || buildings[0];
                const [x, y] = mapToSvg(b.latitude - 0.004, b.longitude + 0.003);
                return (
                  <g key={w.id} className="cursor-pointer" onClick={() => setSelectedEntity({ type: 'water', data: w })}>
                    <circle cx={x} cy={y} r="12" fill="rgba(14, 165, 233, 0.2)" stroke="#0ea5e9" strokeWidth="1.5" />
                    <circle cx={x} cy={y} r="4" fill="#0ea5e9" />
                    <text x={x} y={y + 16} textAnchor="middle" fill="#38bdf8" fontSize="8" fontWeight="bold">
                      {w.pressure_bar} bar
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* Risk & Anomaly Markers */}
          {activeLayers.risk && (
            <g className="risk-layer">
              {anomalies.map((anom) => {
                const road = roads.find(r => r.id === anom.entity_id);
                const bld = buildings.find(b => b.id === anom.entity_id);
                const lat = road ? road.start_lat : (bld ? bld.latitude : 28.615);
                const lng = road ? road.start_lng : (bld ? bld.longitude : 77.215);
                const [x, y] = mapToSvg(lat, lng);

                return (
                  <g key={anom.id} className="cursor-pointer" onClick={() => setSelectedEntity({ type: 'anomaly', data: anom })}>
                    <circle cx={x + 12} cy={y - 12} r="9" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                    <text x={x + 12} y={y - 8.5} textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">!</text>
                  </g>
                );
              })}
            </g>
          )}
        </svg>

        {/* Live Weather Overlay */}
        {weather && (
          <div className="absolute top-4 right-4 z-10 hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 backdrop-blur-md">
            <Wind className="w-3.5 h-3.5 text-cyan-400" />
            <span>{weather.condition}</span>
            <span className="font-mono text-cyan-300">{weather.temperature_c}°C</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">{weather.wind_speed_kmh} km/h</span>
          </div>
        )}

        {/* Selected Entity Popup Overlay */}
        {selectedEntity && (
          <div className="absolute top-4 left-4 z-20 max-w-sm glass-panel p-4 rounded-xl border border-cyan-500/50 bg-slate-950/95 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">
                  {selectedEntity.type === 'road' ? 'Road Telemetry Node' : (selectedEntity.type === 'building' ? 'Facility Power Meter' : 'System Diagnostic Node')}
                </span>
                <h4 className="text-sm font-bold text-white mt-0.5">
                  {selectedEntity.data.name || selectedEntity.data.entity_name || `Station #${selectedEntity.data.id}`}
                </h4>
              </div>
              <button
                onClick={() => setSelectedEntity(null)}
                className="text-slate-400 hover:text-white p-1 text-xs"
              >
                ✕
              </button>
            </div>

            {selectedEntity.type === 'road' && (
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400">Congestion:</span>
                  <p className="font-bold text-amber-400">{selectedEntity.data.current_congestion_pct}%</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Average Speed:</span>
                  <p className="font-bold text-emerald-400">{selectedEntity.data.current_avg_speed} km/h</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Volume:</span>
                  <p className="font-mono text-cyan-300">{selectedEntity.data.current_vehicle_count} vph</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Capacity:</span>
                  <p className="font-mono text-slate-300">{selectedEntity.data.capacity_vph} vph</p>
                </div>
              </div>
            )}

            {selectedEntity.type === 'building' && (
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400">Current Load:</span>
                  <p className="font-bold text-cyan-400">{selectedEntity.data.current_energy_kwh} kWh</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Peak Demand:</span>
                  <p className="font-bold text-amber-400">{selectedEntity.data.peak_demand_kw} kW</p>
                </div>
              </div>
            )}

            {selectedEntity.type === 'anomaly' && (
              <div className="mt-3 pt-3 border-t border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-rose-400 font-bold">Severity: {selectedEntity.data.severity}</span>
                  <span className="text-slate-400 font-mono text-[10px]">Confidence: {Math.round(selectedEntity.data.confidence * 100)}%</span>
                </div>
                <p className="text-slate-300 text-[11px]">{selectedEntity.data.explanation}</p>
                <p className="text-emerald-400 text-[11px] font-medium">Action: {selectedEntity.data.recommended_action}</p>
              </div>
            )}
          </div>
        )}

        {/* Legend Overlay */}
        <div className="absolute bottom-4 right-4 z-10 flex items-center space-x-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 text-[11px]">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-300">Optimal (&lt;50%)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-slate-300">Moderate (50-75%)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span className="text-slate-300">Critical (&gt;75%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
