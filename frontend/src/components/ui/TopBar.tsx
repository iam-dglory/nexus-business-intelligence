// nexus/frontend/src/components/ui/TopBar.tsx
'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { useSearch } from '../../hooks/useSearch';
import { api } from '../../lib/api';

export function TopBar() {
  const { query, setQuery, results, isSearching } = useSearch();
  const [showResults, setShowResults] = useState(false);
  const sidebarOpen = useStore((s) => s.sidebarOpen);
  const setSidebarOpen = useStore((s) => s.setSidebarOpen);
  const mapView = useStore((s) => s.mapView);
  const setMapView = useStore((s) => s.setMapView);
  const setSelectedCompany = useStore((s) => s.setSelectedCompany);
  const inputRef = useRef<HTMLInputElement>(null);
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () =>
      setTime(new Date().toLocaleTimeString('en-AU', { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setShowResults(results.length > 0 && query.length >= 2);
  }, [results, query]);

  async function handleSelectResult(id: string) {
    setShowResults(false);
    setQuery('');
    const company = await api.companies.get(id).catch(() => null);
    if (company) setSelectedCompany(company);
  }

  return (
    <header className="glass-panel border-b border-border h-13 flex items-center px-4 gap-3 z-30 relative flex-shrink-0"
      style={{ height: '52px' }}>

      {/* Logo */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="flex items-center gap-2 font-mono text-base font-bold tracking-widest text-neon-blue hover:opacity-80 transition-opacity"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-blue opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-blue" />
        </span>
        NEXUS
      </button>

      <div className="h-4 w-px bg-border" />

      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="5" cy="5" r="3.5" stroke="#64748b" strokeWidth="1.5"/>
            <line x1="8" y1="8" x2="11" y2="11" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 150)}
          placeholder="Search companies, industries, locations..."
          className="w-full bg-bg-3 border border-border rounded font-mono text-xs pl-8 pr-3 py-2 text-slate-200 placeholder-muted focus:outline-none focus:border-neon-blue transition-colors"
        />

        <AnimatePresence>
          {showResults && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full mt-1 left-0 right-0 glass-panel rounded border border-border z-50 overflow-hidden shadow-panel"
            >
              {results.map((r) => (
                <button
                  key={r.id}
                  onMouseDown={() => handleSelectResult(r.id)}
                  className="w-full text-left px-3 py-2.5 hover:bg-bg-4 transition-colors border-b border-border last:border-0 flex items-center gap-3"
                >
                  <span className="text-neon-blue font-mono text-xs w-1.5 h-1.5 rounded-full bg-neon-blue flex-shrink-0" />
                  <span className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-slate-200 truncate block">{r.name}</span>
                    <span className="text-xs text-muted font-mono truncate block">{r.industry} · {r.city}, {r.country}</span>
                  </span>
                </button>
              ))}
              {isSearching && (
                <div className="px-3 py-2 text-xs text-muted font-mono animate-pulse">Scanning...</div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* View toggles */}
      <div className="flex gap-1">
        {(['cluster', 'heatmap'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setMapView(v)}
            className={`font-mono text-xs px-3 py-1.5 rounded border transition-all ${
              mapView === v
                ? 'border-neon-blue text-neon-blue bg-neon-blue/10'
                : 'border-border text-muted hover:border-border-bright hover:text-slate-300'
            }`}
          >
            {v.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Status */}
      <div className="ml-auto flex items-center gap-4 font-mono text-xs text-muted">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse-slow" />
          <span>LIVE</span>
        </div>
        <span className="hidden sm:block">{time}</span>
      </div>
    </header>
  );
}
