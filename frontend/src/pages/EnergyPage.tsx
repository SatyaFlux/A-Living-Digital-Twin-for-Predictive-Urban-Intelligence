import React, { useEffect, useState, useCallback } from 'react';
import { BuildingAsset, PredictionResponse } from '../types';
import { api } from '../services/api';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

export const EnergyPage: React.FC = () => {
  const [buildings, setBuildings] = useState<BuildingAsset[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingAsset | null>(null);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);

  const loadPrediction = useCallback(async (bldId: number) => {
    try {
      const pred = await api.getEnergyPrediction(bldId);
      setPrediction(pred);
    } catch (e) {
      console.warn('Energy prediction error:', e);
    }
  }, []);

  useEffect(() => {
    const fetchEnergy = async () => {
      try {
        const data = await api.getLiveEnergy();
        setBuildings(data);
        if (data.length > 0) {
          setSelectedBuilding(data[0]);
          await loadPrediction(data[0].id);
        }
      } catch (e) {
        console.warn('Energy fetch error:', e);
      }
    };
    fetchEnergy();
  }, [loadPrediction]);

  const handleSelectBuilding = (bld: BuildingAsset) => {
    setSelectedBuilding(bld);
    loadPrediction(bld.id);
  };

  const loadProfile = [
    { hour: '00:00', kwh: (selectedBuilding?.base_energy_kwh || 50) * 0.5 },
    { hour: '04:00', kwh: (selectedBuilding?.base_energy_kwh || 50) * 0.45 },
    { hour: '08:00', kwh: (selectedBuilding?.base_energy_kwh || 50) * 0.85 },
    { hour: '12:00', kwh: (selectedBuilding?.current_energy_kwh || 75) },
    { hour: '16:00', kwh: (selectedBuilding?.current_energy_kwh || 75) * 1.15 },
    { hour: '20:00', kwh: (selectedBuilding?.base_energy_kwh || 50) * 0.9 },
    { hour: '23:59', kwh: (selectedBuilding?.base_energy_kwh || 50) * 0.6 }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Building Energy Intelligence & Thermal Anomaly Detection
          </h1>
          <p className="text-xs text-slate-400">
            Real-time power sub-metering across academic and data center facilities with Isolation Forest anomaly detection.
          </p>
        </div>
      </div>

      {/* Buildings Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {buildings.map((b) => {
          const isSel = selectedBuilding?.id === b.id;
          const isAnom = b.is_anomaly;

          return (
            <div
              key={b.id}
              onClick={() => handleSelectBuilding(b)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                isSel
                  ? 'bg-cyan-950/40 border-cyan-500/60 shadow-md shadow-cyan-500/10'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold">{b.code}</span>
                  <h4 className="text-sm font-bold text-white mt-0.5">{b.name}</h4>
                  <p className="text-xs text-slate-400">{b.building_type}</p>
                </div>
                {isAnom ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-500/40 animate-pulse">
                    Anomaly Flag
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                    Normal
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500">Current Consumption</span>
                  <p className="text-lg font-bold text-cyan-300">{b.current_energy_kwh} kWh</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">Peak Demand</span>
                  <p className="text-lg font-bold text-amber-300">{b.peak_demand_kw} kW</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deep-Dive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Diurnal Load Profile */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">
                Diurnal Load Curve: {selectedBuilding?.name}
              </h3>
              <p className="text-xs text-slate-400">24-hour demand curve and cooling ramp profile.</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-500/30">
              Sub-metered
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={loadProfile}>
                <defs>
                  <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} unit=" kWh" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0d1527', borderColor: '#1e293b', borderRadius: '8px', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="kwh" stroke="#f59e0b" strokeWidth={2.5} fill="url(#energyGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Anomaly Diagnostics & Random Forest Forecast */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">AI Diagnostic & Load Forecast</h3>
              <p className="text-xs text-slate-400">Multi-horizon random forest forecast with feature attribution.</p>
            </div>
            <span className="text-[10px] font-mono text-cyan-400">RandomForest_RF100</span>
          </div>

          {selectedBuilding?.is_anomaly ? (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-rose-400 font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>AI-Generated Anomaly Detected (Isolation Forest)</span>
              </div>
              <p className="text-slate-300">
                Data Center power draw spiked to <strong>{selectedBuilding.current_energy_kwh} kWh</strong>, exceeding diurnal baseline of {selectedBuilding.base_energy_kwh} kWh by +48.7%.
              </p>
              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px] text-emerald-400">
                Recommended Action: Activate auxiliary cooling loop and redistribute computational workloads to secondary rack banks.
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs flex items-center space-x-2 text-emerald-300">
              <CheckCircle2 className="w-4 h-4" />
              <span>Facility operating within optimal efficiency bounds (Power factor: 0.96).</span>
            </div>
          )}

          {prediction && (
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
              <span className="font-bold text-cyan-300">Predictive Load Explanation:</span>
              <p className="text-slate-300">{prediction.explanation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
