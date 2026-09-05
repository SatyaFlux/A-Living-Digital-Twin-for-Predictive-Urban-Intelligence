import React, { useState } from 'react';
import { ScenarioResult } from '../types';
import { api } from '../services/api';
import {
  Sliders, Play, Activity, AlertTriangle, ArrowRight,
  TrendingUp, TrendingDown, CheckCircle2, ShieldCheck, Sparkles
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export const WhatIfSimulatorPage: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<string>('preset_road_closure');
  const [scenarioType, setScenarioType] = useState<string>('road_closure');
  const [title, setTitle] = useState<string>('Closure of Avenue 1 - Boulevard North');
  const [params, setParams] = useState<Record<string, any>>({
    road_id: 1,
    road_name: 'Avenue 1 - Boulevard North',
    duration_hours: 4
  });

  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [simulating, setSimulating] = useState<boolean>(false);

  const handleSelectPreset = (presetId: string) => {
    setSelectedPreset(presetId);
    if (presetId === 'preset_road_closure') {
      setScenarioType('road_closure');
      setTitle('Scenario A: Complete Closure of Avenue 1 (Boulevard North)');
      setParams({ road_id: 1, road_name: 'Avenue 1 - Boulevard North', duration_hours: 4 });
    } else if (presetId === 'preset_ev_surge') {
      setScenarioType('ev_surge');
      setTitle('Scenario B: +25% EV Charging Infrastructure Expansion');
      setParams({ ev_penetration_increase_pct: 25.0, new_chargers_count: 40 });
    } else if (presetId === 'preset_transit_boost') {
      setScenarioType('transit_boost');
      setTitle('Scenario C: +30% Bus Transit Frequency & 15% Fare Subsidy');
      setParams({ bus_frequency_increase_pct: 30.0, fare_subsidy_pct: 15.0 });
    } else if (presetId === 'preset_extreme_weather') {
      setScenarioType('extreme_weather');
      setTitle('Scenario D: 65 mm/hr Extreme Cloudburst & Inundation Risk');
      setParams({ rainfall_intensity_mm_hr: 65.0, wind_gusts_kmh: 55.0 });
    }
  };

  const handleRunSimulation = async () => {
    setSimulating(true);
    try {
      const res = await api.runScenario(scenarioType, title, params);
      setResult(res);
    } catch (e) {
      console.warn('Simulation run fallback:', e);
    } finally {
      setSimulating(false);
    }
  };

  // Convert baseline vs simulated metrics to chart array
  const comparisonData = result ? Object.keys(result.baseline_metrics).map((key) => ({
    metric: key.replace(/_/g, ' ').toUpperCase(),
    Baseline: result.baseline_metrics[key],
    Simulated: result.simulated_metrics[key]
  })) : [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            What-If Scenario Simulation Engine
          </h1>
          <p className="text-xs text-slate-400">
            Physics & network-constrained predictive simulation of urban infrastructure interventions and stress tests.
          </p>
        </div>
      </div>

      {/* Preset Scenario Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { id: 'preset_road_closure', title: 'Scenario A', desc: 'Road Closure & Bypass Diversion', icon: '🚧' },
          { id: 'preset_ev_surge', title: 'Scenario B', desc: 'EV Fast-Charger Grid Surge', icon: '⚡' },
          { id: 'preset_transit_boost', title: 'Scenario C', desc: 'Public Transit Modal Shift', icon: '🚌' },
          { id: 'preset_extreme_weather', title: 'Scenario D', desc: 'Extreme Cloudburst & Flooding', icon: '🌧️' }
        ].map((item) => (
          <div
            key={item.id}
            onClick={() => handleSelectPreset(item.id)}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              selectedPreset === item.id
                ? 'bg-cyan-950/40 border-cyan-500/60 shadow-md shadow-cyan-500/10'
                : 'glass-card border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs font-bold text-cyan-400 font-mono">{item.title}</span>
            </div>
            <h4 className="text-xs font-bold text-white mt-1.5">{item.desc}</h4>
          </div>
        ))}
      </div>

      {/* Interactive Control & Simulation Action Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-white">{title}</h3>
            <p className="text-xs text-slate-400">Adjust intervention parameters and run simulation pipeline.</p>
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={simulating}
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all"
          >
            {simulating ? <Activity className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>{simulating ? 'Computing Network Equations...' : 'Execute What-If Simulation'}</span>
          </button>
        </div>

        {/* Dynamic Parameter Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {scenarioType === 'road_closure' && (
            <>
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400">Target Closed Corridor:</span>
                <p className="font-bold text-cyan-300">Avenue 1 - Boulevard North</p>
              </div>
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">Closure Duration:</span>
                  <span className="font-bold text-cyan-300">{params.duration_hours} Hours</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={params.duration_hours}
                  onChange={(e) => setParams({ ...params, duration_hours: Number(e.target.value) })}
                  className="w-full accent-cyan-400"
                />
              </div>
            </>
          )}

          {scenarioType === 'ev_surge' && (
            <>
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">EV Penetration Increase:</span>
                  <span className="font-bold text-cyan-300">+{params.ev_penetration_increase_pct}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  value={params.ev_penetration_increase_pct}
                  onChange={(e) => setParams({ ...params, ev_penetration_increase_pct: Number(e.target.value) })}
                  className="w-full accent-cyan-400"
                />
              </div>
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">New DC Fast-Chargers:</span>
                  <span className="font-bold text-cyan-300">+{params.new_chargers_count} Units</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={params.new_chargers_count}
                  onChange={(e) => setParams({ ...params, new_chargers_count: Number(e.target.value) })}
                  className="w-full accent-cyan-400"
                />
              </div>
            </>
          )}

          {scenarioType === 'transit_boost' && (
            <>
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">Bus Frequency Increase:</span>
                  <span className="font-bold text-cyan-300">+{params.bus_frequency_increase_pct}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  value={params.bus_frequency_increase_pct}
                  onChange={(e) => setParams({ ...params, bus_frequency_increase_pct: Number(e.target.value) })}
                  className="w-full accent-cyan-400"
                />
              </div>
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">Commuter Fare Subsidy:</span>
                  <span className="font-bold text-cyan-300">{params.fare_subsidy_pct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={params.fare_subsidy_pct}
                  onChange={(e) => setParams({ ...params, fare_subsidy_pct: Number(e.target.value) })}
                  className="w-full accent-cyan-400"
                />
              </div>
            </>
          )}

          {scenarioType === 'extreme_weather' && (
            <>
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">Rainfall Precipitation:</span>
                  <span className="font-bold text-rose-300">{params.rainfall_intensity_mm_hr} mm/hr</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="120"
                  value={params.rainfall_intensity_mm_hr}
                  onChange={(e) => setParams({ ...params, rainfall_intensity_mm_hr: Number(e.target.value) })}
                  className="w-full accent-rose-400"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Simulation Results View */}
      {result && (
        <div className="space-y-6">
          {/* Summary & Impact Banner */}
          <div className="glass-panel p-6 rounded-2xl border border-cyan-500/40 bg-slate-950/90 space-y-3">
            <div className="flex items-center space-x-2 text-cyan-400">
              <Sparkles className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white">Simulation Impact Synthesis</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
              {result.impact_summary}
            </p>
          </div>

          {/* Side-by-Side Comparison Chart & Delta Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white">Baseline vs Simulated Delta Comparison</h3>
                <span className="text-[10px] font-mono text-cyan-400">Strict Layer Segregation</span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData}>
                    <XAxis dataKey="metric" stroke="#64748b" fontSize={9} />
                    <YAxis stroke="#64748b" fontSize={10} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0d1527', borderColor: '#1e293b', borderRadius: '8px', fontSize: '11px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="Baseline" fill="#64748b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Simulated" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Decision Recommendations */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-emerald-400 mb-2">
                  <ShieldCheck className="w-5 h-5" />
                  <h3 className="text-sm font-bold text-white">AI Decision Guidance</h3>
                </div>
                <div className="space-y-2 text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                  {result.recommendation}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800">
                <span className="text-[10px] text-slate-500 font-mono">
                  Engine Model: BPR Network Capacity-Delay v1.0
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
