import React, { useEffect, useState } from 'react';
import { DigitalTwinMap } from '../components/map/DigitalTwinMap';
import { ThreeDDigitalTwin } from '../components/map/ThreeDDigitalTwin';
import {
  RoadAsset, BuildingAsset, AirQualityNode, WaterNode,
  WeatherData, AnomalyItem
} from '../types';
import { api } from '../services/api';
import { Map, Box } from 'lucide-react';
import { DataBadge } from '../components/common/DataBadge';

export const DigitalTwinMapPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D');
  const [roads, setRoads] = useState<RoadAsset[]>([]);
  const [buildings, setBuildings] = useState<BuildingAsset[]>([]);
  const [aqiNodes, setAqiNodes] = useState<AirQualityNode[]>([]);
  const [waterNodes, setWaterNodes] = useState<WaterNode[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [anomalies, setAnomalies] = useState<AnomalyItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const state = await api.getDigitalTwinState();
        setRoads(state.roads);
        setBuildings(state.buildings);
        setAqiNodes(state.air_quality);
        setWaterNodes(state.water_grid);
        setWeather(state.weather);
        setAnomalies(state.anomalies);
      } catch (e) {
        console.warn('Digital Twin sync fallback:', e);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Spatial Digital Twin Canvas
            </h1>
            <DataBadge isSimulated={true} />
          </div>
          <p className="text-xs text-slate-400">
            Interactive multi-layered spatial representation of city zones, road corridors, and smart building facilities.
          </p>
        </div>

        {/* 2D vs 3D Viewport Switcher */}
        <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-700/60 text-xs">
          <button
            onClick={() => setViewMode('2D')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              viewMode === '2D'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>2D GIS Layers</span>
          </button>
          <button
            onClick={() => setViewMode('3D')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              viewMode === '3D'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D WebGL Digital Twin</span>
          </button>
        </div>
      </div>

      {/* Main Map Viewport */}
      {viewMode === '2D' ? (
        <DigitalTwinMap
          roads={roads}
          buildings={buildings}
          aqiNodes={aqiNodes}
          waterNodes={waterNodes}
          weather={weather}
          anomalies={anomalies}
        />
      ) : (
        <ThreeDDigitalTwin
          buildings={buildings}
          roads={roads}
        />
      )}

      {/* Sensor Nodes & Infrastructure Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-slate-500 uppercase font-mono text-[10px]">Monitored Corridors</span>
          <p className="text-lg font-bold text-cyan-300">{roads.length} Arterial Roads</p>
          <span className="text-slate-400 text-[11px]">Dynamic inductive loop sensors</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-slate-500 uppercase font-mono text-[10px]">Smart Buildings</span>
          <p className="text-lg font-bold text-sky-300">{buildings.length} Metered Facilities</p>
          <span className="text-slate-400 text-[11px]">Sub-metered HVAC & grid demand</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-slate-500 uppercase font-mono text-[10px]">Air Quality Stations</span>
          <p className="text-lg font-bold text-emerald-300">{aqiNodes.length} Micro-Stations</p>
          <span className="text-slate-400 text-[11px]">PM2.5, PM10, NO2, CO, SO2, O3</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-slate-500 uppercase font-mono text-[10px]">Hydraulic Nodes</span>
          <p className="text-lg font-bold text-blue-300">{waterNodes.length} Pressure Zones</p>
          <span className="text-slate-400 text-[11px]">Acoustic leak & flow telemetry</span>
        </div>
      </div>
    </div>
  );
};
