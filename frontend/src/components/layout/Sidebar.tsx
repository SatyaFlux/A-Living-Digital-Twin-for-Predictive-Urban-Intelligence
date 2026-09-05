import React from 'react';
import {
  LayoutDashboard, Map, Car, Wind, Zap, Droplets,
  Sliders, Cpu, Camera, LineChart, FileText,
  ShieldCheck, Home, X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export type PageId =
  | 'landing'
  | 'dashboard'
  | 'map'
  | 'traffic'
  | 'air-quality'
  | 'energy'
  | 'water'
  | 'what-if'
  | 'optimization'
  | 'vision'
  | 'models'
  | 'reports'
  | 'privacy';

interface SidebarProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  isOpen,
  onClose
}) => {
  const { role } = useAuth();

  const navItems = [
    { id: 'landing' as PageId, label: 'Landing Showcase', icon: <Home className="w-4 h-4" />, section: 'Core' },
    { id: 'dashboard' as PageId, label: 'Command Center', icon: <LayoutDashboard className="w-4 h-4" />, section: 'Core' },
    { id: 'map' as PageId, label: 'Digital Twin Map 2D/3D', icon: <Map className="w-4 h-4" />, section: 'Core' },
    
    { id: 'traffic' as PageId, label: 'Traffic Intelligence', icon: <Car className="w-4 h-4" />, section: 'Urban Modules' },
    { id: 'air-quality' as PageId, label: 'Air Quality & AQI', icon: <Wind className="w-4 h-4" />, section: 'Urban Modules' },
    { id: 'energy' as PageId, label: 'Building Energy Grid', icon: <Zap className="w-4 h-4" />, section: 'Urban Modules' },
    { id: 'water' as PageId, label: 'Water Intelligence', icon: <Droplets className="w-4 h-4" />, section: 'Urban Modules' },

    { id: 'what-if' as PageId, label: 'What-If Simulator', icon: <Sliders className="w-4 h-4" />, section: 'AI Decision Engine' },
    { id: 'optimization' as PageId, label: 'Urban Optimizer', icon: <Cpu className="w-4 h-4" />, section: 'AI Decision Engine' },
    { id: 'vision' as PageId, label: 'Computer Vision Live', icon: <Camera className="w-4 h-4" />, section: 'AI Decision Engine' },

    { id: 'models' as PageId, label: 'ML Model Governance', icon: <LineChart className="w-4 h-4" />, section: 'Auditing & System' },
    { id: 'reports' as PageId, label: 'Report Builder & CSV', icon: <FileText className="w-4 h-4" />, section: 'Auditing & System' },
    { id: 'privacy' as PageId, label: 'Privacy & Ethics', icon: <ShieldCheck className="w-4 h-4" />, section: 'Auditing & System' },
  ];

  const sections = ['Core', 'Urban Modules', 'AI Decision Engine', 'Auditing & System'];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 glass-panel border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header with Close Button */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800/80 lg:hidden">
          <span className="text-sm font-bold text-cyan-400">Navigation Menu</span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {sections.map((section) => {
            const items = navItems.filter((i) => i.section === section);
            return (
              <div key={section} className="space-y-1">
                <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                  {section}
                </div>
                {items.map((item) => {
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectPage(item.id);
                        onClose();
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
                      }`}
                    >
                      <span className={`${isActive ? 'text-cyan-400' : 'text-slate-400'}`}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono flex items-center justify-between">
          <span>Active Role: <strong className="text-cyan-400">{role}</strong></span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>
      </aside>
    </>
  );
};
