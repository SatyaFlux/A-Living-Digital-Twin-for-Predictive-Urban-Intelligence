import React from 'react';

interface DataBadgeProps {
  isSimulated?: boolean;
  className?: string;
}

export const DataBadge: React.FC<DataBadgeProps> = ({ isSimulated = true, className = '' }) => {
  if (isSimulated) {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-1.5 animate-pulse"></span>
        Demo / Simulated Data
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-ping"></span>
      Live Hardware Stream
    </span>
  );
};
