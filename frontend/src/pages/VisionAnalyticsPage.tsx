import React, { useState, useEffect } from 'react';
import { CameraFeed } from '../types';
import { api } from '../services/api';
import {
  Camera, Eye, ShieldCheck, Activity,
  Car, Users, Gauge, Radio
} from 'lucide-react';
import { DataBadge } from '../components/common/DataBadge';

export const VisionAnalyticsPage: React.FC = () => {
  const [selectedCamera, setSelectedCamera] = useState<string>('CAM_01_GATE2');
  const [feed, setFeed] = useState<CameraFeed | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStream = async () => {
      try {
        const data = await api.getCameraStream(selectedCamera);
        setFeed(data);
      } catch (e) {
        console.warn('Camera stream fetch error:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchStream();
    const interval = setInterval(fetchStream, 2000);
    return () => clearInterval(interval);
  }, [selectedCamera]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Anonymous Computer Vision Stream Analytics
            </h1>
            <DataBadge isSimulated={true} />
          </div>
          <p className="text-xs text-slate-400">
            Real-time edge neural inference for vehicle classification, speed estimation, and crowd density.
          </p>
        </div>

        {/* Camera Feed Selector */}
        <div className="flex items-center space-x-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700/60 text-xs">
          <Camera className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">Feed:</span>
          <select
            value={selectedCamera}
            onChange={(e) => setSelectedCamera(e.target.value)}
            className="bg-transparent text-cyan-300 font-semibold focus:outline-none cursor-pointer text-xs"
          >
            <option value="CAM_01_GATE2" className="bg-slate-900 text-white">Gate 2 Arterial Intersection</option>
            <option value="CAM_02_TECH_BLVD" className="bg-slate-900 text-white">Tech Boulevard North View</option>
            <option value="CAM_03_TRANSIT_PLAZA" className="bg-slate-900 text-white">Metro Intermodal Plaza</option>
          </select>
        </div>
      </div>

      {/* Main Stream Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stream Canvas (2 cols) */}
        <div className="lg:col-span-2 relative w-full h-[460px] rounded-2xl overflow-hidden glass-panel border border-slate-800 bg-slate-950 flex flex-col">
          {/* Stream Header */}
          <div className="p-3 border-b border-slate-800 flex items-center justify-between z-10 bg-slate-900/70 backdrop-blur-md">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              <span className="text-xs font-bold text-white font-mono">{selectedCamera}</span>
              <span className="text-xs text-slate-400">| {feed?.location_name}</span>
            </div>
            <div className="flex items-center space-x-2 text-[10px] font-mono text-cyan-400">
              <span>FPS: {feed?.fps || 30.0}</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400">YOLOv8-ONNX Active</span>
            </div>
          </div>

          {/* Video Stream Simulation Canvas with Bounding Boxes */}
          <div className="relative flex-1 w-full h-full bg-slate-900/40 overflow-hidden">
            {/* Road Lanes Background Graphics */}
            <div className="absolute inset-0 flex">
              <div className="w-1/4 h-full border-r border-slate-800/80 bg-slate-950/40" />
              <div className="w-1/4 h-full border-r border-slate-800/60 border-dashed" />
              <div className="w-1/4 h-full border-r border-slate-800/60 border-dashed" />
              <div className="w-1/4 h-full bg-slate-950/40" />
            </div>

            {/* Render Anonymous Bounding Boxes */}
            {feed?.detections.map((d) => {
              const [x, y, w, h] = d.bbox;
              const isPed = d.label === 'pedestrian';
              const boxColor = isPed ? 'border-sky-400 text-sky-400 bg-sky-500/10' : 'border-cyan-400 text-cyan-400 bg-cyan-500/10';

              return (
                <div
                  key={d.id}
                  style={{
                    left: `${x * 100}%`,
                    top: `${y * 100}%`,
                    width: `${w * 100}%`,
                    height: `${h * 100}%`
                  }}
                  className={`absolute border-2 rounded transition-all duration-500 ${boxColor}`}
                >
                  <div className="absolute -top-4 left-0 text-[9px] font-mono font-bold whitespace-nowrap bg-slate-950/90 px-1 rounded border border-current">
                    {d.label} {d.speed_kmh ? `(${d.speed_kmh} km/h)` : ''}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Privacy Overlay Pill */}
          <div className="p-2.5 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              Privacy Certified: Anonymous object detection only. Zero biometric / facial indexing.
            </span>
            <span className="font-mono text-cyan-400">Objects: {feed?.detections.length || 0}</span>
          </div>
        </div>

        {/* Real-time Telemetry Stats (1 col) */}
        <div className="space-y-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2.5">
              Real-Time Stream Metrics
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
                  <Car className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Vehicles</span>
                </div>
                <p className="text-xl font-bold text-cyan-300">{feed?.total_vehicles || 0}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
                  <Users className="w-3.5 h-3.5 text-sky-400" />
                  <span>Crowd Density</span>
                </div>
                <p className="text-xl font-bold text-sky-300">{feed?.crowd_density_pct || 0}%</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 col-span-2">
                <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
                  <Gauge className="w-3.5 h-3.5 text-amber-400" />
                  <span>Average Flow Velocity</span>
                </div>
                <p className="text-xl font-bold text-amber-300">{feed?.average_speed_kmh || 0} km/h</p>
              </div>
            </div>

            {/* Vehicle Type Breakdown */}
            {feed?.vehicle_types && (
              <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                <span className="text-[10px] text-slate-400 uppercase font-mono font-bold">Class Breakdown:</span>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-500">Cars:</span>
                    <p className="font-bold text-white">{feed.vehicle_types.car || 0}</p>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-500">Buses:</span>
                    <p className="font-bold text-white">{feed.vehicle_types.bus || 0}</p>
                  </div>
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-500">Trucks:</span>
                    <p className="font-bold text-white">{feed.vehicle_types.truck || 0}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
