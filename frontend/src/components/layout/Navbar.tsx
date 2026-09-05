import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { UserRole } from '../../types';
import {
  Activity, Shield, User as UserIcon, Sun, Moon,
  Bot, Menu, Radio, Sparkles
} from 'lucide-react';
import { DataBadge } from '../common/DataBadge';

interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenChat: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onOpenChat }) => {
  const { user, role, loginAs } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-slate-800/80 px-4 lg:px-6 py-3 transition-colors duration-200">
      <div className="flex items-center justify-between">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 lg:hidden focus:outline-none"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
              <Activity className="w-5 h-5 text-white animate-pulse-slow" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 bg-clip-text text-transparent">
                  AI-CityTwin
                </span>
                <span className="hidden sm:inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
                  v1.0 Pro
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-slate-400 font-medium">
                Observe. Predict. Simulate. Decide.
              </p>
            </div>
          </div>
        </div>

        {/* Center: Live Telemetry Ticker & Simulated Badge */}
        <div className="hidden xl:flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 text-xs">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-medium">Telemetry Stream:</span>
            <span className="text-emerald-400 font-mono">Synchronized (5s tick)</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Health: <strong className="text-white">98.4%</strong></span>
          </div>
          <DataBadge isSimulated={true} />
        </div>

        {/* Right: Actions, TwinAI Trigger, Role Switcher, Theme */}
        <div className="flex items-center space-x-2.5">
          {/* TwinAI Chat Button */}
          <button
            onClick={onOpenChat}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600/30 to-blue-600/30 hover:from-cyan-600/50 hover:to-blue-600/50 text-cyan-300 border border-cyan-500/40 text-xs font-semibold shadow-sm transition-all duration-200"
          >
            <Bot className="w-4 h-4 text-cyan-400 animate-bounce" />
            <span className="hidden sm:inline">Ask TwinAI</span>
            <Sparkles className="w-3 h-3 text-cyan-300" />
          </button>

          {/* Role Switcher */}
          <div className="relative flex items-center">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-900/70 border border-slate-700/60 text-xs">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400 hidden sm:inline">Role:</span>
              <select
                value={role}
                onChange={(e) => loginAs(e.target.value as UserRole)}
                className="bg-transparent text-cyan-300 font-semibold focus:outline-none cursor-pointer text-xs"
              >
                <option value="Admin" className="bg-slate-900 text-white">Admin</option>
                <option value="Analyst" className="bg-slate-900 text-white">Analyst</option>
                <option value="Viewer" className="bg-slate-900 text-white">Viewer</option>
              </select>
            </div>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 border border-slate-700/40 transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
