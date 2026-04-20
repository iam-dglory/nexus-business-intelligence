'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import useSWR from 'swr';
import { useStore } from '../../store/useStore';
import { api } from '../../lib/api';
import type { Connection, Company } from '../../types';

const STATUS_COLORS: Record<string, string> = {
  PENDING:  'border-neon-amber text-neon-amber bg-neon-amber/10',
  ACCEPTED: 'border-neon-green text-neon-green bg-neon-green/10',
  DECLINED: 'border-red-500 text-red-400 bg-red-500/10',
};

const PURPOSE_ICONS: Record<string, string> = {
  SELLER: '📦', BUYER: '🛒', INVESTOR: '💰',
};

export default function DashboardPage() {
  const router = useRouter();
  const user = useStore((s) => s.user);
  const token = useStore((s) => s.token);
  const clearAuth = useStore((s) => s.clearAuth);

  const [editingLinkedIn, setEditingLinkedIn] = useState(false);
  const [linkedInUrl, setLinkedInUrl] = useState('');
  const [bio, setBio] = useState('');
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => { if (!token) router.push('/auth'); }, [token, router]);

  const { data: connections = [] } = useSWR<Connection[]>(token ? 'connections' : null, api.connections.list);
  const { data: bookmarks = [] } = useSWR<Company[]>(token ? 'bookmarks' : null, api.bookmarks.list);

  if (!user) return null;

  const pending  = connections.filter(c => c.status === 'PENDING').length;
  const accepted = connections.filter(c => c.status === 'ACCEPTED').length;

  function saveProfile() {
    // Save to localStorage for now (would go to backend in production)
    localStorage.setItem('nexus-profile', JSON.stringify({ linkedInUrl, bio, company, jobTitle }));
    setSaved(true);
    setEditingLinkedIn(false);
    setTimeout(() => setSaved(false), 2000);
  }

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('nexus-profile') || '{}');
      if (saved.linkedInUrl) setLinkedInUrl(saved.linkedInUrl);
      if (saved.bio) setBio(saved.bio);
      if (saved.company) setCompany(saved.company);
      if (saved.jobTitle) setJobTitle(saved.jobTitle);
    } catch {}
  }, []);

  return (
    <div className="min-h-screen bg-bg">
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(0,212,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.02) 1px,transparent 1px)',
        backgroundSize: '48px 48px',
      }} />

      <header className="glass-panel border-b border-border px-6 py-3 flex items-center gap-4 relative z-10">
        <a href="/" className="font-mono text-sm font-bold tracking-widest text-neon-blue hover:opacity-80 transition-opacity flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-blue opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-blue" />
          </span>
          NEXUS
        </a>
        <div className="h-4 w-px bg-border" />
        <span className="font-mono text-xs text-muted tracking-widest">DASHBOARD</span>
        <div className="ml-auto flex items-center gap-3">
          <a href="/" className="font-mono text-xs text-neon-blue hover:underline">← Back to map</a>
          <button onClick={() => { clearAuth(); router.push('/'); }}
            className="font-mono text-xs text-muted hover:text-red-400 transition-colors border border-border rounded px-3 py-1.5">
            LOGOUT
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-2xl font-extrabold text-slate-100">
            Welcome back, <span className="text-neon-blue">{user.name.split(' ')[0]}</span>
          </h1>
          <p className="text-sm text-muted mt-1 font-mono">{user.email}</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { val: connections.length, label: 'Total requests', color: 'text-neon-blue' },
            { val: pending,            label: 'Pending',         color: 'text-neon-amber' },
            { val: accepted,           label: 'Accepted',        color: 'text-neon-green' },
            { val: bookmarks.length,   label: 'Saved companies', color: 'text-neon-purple' },
          ].map((s) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="bg-bg-3 border border-border rounded-lg p-4">
              <p className={`font-mono text-2xl font-bold ${s.color}`}>{s.val}</p>
              <p className="text-xs text-muted mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">

          {/* Profile Card */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass-panel border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-bg-2">
              <p className="font-mono text-xs text-neon-blue tracking-widest uppercase">Your Profile</p>
              <button onClick={() => setEditingLinkedIn(!editingLinkedIn)}
                className="font-mono text-xs text-muted hover:text-neon-blue transition-colors border border-border rounded px-2 py-1">
                {editingLinkedIn ? 'CANCEL' : 'EDIT'}
              </button>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-full bg-neon-purple/20 border-2 border-neon-purple/40 flex items-center justify-center font-mono text-lg font-bold text-neon-purple flex-shrink-0">
                  {user.name.slice(0,2).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-slate-100 text-base">{user.name}</p>
                  <p className="text-xs text-muted font-mono">{user.email}</p>
                  {jobTitle && <p className="text-xs text-neon-blue mt-1">{jobTitle}{company ? ` at ${company}` : ''}</p>}
                </div>
              </div>

              {editingLinkedIn ? (
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="font-mono text-xs text-muted uppercase tracking-widest block mb-1">Job Title</label>
                    <input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g. Founder, Sales Director"
                      className="w-full bg-bg-3 border border-border rounded px-3 py-2 font-mono text-xs text-slate-200 placeholder-muted focus:outline-none focus:border-neon-blue transition-colors" />
                  </div>
                  <div>
                    <label className="font-mono text-xs text-muted uppercase tracking-widest block mb-1">Company / Organisation</label>
                    <input value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Acme Corp"
                      className="w-full bg-bg-3 border border-border rounded px-3 py-2 font-mono text-xs text-slate-200 placeholder-muted focus:outline-none focus:border-neon-blue transition-colors" />
                  </div>
                  <div>
                    <label className="font-mono text-xs text-muted uppercase tracking-widest block mb-1">LinkedIn URL</label>
                    <input value={linkedInUrl} onChange={e => setLinkedInUrl(e.target.value)} placeholder="https://linkedin.com/in/yourprofile"
                      className="w-full bg-bg-3 border border-border rounded px-3 py-2 font-mono text-xs text-slate-200 placeholder-muted focus:outline-none focus:border-neon-blue transition-colors" />
                  </div>
                  <div>
                    <label className="font-mono text-xs text-muted uppercase tracking-widest block mb-1">Bio / What you offer</label>
                    <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                      placeholder="Describe what you offer or what you're looking for..."
                      className="w-full bg-bg-3 border border-border rounded px-3 py-2 font-mono text-xs text-slate-200 placeholder-muted focus:outline-none focus:border-neon-blue transition-colors resize-none" />
                  </div>
                  <button onClick={saveProfile}
                    className="w-full py-2.5 bg-neon-blue/20 border border-neon-blue rounded font-mono text-xs text-neon-blue tracking-widest hover:bg-neon-blue/30 transition-all">
                    {saved ? '✓ SAVED' : 'SAVE PROFILE'}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {bio && <p className="text-xs text-slate-300 leading-relaxed bg-bg-3 border border-border rounded p-3">{bio}</p>}
                  {linkedInUrl ? (
                    <a href={linkedInUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-neon-blue hover:underline font-mono">
                      <span style={{ fontSize: 14 }}>💼</span> LinkedIn Profile →
                    </a>
                  ) : (
                    <button onClick={() => setEditingLinkedIn(true)}
                      className="flex items-center gap-2 text-xs text-muted hover:text-neon-blue transition-colors font-mono border border-dashed border-border rounded p-3 justify-center">
                      <span>+</span> Add LinkedIn profile & bio
                    </button>
                  )}
                  <div className="pt-2 border-t border-border">
                    <p className="font-mono text-xs text-muted mb-2">PROFILE VISIBILITY</p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      When you connect with a company, they'll see your name, email, job title, bio, and LinkedIn profile. This helps them evaluate your request seriously.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Connections */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="glass-panel border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-bg-2">
              <p className="font-mono text-xs text-neon-amber tracking-widest uppercase">Connection Requests</p>
              <span className="font-mono text-xs text-muted">{connections.length}</span>
            </div>
            <div className="divide-y divide-border max-h-96 overflow-y-auto">
              {connections.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-xs text-muted font-mono mb-2">No connections yet</p>
                  <a href="/" className="text-xs text-neon-blue hover:underline font-mono">Explore the map →</a>
                </div>
              ) : connections.map((c) => (
                <div key={c.id} className="px-5 py-3 flex items-start gap-3 hover:bg-bg-4 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-200 truncate">{c.company.name}</p>
                    <p className="text-xs text-muted font-mono mt-0.5">{c.company.industry} · {c.company.city}</p>
                    {(c as any).message && (
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">{(c as any).message}</p>
                    )}
                    <p className="text-xs text-muted font-mono mt-1">{new Date(c.createdAt).toLocaleDateString('en-AU')}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className={`font-mono text-xs px-1.5 py-0.5 rounded border ${STATUS_COLORS[c.status]}`}>{c.status}</span>
                    <span className="text-xs">{PURPOSE_ICONS[c.role] ?? '🤝'} <span className="font-mono text-xs text-muted">{c.role}</span></span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Saved Companies */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass-panel border border-border rounded-xl overflow-hidden md:col-span-2">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-bg-2">
              <p className="font-mono text-xs text-neon-purple tracking-widest uppercase">Saved Companies</p>
              <span className="font-mono text-xs text-muted">{bookmarks.length}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-0 divide-border">
              {bookmarks.length === 0 ? (
                <div className="p-8 text-center col-span-3">
                  <p className="text-xs text-muted font-mono mb-2">No saved companies</p>
                  <a href="/" className="text-xs text-neon-blue hover:underline font-mono">Browse the map →</a>
                </div>
              ) : bookmarks.map((c) => (
                <a key={c.id} href="/" className="px-5 py-3 flex items-center gap-3 hover:bg-bg-4 transition-colors border-b border-r border-border">
                  <div className="w-8 h-8 rounded bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center font-mono text-xs font-bold text-neon-blue flex-shrink-0">
                    {c.name.slice(0,2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-200 truncate">{c.name}</p>
                    <p className="text-xs text-muted font-mono truncate">{c.industry}</p>
                    <p className="text-xs text-neon-green font-mono">{c.valuationLabel ?? '—'}</p>
                  </div>
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
