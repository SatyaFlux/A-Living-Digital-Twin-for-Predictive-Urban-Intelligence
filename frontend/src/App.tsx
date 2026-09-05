import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, PageId } from './components/layout/Sidebar';
import { TwinAIChatDrawer } from './components/chat/TwinAIChatDrawer';

// Import All Pages
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { DigitalTwinMapPage } from './pages/DigitalTwinMapPage';
import { TrafficPage } from './pages/TrafficPage';
import { AirQualityPage } from './pages/AirQualityPage';
import { EnergyPage } from './pages/EnergyPage';
import { WaterPage } from './pages/WaterPage';
import { WhatIfSimulatorPage } from './pages/WhatIfSimulatorPage';
import { OptimizationPage } from './pages/OptimizationPage';
import { VisionAnalyticsPage } from './pages/VisionAnalyticsPage';
import { ModelMonitoringPage } from './pages/ModelMonitoringPage';
import { ReportsPage } from './pages/ReportsPage';
import { PrivacyEthicsPage } from './pages/PrivacyEthicsPage';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={setCurrentPage} />;
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} onOpenChat={() => setIsChatOpen(true)} />;
      case 'map':
        return <DigitalTwinMapPage />;
      case 'traffic':
        return <TrafficPage />;
      case 'air-quality':
        return <AirQualityPage />;
      case 'energy':
        return <EnergyPage />;
      case 'water':
        return <WaterPage />;
      case 'what-if':
        return <WhatIfSimulatorPage />;
      case 'optimization':
        return <OptimizationPage />;
      case 'vision':
        return <VisionAnalyticsPage />;
      case 'models':
        return <ModelMonitoringPage />;
      case 'reports':
        return <ReportsPage />;
      case 'privacy':
        return <PrivacyEthicsPage />;
      default:
        return <Dashboard onNavigate={setCurrentPage} onOpenChat={() => setIsChatOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col transition-colors duration-200">
      {/* Top Navigation */}
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenChat={() => setIsChatOpen(true)}
      />

      {/* Main Layout Body */}
      <div className="flex flex-1 relative">
        {/* Collapsible Sidebar */}
        <Sidebar
          currentPage={currentPage}
          onSelectPage={setCurrentPage}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full transition-all duration-300">
          {renderPage()}
        </main>
      </div>

      {/* Grounded TwinAI Chat Drawer */}
      <TwinAIChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
