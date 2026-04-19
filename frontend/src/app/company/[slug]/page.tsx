// nexus/frontend/src/app/company/[slug]/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../../../store/useStore';
import { api } from '../../../lib/api';
import type { Company } from '../../../types';

const TYPE_COLORS: Record<string, string> = {
  B2B:    'border-neon-blue   text-neon-blue   bg-neon-blue/10',
  B2C:    'border-neon-amber  text-neon-amber  bg-neon-amber/10',
  HYBRID: 'border-neon-green  text-neon-green  bg-neon-green/10',
};

const CATEGORY_ICONS: Record<string, string> = {
  funding:   '💰',
  product:   '🚀',
  milestone: '🏆',
  news:      '📰',
};

function formatAge(year: number) {
  const age = new Date().getFullYear() - year;
  return `${age} year${age !== 1 ? 's' : ''}`;
}

export default function CompanyPage({ params }: { params: { slug: string } }) {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const setConnectModalOpen = useStore((s) => s.setConnectModalOpen);
  const setSelectedCompany = useStore((s) => s.setSelectedCompany);

  useEffect(() => {
    api.companies.get(params.slug)
      .then(setCompany)
      .catch(() => setError('Company not found'))
      .finally(() => setLoading(false));
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="font-mono text-xs text-neon-blue animate-pulse tracking-widest">LOADING...</p>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4">
        <p className="font-mono text-sm text-red-400">⚠ {error || 'Not found'}</p>
        <a href="/" className="font-mono text-xs text-neon-blue hover:underline">← Back to map</a>
      </div>
    );
  }

  const age = formatAge(company.foundedYear);

  return (
    <div className="min-h-screen bg-bg">
      {/* Subtle grid bg */}
      <div
        className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Header nav */}
      <header className="glass-panel border-b border-border px-6 py-3 flex items-center gap-3 relative z-10">
        <a href="/" className="font-mono text-sm font-bold tracking-widest text-neon-blue hover:opacity-80 transition-opacity flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-blue opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-blue" />
          </span>
          NEXUS
        </a>
        <span className="text-muted font-mono text-xs">/</span>
        <span className="font-mono text-xs text-muted truncate">{company.name}</span>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 relative z-10">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start gap-4 flex-wrap">
            {/* Logo placeholder */}
            <div className="w-16 h-16 rounded-xl bg-bg-3 border border-border flex items-center justify-center font-mono text-xl font-bold text-neon-blue flex-shrink-0">
              {company.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="font-display text-3xl font-extrabold text-slate-100">{company.name}</h1>
                {company.isFeatured && (
                  <span className="px-2 py-0.5 rounded border border-neon-amber text-neon-amber bg-neon-amber/10 font-mono text-xs">★ FEATURED</span>
                )}
              </div>
              <p className="text-sm text-muted font-mono">
                {company.industry} · {company.city}, {company.country} · Est. {company.foundedYear}
              </p>
              <div className="flex gap-2 mt-2 flex-wrap">
                <span className={`px-2 py-0.5 rounded border font-mono text-xs ${TYPE_COLORS[company.businessType]}`}>
                  {company.businessType}
                </span>
                {company.tags?.slice(0, 4).map(({ tag }) => (
                  <span key={tag} className="px-2 py-0.5 rounded bg-bg-3 border border-border font-mono text-xs text-muted">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedCompany(company);
                setConnectModalOpen(true);
              }}
              className="px-5 py-2.5 rounded font-mono text-xs font-bold tracking-widest
                bg-gradient-to-r from-neon-purple to-indigo-600 text-white
                hover:opacity-85 transition-opacity flex-shrink-0"
            >
              ↗ CONNECT
            </button>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="md:col-span-2 flex flex-col gap-6">
            {/* Description */}
            {company.description && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-panel border border-border rounded-lg p-5"
              >
                <p className="font-mono text-xs text-neon-blue tracking-widest uppercase mb-3">About</p>
                <p className="text-sm text-slate-300 leading-relaxed">{company.description}</p>
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-xs text-neon-blue hover:underline font-mono"
                  >
                    ↗ {company.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </motion.div>
            )}

            {/* Updates timeline */}
            {company.updates && company.updates.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-panel border border-border rounded-lg p-5"
              >
                <p className="font-mono text-xs text-neon-blue tracking-widest uppercase mb-4">Timeline</p>
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-2.5 top-0 bottom-0 w-px bg-border" />
                  <div className="flex flex-col gap-4 pl-8">
                    {company.updates.map((u, i) => (
                      <motion.div
                        key={u.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 + i * 0.05 }}
                        className="relative"
                      >
                        {/* Dot on timeline */}
                        <div className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-bg-3 border-2 border-neon-blue" />
                        <div className="flex items-start gap-2">
                          <span className="text-sm">{CATEGORY_ICONS[u.category] ?? '•'}</span>
                          <div>
                            <p className="text-sm text-slate-200 leading-snug">{u.title}</p>
                            {u.body && <p className="text-xs text-muted mt-1 leading-relaxed">{u.body}</p>}
                            <p className="font-mono text-xs text-muted mt-1">
                              {new Date(u.createdAt).toLocaleDateString('en-AU', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right column — metrics */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-col gap-4"
          >
            {[
              { label: 'Valuation',   value: company.valuationLabel ?? '—',  accent: 'text-neon-green' },
              { label: 'YoY Growth',  value: company.growthRate != null ? `${company.growthRate > 0 ? '+' : ''}${company.growthRate}%` : '—', accent: (company.growthRate ?? 0) >= 0 ? 'text-neon-green' : 'text-red-400' },
              { label: 'Employees',   value: company.employeeCount?.toLocaleString() ?? '—', accent: 'text-neon-blue' },
              { label: 'Company age', value: age,                              accent: 'text-neon-amber' },
              { label: 'Connections', value: String(company._count?.connections ?? 0), accent: 'text-neon-purple' },
            ].map(({ label, value, accent }) => (
              <div key={label} className="glass-panel border border-border rounded-lg p-4">
                <p className={`font-mono text-xl font-bold ${accent}`}>{value}</p>
                <p className="text-xs text-muted mt-1">{label}</p>
              </div>
            ))}

            {/* Map preview link */}
            <a
              href={`/?lat=${company.lat}&lng=${company.lng}&zoom=10`}
              className="glass-panel border border-border rounded-lg p-4 hover:border-neon-blue transition-colors group"
            >
              <p className="font-mono text-xs text-muted group-hover:text-neon-blue transition-colors uppercase tracking-widest mb-1">Location</p>
              <p className="text-sm text-slate-300">{company.city}, {company.country}</p>
              <p className="font-mono text-xs text-neon-blue mt-2">View on map →</p>
            </a>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="glass-panel border-t border-border mt-16 px-6 py-4 text-center">
        <p className="font-mono text-xs text-muted">
          NEXUS Intelligence Platform ·{' '}
          <a href="/" className="text-neon-blue hover:underline">Explore map →</a>
        </p>
      </footer>
    </div>
  );
}
