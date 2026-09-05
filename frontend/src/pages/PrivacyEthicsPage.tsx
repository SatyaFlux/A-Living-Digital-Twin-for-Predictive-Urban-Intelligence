import React from 'react';
import {
  ShieldCheck, EyeOff, Lock, Database,
  FileCheck, AlertCircle, CheckCircle2
} from 'lucide-react';

export const PrivacyEthicsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-xs font-semibold text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Research Ethics & Data Governance Standard</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Privacy, Ethics & Scientific Integrity
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Governance framework establishing responsible AI principles, non-invasive sensory analytics, and transparent dataset provenance.
        </p>
      </div>

      {/* Core Privacy Principles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <EyeOff className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">1. Non-Invasive Computer Vision</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            The platform strictly prohibits biometric identification and facial recognition. Neural video analytics extract anonymous bounding boxes, vehicle classifications, and aggregate crowd density heatmaps. Raw video frames are processed transiently in memory without persistent storage.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">2. Zero PII Retention</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Telemetry ingestion pipelines operate purely on physical sensor units (vph, AQI, kW, bar). Personal identifiable information (PII) such as vehicle license plates or commuter identities are never collected, indexed, or stored in any database entity.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">3. Transparent Synthetic & Demo Data Demarcation</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            In compliance with academic research guidelines, synthetic or simulated datasets are explicitly badged as <strong>"Demo / Simulated Data"</strong> in both API responses and UI overlays. The system never misrepresents simulated numbers as real-world sensor streams.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-sky-950/80 border border-sky-500/40 flex items-center justify-center text-sky-400">
            <FileCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white">4. Grounded AI & Anti-Hallucination Policy</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            TwinAI RAG systems only answer questions backed by structured telemetry or indexed policy documents. When telemetry data is insufficient, the system explicitly responds: <em>"I don't have enough data to determine that"</em> to prevent hallucinated operational decisions.
          </p>
        </div>
      </div>

      {/* Academic Research Attribution */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white">Research Project Formulation</h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          <strong>Project Title:</strong> “AI-CityTwin: An AI-Powered Digital Twin Framework for Predictive Urban Intelligence and What-If Decision Simulation”
        </p>
        <p className="text-xs text-slate-400 leading-relaxed">
          Developed as a high-tier B.Tech CSE (Artificial Intelligence & Machine Learning) project demonstrating the convergence of digital twins, physics-constrained simulation engines, multi-horizon time-series forecasting, and grounded LLM copilots.
        </p>
      </div>
    </div>
  );
};
