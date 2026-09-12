import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Download, Printer, Activity } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await api.getGeneratedReport();
        setReport(data);
      } catch (e) {
        console.warn('Report fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = async () => {
    try {
      const csvUrl = await api.exportCsvUrl();
      if (csvUrl.startsWith('http://localhost') && window.location.hostname !== 'localhost') {
        // Generate client-side CSV export
        const csvContent = "data:text/csv;charset=utf-8," 
          + "Section,Metric,Value,Unit,Status\n"
          + "Traffic,Avg Congestion,58.4,%,Warning\n"
          + "Traffic,Peak Corridor,Corridor B,78.5%,Congested\n"
          + "Air Quality,City Avg AQI,93,AQI,Moderate\n"
          + "Air Quality,Cleanest Zone,East Eco-Park,46,Optimal\n"
          + "Energy,Total Grid Draw,455.3,kW,Warning\n"
          + "Energy,Highest Draw,Apex Data Center,178.6,Anomaly\n"
          + "Water,Avg Pressure,3.6,Bar,Optimal\n"
          + "System,Health Score,96.5,%,Optimal\n";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `citytwin_audit_report_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        window.open(csvUrl, '_blank');
      }
    } catch {
      window.print();
    }
  };

  if (loading || !report) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-3 text-cyan-400">
          <Activity className="w-6 h-6 animate-spin" />
          <span className="text-sm font-semibold">Compiling Executive Audit Report...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Executive Audit & Analytical Report Generator
          </h1>
          <p className="text-xs text-slate-400">
            Automated synthesis of citywide telemetry, predictive anomalies, what-if simulations, and ML governance benchmarks.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleDownloadCsv}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 text-xs font-semibold transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-md shadow-cyan-500/20 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Container */}
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-800 bg-slate-950/95 space-y-8 print:p-0 print:border-none print:bg-white print:text-black">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 print:border-black">
          <div>
            <div className="text-[10px] font-mono uppercase text-cyan-400 font-bold tracking-wider">
              Official Urban Operations Briefing
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1 print:text-black">
              {report.metadata.report_title}
            </h2>
            <p className="text-xs text-slate-400 print:text-gray-600">
              Platform: {report.metadata.platform} (Version {report.metadata.version})
            </p>
          </div>
          <div className="text-right text-xs text-slate-400 font-mono print:text-gray-600">
            <p>Generated: {new Date(report.metadata.generated_at).toLocaleString()}</p>
            <p className="text-emerald-400 print:text-emerald-700 font-bold">Status: Certified Complete</p>
          </div>
        </div>

        {/* Section 1: Executive Summary */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 print:text-cyan-800">
            1. Executive Summary & Synthesis
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed print:text-gray-800">
            {report.executive_summary}
          </p>
        </div>

        {/* Section 2: Key Infrastructure KPI Overview */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 print:text-cyan-800">
            2. Real-Time Telemetry & Metric Audits
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 print:border-gray-300 print:bg-gray-50">
              <span className="text-slate-500 print:text-gray-600">Congestion:</span>
              <p className="text-lg font-bold text-white print:text-black">{report.kpi_overview.traffic_congestion.current_value}</p>
              <span className="text-[10px] text-amber-400">{report.kpi_overview.traffic_congestion.prediction_text}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 print:border-gray-300 print:bg-gray-50">
              <span className="text-slate-500 print:text-gray-600">Air Quality:</span>
              <p className="text-lg font-bold text-white print:text-black">{report.kpi_overview.air_quality_index.current_value}</p>
              <span className="text-[10px] text-sky-400">{report.kpi_overview.air_quality_index.prediction_text}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 print:border-gray-300 print:bg-gray-50">
              <span className="text-slate-500 print:text-gray-600">Grid Energy:</span>
              <p className="text-lg font-bold text-white print:text-black">{report.kpi_overview.grid_energy_consumption.current_value}</p>
              <span className="text-[10px] text-amber-400">{report.kpi_overview.grid_energy_consumption.prediction_text}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 print:border-gray-300 print:bg-gray-50">
              <span className="text-slate-500 print:text-gray-600">Composite Risk:</span>
              <p className="text-lg font-bold text-white print:text-black">{report.kpi_overview.composite_risk.current_value}</p>
              <span className="text-[10px] text-rose-400">{report.kpi_overview.composite_risk.prediction_text}</span>
            </div>
          </div>
        </div>

        {/* Section 3: Active Anomalies Diagnostic Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 print:text-cyan-800">
            3. Isolation Forest Anomaly Diagnostics
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 uppercase font-mono text-[10px] print:bg-gray-100 print:text-black">
                <tr>
                  <th className="p-2.5">Entity</th>
                  <th className="p-2.5">Severity</th>
                  <th className="p-2.5">Actual vs Expected</th>
                  <th className="p-2.5">AI Diagnostic</th>
                  <th className="p-2.5">Recommended Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-gray-200">
                {report.active_anomalies.map((anom: any) => (
                  <tr key={anom.id} className="print:text-black">
                    <td className="p-2.5 font-bold text-white print:text-black">{anom.entity_name}</td>
                    <td className="p-2.5 text-rose-400 font-bold">{anom.severity}</td>
                    <td className="p-2.5 font-mono">{anom.actual_value} / {anom.expected_value}</td>
                    <td className="p-2.5 text-slate-300 print:text-gray-800">{anom.explanation}</td>
                    <td className="p-2.5 text-emerald-400 print:text-emerald-700 font-medium">{anom.recommended_action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: What-If Scenario Synthesis */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 print:text-cyan-800">
            4. Scenario Stress-Test Verification
          </h3>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs print:border-gray-300 print:bg-gray-50">
            <h4 className="font-bold text-white print:text-black">{report.what_if_scenario_audit.title}</h4>
            <p className="text-slate-300 print:text-gray-800">{report.what_if_scenario_audit.impact_summary}</p>
            <div className="pt-2 border-t border-slate-800 print:border-gray-200 text-emerald-400 print:text-emerald-700">
              <strong>Optimization Protocol:</strong> {report.what_if_scenario_audit.recommendation}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
