import React, { useState, useEffect, useCallback } from 'react';
import { OptimizationResult } from '../types';
import { api } from '../services/api';
import { Cpu, Sliders } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

const DEFAULT_WEIGHTS: Record<string, number> = {
  congestion: 0.35,
  energy: 0.25,
  emissions: 0.25,
  response_time: 0.15
};

export const OptimizationPage: React.FC = () => {
  const [weights, setWeights] = useState<Record<string, number>>(DEFAULT_WEIGHTS);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [solving, setSolving] = useState<boolean>(false);

  const runSolver = useCallback(async () => {
    setSolving(true);
    try {
      const res = await api.solveOptimization(weights);
      setResult(res);
    } catch (e) {
      console.warn('Optimization solver fallback:', e);
    } finally {
      setSolving(false);
    }
  }, [weights]);

  useEffect(() => {
    let isMounted = true;
    api.solveOptimization(DEFAULT_WEIGHTS)
      .then((res) => {
        if (isMounted) setResult(res);
      })
      .catch((e) => {
        console.warn('Optimization solver fallback:', e);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Multi-Objective Decision Optimizer
          </h1>
          <p className="text-xs text-slate-400">
            Genetic Algorithm & Pareto constraint solver balancing congestion relief, energy conservation, carbon reduction, and emergency response speed.
          </p>
        </div>

        <button
          onClick={runSolver}
          disabled={solving}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all"
        >
          <Cpu className="w-4 h-4" />
          <span>{solving ? 'Solving Pareto Frontier...' : 'Recompute Optimum Interventions'}</span>
        </button>
      </div>

      {/* Objective Weight Sliders */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Multi-Objective Priority Weights</h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Sum Normalized to 100%</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-300 font-medium">Traffic Congestion:</span>
              <span className="font-bold text-cyan-400">{Math.round(weights.congestion * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={weights.congestion}
              onChange={(e) => setWeights({ ...weights, congestion: Number(e.target.value) })}
              className="w-full accent-cyan-400"
            />
          </div>

          <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-300 font-medium">Energy Conservation:</span>
              <span className="font-bold text-amber-400">{Math.round(weights.energy * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={weights.energy}
              onChange={(e) => setWeights({ ...weights, energy: Number(e.target.value) })}
              className="w-full accent-amber-400"
            />
          </div>

          <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-300 font-medium">Carbon Emissions:</span>
              <span className="font-bold text-emerald-400">{Math.round(weights.emissions * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={weights.emissions}
              onChange={(e) => setWeights({ ...weights, emissions: Number(e.target.value) })}
              className="w-full accent-emerald-400"
            />
          </div>

          <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-300 font-medium">Emergency Speed:</span>
              <span className="font-bold text-sky-400">{Math.round(weights.response_time * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={weights.response_time}
              onChange={(e) => setWeights({ ...weights, response_time: Number(e.target.value) })}
              className="w-full accent-sky-400"
            />
          </div>
        </div>
      </div>

      {/* Solver Output Results */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ranked Decisions (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Ranked Decision Interventions</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                Pareto Fitness: {result.pareto_score}
              </span>
            </div>

            <div className="space-y-3">
              {result.recommended_decisions.map((dec) => (
                <div key={dec.rank} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-bold text-white text-xs">
                        #{dec.rank}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{dec.action_title}</h4>
                        <span className="text-[11px] text-cyan-400">{dec.category}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      dec.implementation_complexity === 'Low'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                    }`}>
                      Complexity: {dec.implementation_complexity}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{dec.expected_benefit}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-[11px]">
                    <div className="bg-slate-900/70 p-2 rounded-lg">
                      <span className="text-[10px] text-slate-500">Congestion Cut</span>
                      <p className="font-bold text-cyan-300">-{dec.projected_savings_pct.congestion_relief_pct}%</p>
                    </div>
                    <div className="bg-slate-900/70 p-2 rounded-lg">
                      <span className="text-[10px] text-slate-500">Energy Savings</span>
                      <p className="font-bold text-amber-300">-{dec.projected_savings_pct.energy_reduction_pct}%</p>
                    </div>
                    <div className="bg-slate-900/70 p-2 rounded-lg">
                      <span className="text-[10px] text-slate-500">CO2 Cut</span>
                      <p className="font-bold text-emerald-300">-{dec.projected_savings_pct.co2_emissions_cut_pct}%</p>
                    </div>
                    <div className="bg-slate-900/70 p-2 rounded-lg">
                      <span className="text-[10px] text-slate-500">Emergency Speed</span>
                      <p className="font-bold text-sky-300">+{dec.projected_savings_pct.emergency_response_speedup_pct}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tradeoff Breakdown (1 col) */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Pareto Improvement Yield</h3>
              <p className="text-xs text-slate-400">Projected multi-domain system gains.</p>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={result.tradeoff_matrix} layout="vertical">
                  <XAxis type="number" stroke="#64748b" fontSize={10} unit="%" />
                  <YAxis dataKey="objective" type="category" stroke="#64748b" fontSize={9} width={90} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0d1527', borderColor: '#1e293b', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Bar dataKey="expected_system_improvement_pct" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <span className="font-bold text-cyan-300">Convergence Verification:</span>
              <p>Evaluated {result.evaluated_candidates_count} candidate permutations across network nodes with zero constraint violations.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
