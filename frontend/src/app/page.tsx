'use client';
import { TopBar } from '../components/ui/TopBar';
import { Sidebar } from '../components/sidebar/Sidebar';
import { MapView } from '../components/map/MapView';
import { CompanyPanel } from '../components/panels/CompanyPanel';
import { ConnectModal } from '../components/panels/ConnectModal';
import { TrendingBar } from '../components/ui/TrendingBar';
import { useSocket } from '../hooks/useSocket';
import { useStore } from '../store/useStore';

export default function HomePage() {
  useSocket();
  const sidebarOpen = useStore((s) => s.sidebarOpen);
  const selectedCompany = useStore((s) => s.selectedCompany);

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', width:'100vw', overflow:'hidden', background:'#070b14' }}>
      <TopBar />
      <div style={{ display:'flex', flex:1, overflow:'hidden', position:'relative' }}>

        {/* Sidebar */}
        <aside style={{
          width: sidebarOpen ? '200px' : '0',
          flexShrink: 0,
          overflow: 'hidden',
          transition: 'width 0.3s ease',
          background: 'rgba(13,20,34,0.95)',
          borderRight: '1px solid #1e2d3d',
          overflowY: sidebarOpen ? 'auto' : 'hidden',
          zIndex: 20,
        }}>
          {sidebarOpen && <Sidebar />}
        </aside>

        {/* Map */}
        <main style={{ flex:1, position:'relative', overflow:'hidden', minWidth:0 }}>
          <MapView />
          <TrendingBar />
        </main>

        {/* Company detail panel — sits beside map, not over it */}
        {selectedCompany && (
          <div style={{
            width: '300px',
            flexShrink: 0,
            background: 'rgba(13,20,34,0.98)',
            borderLeft: '1px solid #1e2d3d',
            overflowY: 'auto',
            zIndex: 20,
          }}>
            <CompanyPanel />
          </div>
        )}
      </div>
      <ConnectModal />
    </div>
  );
}
