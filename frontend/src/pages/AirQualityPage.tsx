import React, { useEffect, useState, useCallback } from 'react';
import { AirQualityNode, PredictionResponse } from '../types';
import { api } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, Cell
} from 'recharts';

export const AirQualityPage: React.FC = () => {
  const [stations, setStations] = useState<AirQualityNode[]>([]);
  const [selectedStation, setSelectedStation] = useState<AirQualityNode | null>(null);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);

  const loadPrediction = useCallback(async (locId: number) => {
    try {
      const pred = await api.getAirQualityPrediction(locId);
      setPrediction(pred);
    } catch (e) {
      console.warn('AQI prediction error:', e);
    }
  }, []);

  useEffect(() => {
    const fetchAQI = async () => {
      try {
        const data = await api.getLiveAirQuality();
        setStations(data);
        if (data.length > 0) {
          setSelectedStation(data[0]);
          await loadPrediction(data[0].location_id);
        }
      } catch (e) {
        console.warn('AQI fetch error:', e);
      }
    };
    fetchAQI();
  }, [loadPrediction]);

  const handleSelectStation = (st: AirQualityNode) => {
    setSelectedStation(st);
    loadPrediction(st.location_id);
  };

  const pollutantBreakdown = selectedStation ? [
    { pollutant: 'PM2.5 (µg/m³)', value: selectedStation.pm25, limit: 35, unit: 'µg/m³' },
    { pollutant: 'PM10 (µg/m³)', value: selectedStation.pm10, limit: 100, unit: 'µg/m³' },
    { pollutant: 'NO2 (ppb)', value: selectedStation.no2, limit: 53, unit: 'ppb' },
    { pollutant: 'SO2 (ppb)', value: selectedStation.so2, limit: 75, unit: 'ppb' },
    { pollutant: 'O3 (ppb)', value: selectedStation.o3, limit: 70, unit: 'ppb' },
    { pollutant: 'CO (ppm)', value: selectedStation.co * 10, limit: 9, unit: '0.1 ppm' }
  ] : [];

  const aqiForecastData = prediction ? [
    { horizon: 'Now', aqi: selectedStation?.aqi || 110 },
    ...prediction.horizons.map(h => ({ horizon: h.horizon, aqi: h.predicted_value }))
  ] : [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Air Quality Intelligence & Micro-Emission Analytics
          </h1>
          <p className="text-xs text-slate-400">
            Multi-sensor environmental monitoring (PM2.5, PM10, NO₂, CO, SO₂, O₃) with gradient-boosted atmospheric dispersion forecasts.
          </p>
        </div>
      </div>

      {/* Station Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {stations.map((st) => {
          const isSel = selectedStation?.id === st.id;
          const isHigh = st.aqi > 100;

          return (
            <div
              key={st.id}
              onClick={() => handleSelectStation(st)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                isSel
                  ? 'bg-sky-950/40 border-sky-500/60 shadow-md shadow-sky-500/10'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-sky-400 font-bold">Zone #{st.location_id}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  isHigh ? 'bg-amber-950 text-amber-400 border border-amber-500/30' : 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {isHigh ? 'Moderate' : 'Good'}
                </span>
              </div>
              <h4 className="text-xs font-bold text-white mt-1 truncate">{st.location_name}</h4>
              <div className="flex items-baseline space-x-1.5 mt-2">
                <span className="text-2xl font-bold text-sky-300">{st.aqi}</span>
                <span className="text-[10px] text-slate-400 font-mono">AQI</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Primary: {st.primary_pollutant}</p>
            </div>
          );
        })}
      </div>

      {/* Detailed Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Multi-Pollutant Distribution Bar Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">
                Multi-Pollutant Concentrations: {selectedStation?.location_name}
              </h3>
              <p className="text-xs text-slate-400">Current levels vs EPA ambient safety limits.</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950/80 text-sky-400 border border-sky-500/30">
              Live Sensor Readings
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pollutantBreakdown} layout="vertical">
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="pollutant" type="category" stroke="#64748b" fontSize={10} width={100} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0d1527', borderColor: '#1e293b', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="value" fill="#38bdf8" radius={[0, 4, 4, 0]}>
                  {pollutantBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.value > entry.limit ? '#f59e0b' : '#38bdf8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-400">
            Amber bars indicate pollutants approaching or surpassing EPA air standard threshold limits.
          </p>
        </div>

        {/* Future AQI Prediction & Explainability */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Atmospheric Dispersion Forecast</h3>
              <p className="text-xs text-slate-400">Time-series AQI prediction based on traffic volume & wind speed.</p>
            </div>
            <span className="text-[10px] font-mono text-cyan-400">GradientBoosting_AQI</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={aqiForecastData}>
                <XAxis dataKey="horizon" stroke="#64748b" fontSize={11} />
                <YAxis domain={[50, 160]} stroke="#64748b" fontSize={11} unit=" AQI" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0d1527', borderColor: '#1e293b', borderRadius: '8px', fontSize: '11px' }}
                />
                <Line type="monotone" dataKey="aqi" stroke="#38bdf8" strokeWidth={3} dot={{ r: 5, fill: '#38bdf8' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {prediction && (
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
              <span className="font-bold text-sky-300">Dispersion Analysis:</span>
              <p className="text-slate-300">{prediction.explanation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
