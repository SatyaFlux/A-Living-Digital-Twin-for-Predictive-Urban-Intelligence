import React, { useEffect, useState, useCallback } from 'react';
import { RoadAsset, PredictionResponse } from '../types';
import { api } from '../services/api';
import { Activity, BarChart2 } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

export const TrafficPage: React.FC = () => {
  const [roads, setRoads] = useState<RoadAsset[]>([]);
  const [selectedRoad, setSelectedRoad] = useState<RoadAsset | null>(null);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('GradientBoosting_XGB');

  const loadPrediction = useCallback(async (roadId: number) => {
    try {
      const pred = await api.getTrafficPrediction(roadId);
      setPrediction(pred);
    } catch (e) {
      console.warn('Prediction fetch error:', e);
    }
  }, []);

  useEffect(() => {
    const fetchTraffic = async () => {
      try {
        const data = await api.getLiveTraffic();
        setRoads(data);
        if (data.length > 0) {
          setSelectedRoad(data[0]);
          await loadPrediction(data[0].id);
        }
      } catch (e) {
        console.warn('Traffic fetch error:', e);
      }
    };
    fetchTraffic();
  }, [loadPrediction]);

  const handleSelectRoad = (road: RoadAsset) => {
    setSelectedRoad(road);
    loadPrediction(road.id);
  };

  const chartData = prediction ? [
    { horizon: 'Current', congestion: selectedRoad?.current_congestion_pct || 68, lower: selectedRoad?.current_congestion_pct || 68, upper: selectedRoad?.current_congestion_pct || 68 },
    ...prediction.horizons.map(h => ({
      horizon: h.horizon,
      congestion: h.predicted_value,
      lower: h.lower_bound,
      upper: h.upper_bound,
      confidence: Math.round(h.confidence_score * 100)
    }))
  ] : [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Traffic Intelligence & Multi-Horizon Forecasting
          </h1>
          <p className="text-xs text-slate-400">
            Real-time arterial throughput, inductive loop sensor telemetry, and machine learning multi-step forecast.
          </p>
        </div>

        {/* Model Selector */}
        <div className="flex items-center space-x-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700/60 text-xs">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">Model:</span>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-transparent text-cyan-300 font-semibold focus:outline-none cursor-pointer text-xs"
          >
            <option value="GradientBoosting_XGB" className="bg-slate-900 text-white">Gradient Boosting (XGBoost)</option>
            <option value="RandomForest" className="bg-slate-900 text-white">Random Forest (100 Trees)</option>
            <option value="LinearRegression" className="bg-slate-900 text-white">Linear Regression (Baseline)</option>
            <option value="Ridge_Sequence" className="bg-slate-900 text-white">Sequence Ridge Regressor</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Road Corridors Table & Prediction Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Road Corridors List (1 col) */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Arterial Corridors</h3>
            <span className="text-[10px] font-mono text-cyan-400">{roads.length} Segments</span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {roads.map((r) => {
              const isSel = selectedRoad?.id === r.id;
              const isCongested = (r.current_congestion_pct || 50) > 75;

              return (
                <div
                  key={r.id}
                  onClick={() => handleSelectRoad(r)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSel
                      ? 'bg-cyan-950/40 border-cyan-500/60 shadow-md shadow-cyan-500/10'
                      : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-cyan-400 font-bold">{r.code}</span>
                      <h4 className="text-xs font-bold text-white mt-0.5">{r.name}</h4>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      isCongested ? 'bg-rose-950 text-rose-400 border border-rose-500/40' : 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                    }`}>
                      {r.current_status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-800 text-[11px]">
                    <div>
                      <span className="text-[10px] text-slate-500">Congestion</span>
                      <p className="font-bold text-amber-400">{r.current_congestion_pct}%</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500">Avg Speed</span>
                      <p className="font-bold text-emerald-400">{r.current_avg_speed} km/h</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500">Volume</span>
                      <p className="font-mono text-cyan-300">{r.current_vehicle_count} vph</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Forecast & Feature Importance (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Multi-Horizon Line Chart */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">
                  Multi-Horizon Forecast: {selectedRoad?.name || 'Corridor B'}
                </h3>
                <p className="text-xs text-slate-400">15m, 30m, 60m, and 2-Hour projection with confidence boundaries.</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                Confidence: 88% - 94%
              </span>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="horizon" stroke="#64748b" fontSize={11} />
                  <YAxis domain={[30, 100]} stroke="#64748b" fontSize={11} unit="%" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0d1527', borderColor: '#1e293b', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Line type="monotone" dataKey="congestion" stroke="#06b6d4" strokeWidth={3} dot={{ r: 5, fill: '#06b6d4' }} name="Projected Congestion (%)" />
                  <Line type="monotone" dataKey="upper" stroke="#ef4444" strokeWidth={1} strokeDasharray="3 3" name="Upper CI (95%)" />
                  <Line type="monotone" dataKey="lower" stroke="#10b981" strokeWidth={1} strokeDasharray="3 3" name="Lower CI (95%)" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {prediction && (
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                <span className="font-bold text-cyan-300">AI Model Diagnostic Explanation:</span>
                <p className="text-slate-300">{prediction.explanation}</p>
              </div>
            )}
          </div>

          {/* Explainability / SHAP Feature Importance */}
          {prediction && (
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <BarChart2 className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">SHAP Feature Importance & Attribution Factors</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {prediction.important_factors.map((f, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{f.factor}</span>
                      <span className="font-mono text-cyan-400 font-bold">{f.importance_pct}%</span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full" style={{ width: `${f.importance_pct * 2}%` }} />
                    </div>
                    <span className="text-[10px] text-slate-400">Attribution Impact: <strong className="text-amber-300">{f.impact}</strong></span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
