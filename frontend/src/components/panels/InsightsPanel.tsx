// nexus/frontend/src/components/panels/InsightsPanel.tsx
'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useSWR from 'swr';

interface InsightResult {
  summary: string;
  strengths: string[];
  signals: string[];
  investmentScore: number;
  matchTags: string[];
  generatedAt: string;
  source: 'ai' | 'static';
}

function ScoreRing({ score }: { score: number }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 70 ? '#10b981' : score >= 45 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative w-14 h-14 flex-shrink-0">
      <svg width="56" height="56" className="-rotate-90">
        <circle cx="28" cy="28" r={r} fill="none" stroke="#1e2d3d" strokeWidth="3" />
        <circle
          cx="28" cy="28" r={r} fill="none"
          stroke={color} strokeWidth="3"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-mono text-xs font-bold" style={{ color }}>{score}</span>
      </div>
    </div>
  );
}

export function InsightsPanel({ companyId, companyName }: { companyId: string; companyName: string }) {
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useSWR<InsightResult>(
    open ? `insights:${companyId}` : null,
    () =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/insights/${companyId}`)
        .then((r) => r.json()),
    { revalidateOnFocus: false }
  );

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full py-2 rounded border font-mono text-xs tracking-widest transition-all ${
          open
            ? 'border-neon-purple text-neon-purple bg-neon-purple/10'
            : 'border-border text-muted hover:border-neon-purple hover:text-neon-purple'
        }`}
      >
        {open ? '▲ HIDE INSIGHTS' : '✦ AI INSIGHTS'}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-3 bg-bg-3 border border-neon-purple/20 rounded-lg p-3 flex flex-col gap-3">
              {isLoading ? (
                <div className="text-center py-4">
                  <p className="font-mono text-xs text-neon-purple animate-pulse">◈ ANALYSING {companyName.toUpperCase()}...</p>
                </div>
              ) : data ? (
                <>
                  {/* Score */}
                  <div className="flex items-center gap-3">
                    <ScoreRing score={data.investmentScore} />
                    <div>
                      <p className="font-mono text-xs text-muted uppercase tracking-widest">Investment Score</p>
                      <p className="text-xs text-slate-300 mt-0.5">
                        {data.investmentScore >= 70 ? 'Strong opportunity' : data.investmentScore >= 45 ? 'Moderate potential' : 'Higher risk profile'}
                      </p>
                    </div>
                    {data.source === 'ai' && (
                      <span className="ml-auto text-xs text-neon-purple font-mono border border-neon-purple/30 rounded px-1.5 py-0.5">AI</span>
                    )}
                  </div>

                  {/* Summary */}
                  <p className="text-xs text-slate-300 leading-relaxed border-t border-border pt-3">{data.summary}</p>

                  {/* Strengths */}
                  {data.strengths.length > 0 && (
                    <div>
                      <p className="font-mono text-xs text-neon-green uppercase tracking-widest mb-1.5">Strengths</p>
                      {data.strengths.map((s, i) => (
                        <div key={i} className="flex items-start gap-1.5 mb-1">
                          <span className="text-neon-green text-xs mt-0.5">✓</span>
                          <span className="text-xs text-slate-300">{s}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Signals */}
                  {data.signals.length > 0 && (
                    <div>
                      <p className="font-mono text-xs text-neon-amber uppercase tracking-widest mb-1.5">Signals</p>
                      {data.signals.map((s, i) => (
                        <p key={i} className="text-xs text-slate-300 mb-1">{s}</p>
                      ))}
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {data.matchTags.map((t) => (
                      <span key={t} className="px-1.5 py-0.5 rounded bg-neon-purple/10 border border-neon-purple/30 font-mono text-xs text-neon-purple">
                        {t}
                      </span>
                    ))}
                  </div>

                  <p className="font-mono text-xs text-muted text-right">
                    {new Date(data.generatedAt).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </>
              ) : (
                <p className="text-xs text-red-400 font-mono text-center py-2">Failed to load insights</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
