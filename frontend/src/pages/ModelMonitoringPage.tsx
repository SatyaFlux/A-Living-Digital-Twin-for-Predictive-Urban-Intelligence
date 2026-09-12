import React, { useEffect, useState } from 'react';
import { ModelMetric } from '../types';
import { api } from '../services/api';
import { Cpu } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

export const ModelMonitoringPage: React.FC = () => {
  const [metrics, setMetrics] = useState<ModelMetric[]>([]);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await api.getModelMetrics();
        setMetrics(data);
      } catch (e) {
        console.warn('Model metrics fetch error:', e);
      }
    };
    fetchMetrics();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            ML Model Governance & Accuracy Benchmarks
          </h1>
          <p className="text-xs text-slate-400">
            Empirical validation metrics (MAE, RMSE, MAPE, R²) calculated against research test splits with real-time concept drift monitoring.
          </p>
        </div>
      </div>

      {/* Model Registry Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Trained Model Registry</h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30">
            Validated Metrics
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="p-3.5">Model Name</th>
                <th className="p-3.5">Domain</th>
                <th className="p-3.5">Algorithm</th>
                <th className="p-3.5">MAE</th>
                <th className="p-3.5">RMSE</th>
                <th className="p-3.5">MAPE (%)</th>
                <th className="p-3.5">R² Score</th>
                <th className="p-3.5">Drift Score</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {metrics.map((m) => (
                <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3.5 font-bold text-white font-mono">{m.model_name}</td>
                  <td className="p-3.5 text-cyan-300">{m.domain}</td>
                  <td className="p-3.5 text-slate-300">{m.algorithm}</td>
                  <td className="p-3.5 font-mono text-amber-300">{m.mae}</td>
                  <td className="p-3.5 font-mono text-amber-300">{m.rmse}</td>
                  <td className="p-3.5 font-mono text-cyan-400">{m.mape}%</td>
                  <td className="p-3.5 font-mono font-bold text-emerald-400">{m.r2_score}</td>
                  <td className="p-3.5 font-mono text-slate-400">{m.drift_score}</td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      m.is_active
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {m.is_active ? 'Active Champion' : 'Baseline'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* R2 Score Comparison Chart */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white">Model Goodness-of-Fit Comparison (R² Score)</h3>
            <p className="text-xs text-slate-400">Higher R² indicates superior variance explanation on validation splits.</p>
          </div>
          <span className="text-[10px] font-mono text-cyan-400">Scikit-Learn Evaluator</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics}>
              <XAxis dataKey="model_name" stroke="#64748b" fontSize={10} />
              <YAxis domain={[0.6, 1.0]} stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0d1527', borderColor: '#1e293b', borderRadius: '8px', fontSize: '11px' }}
              />
              <Bar dataKey="r2_score" fill="#06b6d4" radius={[4, 4, 0, 0]}>
                {metrics.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.r2_score > 0.95 ? '#10b981' : '#06b6d4'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
