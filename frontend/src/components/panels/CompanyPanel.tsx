// nexus/frontend/src/components/panels/CompanyPanel.tsx
'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { api } from '../../lib/api';
import { InsightsPanel } from './InsightsPanel';
import type { Company } from '../../types';

const TYPE_COLORS: Record<string, string> = {
  B2B: 'border-neon-blue text-neon-blue bg-neon-blue/10',
  B2C: 'border-neon-amber text-neon-amber bg-neon-amber/10',
  HYBRID: 'border-neon-green text-neon-green bg-neon-green/10',
};

const CATEGORY_COLORS: Record<string, string> = {
  funding:   'text-neon-green',
  product:   'text-neon-blue',
  news:      'text-slate-400',
  milestone: 'text-neon-amber',
};

function Metric({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="bg-bg-3 border border-border rounded p-2.5">
      <p className={`font-mono text-sm font-bold ${accent ?? 'text-neon-amber'}`}>{value}</p>
      <p className="text-xs text-muted mt-0.5">{label}</p>
    </div>
  );
}

function formatAge(year: number): string {
  return String(new Date().getFullYear() - year);
}

function formatTimeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const d = Math.floor(diff / 86_400_000);
  if (d === 0) return 'today';
  if (d === 1) return '1 day ago';
  if (d < 30) return `${d} days ago`;
  const m = Math.floor(d / 30);
  return `${m} month${m > 1 ? 's' : ''} ago`;
}

export function CompanyPanel() {
  const company = useStore((s) => s.selectedCompany);
  const setSelectedCompany = useStore((s) => s.setSelectedCompany);
  const setConnectModalOpen = useStore((s) => s.setConnectModalOpen);
  const bookmarkedIds = useStore((s) => s.bookmarkedIds);
  const toggleBookmark = useStore((s) => s.toggleBookmark);
  const toggleCompare = useStore((s) => s.toggleCompare);
  const compareIds = useStore((s) => s.compareIds);
  const token = useStore((s) => s.token);

  const isBookmarked = company ? bookmarkedIds.has(company.id) : false;
  const isInCompare = company ? compareIds.includes(company.id) : false;

  async function handleBookmark() {
    if (!company || !token) return;
    toggleBookmark(company.id);
    if (isBookmarked) {
      await api.bookmarks.remove(company.id).catch(() => null);
    } else {
      await api.bookmarks.add(company.id).catch(() => null);
    }
  }

  return (
    <AnimatePresence>
      {company && (
        <motion.aside
          key="company-panel"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full h-full glass-panel overflow-y-auto flex flex-col"
        >
          {/* Header */}
          <div className="sticky top-0 bg-bg-2 border-b border-border p-4 z-10">
            <button
              onClick={() => setSelectedCompany(null)}
              className="absolute top-3 right-3 text-muted hover:text-slate-200 transition-colors text-lg leading-none w-7 h-7 flex items-center justify-center rounded hover:bg-bg-3"
            >
              ✕
            </button>
            <h2 className="font-display text-lg font-extrabold text-slate-100 pr-8 leading-tight">
              {company.name}
            </h2>
            <p className="font-mono text-xs text-neon-blue mt-0.5 tracking-wide">
              {company.industry} · {company.city}, {company.country}
            </p>
          </div>

          {/* Body */}
          <div className="p-4 flex flex-col gap-4 flex-1">

            {/* Type + location */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2 py-0.5 rounded border font-mono text-xs ${TYPE_COLORS[company.businessType]}`}>
                {company.businessType}
              </span>
              {company.isFeatured && (
                <span className="px-2 py-0.5 rounded border border-neon-amber text-neon-amber bg-neon-amber/10 font-mono text-xs">
                  ★ FEATURED
                </span>
              )}
            </div>

            {/* Metrics grid */}
            <div className="grid grid-cols-2 gap-2">
              <Metric label="Years active" value={formatAge(company.foundedYear)} accent="text-neon-amber" />
              <Metric label="Employees" value={company.employeeCount?.toLocaleString() ?? '—'} accent="text-neon-blue" />
              <Metric label="Valuation" value={company.valuationLabel ?? '—'} accent="text-neon-green" />
              <Metric
                label="YoY Growth"
                value={company.growthRate != null ? `${company.growthRate > 0 ? '+' : ''}${company.growthRate}%` : '—'}
                accent={company.growthRate != null && company.growthRate > 0 ? 'text-neon-green' : 'text-red-400'}
              />
            </div>

            {/* Description */}
            {company.description && (
              <p className="text-xs text-muted leading-relaxed">
                {company.description.slice(0, 160)}
                {company.description.length > 160 && '…'}
              </p>
            )}

            {/* Tags */}
            {company.tags && company.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {company.tags.map(({ tag }) => (
                  <span
                    key={tag}
                    className="px-1.5 py-0.5 rounded bg-bg-4 border border-border font-mono text-xs text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Updates */}
            {company.updates && company.updates.length > 0 && (
              <div>
                <p className="font-mono text-xs text-neon-blue tracking-widest uppercase mb-2">
                  Recent Updates
                </p>
                <div className="flex flex-col">
                  {company.updates.map((u) => (
                    <div key={u.id} className="flex gap-2.5 py-2 border-b border-border last:border-0">
                      <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                        CATEGORY_COLORS[u.category] ?? 'text-slate-400'
                      } bg-current`} />
                      <div>
                        <p className="text-xs text-slate-300 leading-relaxed">{u.title}</p>
                        <p className="font-mono text-xs text-muted mt-0.5">
                          {formatTimeAgo(u.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Connection count */}
            {company._count && (
              <p className="font-mono text-xs text-muted">
                <span className="text-neon-purple">{company._count.connections}</span> connection requests
              </p>
            )}

            {/* AI Insights */}
            <InsightsPanel companyId={company.id} companyName={company.name} />

            {/* Actions */}
            <div className="flex flex-col gap-2 mt-auto pt-2">
              <button
                onClick={() => setConnectModalOpen(true)}
                className="w-full py-2.5 rounded font-mono text-xs tracking-widest font-bold
                  bg-gradient-to-r from-neon-purple to-indigo-600 text-white
                  hover:opacity-85 transition-opacity"
              >
                ↗ REQUEST CONNECTION
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleBookmark}
                  className={`py-2 rounded border font-mono text-xs transition-all ${
                    isBookmarked
                      ? 'border-neon-amber text-neon-amber bg-neon-amber/10'
                      : 'border-border text-muted hover:border-border-bright hover:text-slate-300'
                  }`}
                >
                  {isBookmarked ? '★ SAVED' : '☆ SAVE'}
                </button>
                <button
                  onClick={() => toggleCompare(company.id)}
                  className={`py-2 rounded border font-mono text-xs transition-all ${
                    isInCompare
                      ? 'border-neon-blue text-neon-blue bg-neon-blue/10'
                      : 'border-border text-muted hover:border-border-bright hover:text-slate-300'
                  }`}
                >
                  {isInCompare ? '⊖ REMOVE' : '⊕ COMPARE'}
                </button>
              </div>

              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 rounded border border-border text-muted hover:border-border-bright hover:text-slate-300 font-mono text-xs text-center transition-all"
                >
                  ↗ VISIT WEBSITE
                </a>
              )}
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
