import React from 'react';
import {
  Eye, Activity, Sliders, Cpu, ArrowRight, ShieldCheck,
  Zap, Wind, Car, Droplets, Database, Layers, Sparkles, CheckCircle2
} from 'lucide-react';
import { PageId } from '../components/layout/Sidebar';

interface LandingPageProps {
  onNavigate: (page: PageId) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-8 sm:p-12 lg:p-16 border border-cyan-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-xs font-semibold text-cyan-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen Urban AI Intelligence Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            A Living Digital Twin for{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
              Predictive Urban Intelligence.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            Monitor, predict, simulate, and optimize complex urban systems using AI.
            Empowering smart campus and municipal operators to move from reactive mitigation to proactive, data-grounded simulation.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <span>Launch Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('what-if')}
              className="flex items-center space-x-2 px-6 py-3.5 rounded-xl glass-card hover:bg-slate-800/60 text-slate-200 border border-slate-700/80 font-semibold text-sm transition-all"
            >
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Explore What-If Simulator</span>
            </button>
          </div>
        </div>
      </div>

      {/* The 4 Strategic Pillars */}
      <div>
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">Core Capabilities</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Observe. Predict. Simulate. Decide.</h2>
          <p className="text-xs sm:text-sm text-slate-400">The four-tier intelligence continuum powering AI-CityTwin.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">1. Observe</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time multi-sensor telemetry synchronizing traffic corridors, air quality, building energy, water pressure, and anonymous computer vision streams.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-950/80 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">2. Predict</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Time-series forecasting (15m, 30m, 60m, 2h horizons) using Gradient Boosting, Random Forests, and sequence models with SHAP feature explainability.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Sliders className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">3. Simulate</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Physics & network-constrained What-If Scenario Engine modeling arterial road closures, EV charging surges, modal shifts, and extreme weather inundation.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">4. Decide</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Multi-Objective Genetic Algorithm & Pareto Optimizer generating prioritized, actionable interventions with TwinAI grounded conversational reasoning.
            </p>
          </div>
        </div>
      </div>

      {/* Architecture & Tech Stack Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">AI-CityTwin Architectural Stack</h3>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30">
              Production Architecture
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="font-semibold text-cyan-300">Frontend Layer</span>
              <p className="text-slate-400">React 18, TypeScript, Tailwind CSS, Recharts, Three.js 3D WebGL viewport, Lucide Icons.</p>
            </div>
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="font-semibold text-sky-300">Backend API Gateway</span>
              <p className="text-slate-400">FastAPI async REST endpoints, WebSockets telemetry streamer, JWT role-based authorization.</p>
            </div>
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="font-semibold text-emerald-300">Predictive ML & Anomaly</span>
              <p className="text-slate-400">Gradient Boosting, Random Forest, Linear Regression, Isolation Forest, SHAP explainability.</p>
            </div>
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="font-semibold text-amber-300">Simulation & Optimization</span>
              <p className="text-slate-400">BPR Capacity-Delay models, Multi-Objective Pareto Genetic Algorithm, Grounded RAG Assistant.</p>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 mb-2">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white">Research & Ethics Certified</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Designed with strict data integrity: All demo metrics are explicitly badged, computer vision is 100% anonymous without facial recognition, and predictions adhere to strict factual grounding.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <button
              onClick={() => onNavigate('privacy')}
              className="w-full text-center py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-cyan-300 border border-slate-700 transition-all"
            >
              Read Ethics & Governance Policy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
