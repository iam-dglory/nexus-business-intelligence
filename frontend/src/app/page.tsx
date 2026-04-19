// nexus/frontend/src/app/page.tsx
'use client';
import { useEffect } from 'react';
import { TopBar } from '../components/ui/TopBar';
import { Sidebar } from '../components/sidebar/Sidebar';
import { MapView } from '../components/map/MapView';
import { CompanyPanel } from '../components/panels/CompanyPanel';
import { ConnectModal } from '../components/panels/ConnectModal';
import { TrendingBar } from '../components/ui/TrendingBar';
import { CompareBar } from '../components/ui/CompareBar';
import { useSocket } from '../hooks/useSocket';
import { useStore } from '../store/useStore';

export default function HomePage() {
  useSocket();
  const sidebarOpen = useStore((s) => s.sidebarOpen);
  const compareIds = useStore((s) => s.compareIds);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <TopBar />
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <aside
          className={`
            glass-panel border-r border-border z-20 flex-shrink-0
            transition-all duration-300 ease-in-out overflow-y-auto
            ${sidebarOpen ? 'w-56' : 'w-0 overflow-hidden'}
          `}
        >
          {sidebarOpen && <Sidebar />}
        </aside>

        {/* Map canvas */}
        <main className="flex-1 relative">
          <MapView />
          <TrendingBar />
          {compareIds.length > 0 && <CompareBar />}
        </main>

        {/* Company detail panel */}
        <CompanyPanel />
      </div>

      {/* Modals */}
      <ConnectModal />
    </div>
  );
}
