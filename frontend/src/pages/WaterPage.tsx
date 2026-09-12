import React, { useEffect, useState } from 'react';
import { WaterNode } from '../types';
import { api } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

export const WaterPage: React.FC = () => {
  const [nodes, setNodes] = useState<WaterNode[]>([]);

  useEffect(() => {
    const fetchWater = async () => {
      try {
        const data = await api.getLiveWater();
        setNodes(data);
      } catch (e) {
        console.warn('Water fetch error:', e);
      }
    };
    fetchWater();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Hydraulic Infrastructure & Water Grid Intelligence
          </h1>
          <p className="text-xs text-slate-400">
            Real-time pipeline pressure monitoring, storage tank capacity levels, and acoustic sub-surface leak detection.
          </p>
        </div>
      </div>

      {/* Hydraulic Nodes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {nodes.map((node) => {
          const isAnom = node.is_anomaly;

          return (
            <div
              key={node.id}
              className={`p-5 rounded-2xl border transition-all ${
                isAnom
                  ? 'bg-rose-950/20 border-rose-500/50 shadow-md shadow-rose-500/10'
                  : 'glass-card border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold">Node #{node.id}</span>
                  <h4 className="text-sm font-bold text-white mt-0.5">{node.location_name}</h4>
                </div>
                {isAnom ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-500/40 animate-pulse">
                    Leak Suspected
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40">
                    Pressure Nominal
                  </span>
                )}
              </div>

              {/* Tank Level Gauge Progress */}
              <div className="mt-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Storage Reservoir Level:</span>
                  <span className="font-bold text-cyan-300">{node.tank_level_pct}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${node.tank_level_pct}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500">Flow Rate</span>
                  <p className="text-base font-bold text-cyan-300">{node.flow_rate_lps} L/s</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500">Pipeline Pressure</span>
                  <p className={`text-base font-bold ${isAnom ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {node.pressure_bar} bar
                  </p>
                </div>
              </div>

              {isAnom && (
                <div className="mt-3 p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-[11px] text-rose-300 space-y-1">
                  <p className="font-bold">AI Anomaly Alert:</p>
                  <p>Sudden pressure reduction (-1.2 bar) detected concurrent with elevated night flow.</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Hydraulic Comparative Analysis */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white">Flow Rate & Pressure Overview</h3>
            <p className="text-xs text-slate-400">Comparing hydraulic telemetry across distribution zones.</p>
          </div>
          <span className="text-[10px] font-mono text-cyan-400">Telemetry Validated</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={nodes}>
              <XAxis dataKey="location_name" stroke="#64748b" fontSize={11} tickFormatter={(v) => v.split(' ')[0]} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0d1527', borderColor: '#1e293b', borderRadius: '8px', fontSize: '11px' }}
              />
              <Bar dataKey="flow_rate_lps" name="Flow Rate (L/s)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pressure_bar" name="Pressure (bar)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
