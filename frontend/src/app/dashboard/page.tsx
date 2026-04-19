// nexus/frontend/src/app/dashboard/page.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import useSWR from 'swr';
import { useStore } from '../../store/useStore';
import { api } from '../../lib/api';
import type { Connection, Company } from '../../types';

const STATUS_COLORS: Record<string, string> = {
  PENDING:  'border-neon-amber  text-neon-amber  bg-neon-amber/10',
  ACCEPTED: 'border-neon-green  text-neon-green  bg-neon-green/10',
  DECLINED: 'border-red-500     text-red-400     bg-red-500/10',
};

const ROLE_COLORS: Record<string, string> = {
  BUYER:    'text-neon-blue',
  SELLER:   'text-neon-green',
  INVESTOR: 'text-neon-purple',
};

function StatCard({ value, label, accent }: { value: string | number; label: string; accent?: string }) {
  return (
    <div className="bg-bg-3 border border-border rounded-lg p-4">
      <p className={`font-mono text-2xl font-bold ${accent ?? 'text-neon-blue'}`}>{value}</p>
      <p className="text-xs text-muted mt-1">{label}</p>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const user = useStore((s) => s.user);
  const token = useStore((s) => s.token);
  const clearAuth = useStore((s) => s.clearAuth);

  useEffect(() => {
    if (!token) router.push('/auth');
  }, [token, router]);

  const { data: connections = [] } = useSWR<Connection[]>(
    token ? 'connections' : null,
    api.connections.list,
  );

  const { data: bookmarks = [] } = useSWR<Company[]>(
    token ? 'bookmarks' : null,
    api.bookmarks.list,
  );

  const { data: userData } = useSWR(
    token ? 'me' : null,
    () => api.auth.me().then((r) => r.user),
  );

  if (!user) return null;

  const pending  = connections.filter((c) => c.status === 'PENDING').length;
  const accepted = connections.filter((c) => c.status === 'ACCEPTED').length;

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="glass-panel border-b border-border px-6 py-4 flex items-center gap-4">
        <a href="/" className="font-mono text-base font-bold tracking-widest text-neon-blue hover:opacity-80 transition-opacity flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-blue opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-blue" />
          </span>
          NEXUS
        </a>
        <div className="h-4 w-px bg-border" />
        <span className="font-mono text-xs text-muted tracking-widest">DASHBOARD</span>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-muted font-mono">{user.name}</span>
          <button
            onClick={() => { clearAuth(); router.push('/'); }}
            className="font-mono text-xs text-muted hover:text-red-400 transition-colors border border-border rounded px-3 py-1.5"
          >
            LOGOUT
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-2xl font-extrabold text-slate-100">
            Welcome back, <span className="text-neon-blue">{user.name.split(' ')[0]}</span>
          </h1>
          <p className="text-sm text-muted mt-1 font-mono">{user.email} · {user.role}</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <StatCard value={connections.length} label="Total connections" accent="text-neon-blue" />
          <StatCard value={pending}  label="Pending requests" accent="text-neon-amber" />
          <StatCard value={accepted} label="Accepted"          accent="text-neon-green" />
          <StatCard value={bookmarks.length} label="Saved companies" accent="text-neon-purple" />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Connections */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel border border-border rounded-lg overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <p className="font-mono text-xs text-neon-blue tracking-widest uppercase">
                Connection Requests
              </p>
              <span className="font-mono text-xs text-muted">{connections.length}</span>
            </div>
            <div className="divide-y divide-border max-h-80 overflow-y-auto">
              {connections.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted font-mono">
                  No connections yet. Explore the map to connect with companies.
                </div>
              ) : (
                connections.map((c) => (
                  <div key={c.id} className="px-4 py-3 flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-200 truncate">{c.company.name}</p>
                      <p className="text-xs text-muted font-mono mt-0.5">{c.company.industry} · {c.company.city}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span className={`font-mono text-xs px-1.5 py-0.5 rounded border ${STATUS_COLORS[c.status]}`}>
                        {c.status}
                      </span>
                      <span className={`font-mono text-xs ${ROLE_COLORS[c.role]}`}>{c.role}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Bookmarks */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-panel border border-border rounded-lg overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <p className="font-mono text-xs text-neon-amber tracking-widest uppercase">
                Saved Companies
              </p>
              <span className="font-mono text-xs text-muted">{bookmarks.length}</span>
            </div>
            <div className="divide-y divide-border max-h-80 overflow-y-auto">
              {bookmarks.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted font-mono">
                  No saved companies. Click ☆ SAVE on any company panel.
                </div>
              ) : (
                bookmarks.map((c) => (
                  <a
                    key={c.id}
                    href={`/?company=${c.id}`}
                    className="px-4 py-3 flex items-center gap-3 hover:bg-bg-4 transition-colors block"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-200 truncate">{c.name}</p>
                      <p className="text-xs text-muted font-mono mt-0.5">{c.industry} · {c.city}, {c.country}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-mono text-xs text-neon-green">{c.valuationLabel ?? '—'}</p>
                      {c.growthRate != null && (
                        <p className="font-mono text-xs text-neon-blue mt-0.5">
                          {c.growthRate > 0 ? '+' : ''}{c.growthRate}%
                        </p>
                      )}
                    </div>
                  </a>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* Profile section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel border border-border rounded-lg p-5 mt-6"
        >
          <p className="font-mono text-xs text-neon-blue tracking-widest uppercase mb-4">Profile</p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-neon-purple/20 border border-neon-purple/40 flex items-center justify-center font-mono text-base font-bold text-neon-purple">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-slate-100">{user.name}</p>
              <p className="text-xs text-muted font-mono">{user.email}</p>
              <p className="text-xs text-neon-purple font-mono mt-0.5">
                {user.role} · Joined {new Date(user.createdAt).toLocaleDateString('en-AU', { year: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>

          {userData?.company && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="font-mono text-xs text-muted uppercase tracking-widest mb-2">Your Company</p>
              <a
                href={`/?company=${userData.company.id}`}
                className="flex items-center gap-2 text-sm font-semibold text-neon-blue hover:underline"
              >
                ↗ {userData.company.name}
              </a>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
