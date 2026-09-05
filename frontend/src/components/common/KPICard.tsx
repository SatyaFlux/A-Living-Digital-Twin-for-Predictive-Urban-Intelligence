import React from 'react';
import { KPICardData } from '../../types';
import { ArrowUpRight, ArrowDownRight, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface KPICardProps {
  kpi: KPICardData;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export const KPICard: React.FC<KPICardProps> = ({ kpi, icon, onClick }) => {
  const isWarning = kpi.status === 'warning';
  const isCritical = kpi.status === 'critical';

  const statusColor = isCritical
    ? 'text-rose-400 border-rose-500/40 bg-rose-950/20'
    : isWarning
    ? 'text-amber-400 border-amber-500/40 bg-amber-950/20'
    : 'text-emerald-400 border-emerald-500/40 bg-emerald-950/20';

  const glowBorder = isCritical
    ? 'hover:border-rose-500/60'
    : isWarning
    ? 'hover:border-amber-500/60'
    : 'hover:border-cyan-500/60';

  return (
    <div
      onClick={onClick}
      className={`glass-card p-5 rounded-xl cursor-pointer border ${glowBorder} transition-all duration-300 relative overflow-hidden`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-400">
            {kpi.title}
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl lg:text-3xl font-bold tracking-tight text-white dark:text-white">
              {kpi.current_value}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {kpi.unit}
            </span>
          </div>
        </div>
        <div className={`p-2.5 rounded-lg border ${statusColor}`}>
          {icon || (
            isCritical ? <AlertTriangle className="w-5 h-5" /> :
            isWarning ? <Activity className="w-5 h-5" /> :
            <CheckCircle2 className="w-5 h-5" />
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1 font-medium">
          {kpi.prediction_trend_pct >= 0 ? (
            <span className="flex items-center text-amber-400">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              +{kpi.prediction_trend_pct}%
            </span>
          ) : (
            <span className="flex items-center text-emerald-400">
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              {kpi.prediction_trend_pct}%
            </span>
          )}
          <span className="text-slate-400 ml-1 truncate">
            {kpi.prediction_text}
          </span>
        </div>
      </div>
      
      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
        {kpi.subtext}
      </p>
    </div>
  );
};
