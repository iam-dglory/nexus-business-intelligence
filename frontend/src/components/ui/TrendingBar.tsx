// nexus/frontend/src/components/ui/TrendingBar.tsx
'use client';
import { motion } from 'framer-motion';
import { useTrending } from '../../hooks/useCompanies';
import { useStore } from '../../store/useStore';

export function TrendingBar() {
  const { trending } = useTrending();
  const setSelectedCompany = useStore((s) => s.setSelectedCompany);

  if (!trending.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="absolute bottom-5 left-4 glass-panel border border-border rounded-lg p-3 z-10 w-64"
    >
      <p className="font-mono text-xs text-neon-amber tracking-widest mb-2.5">
        ◈ TRENDING NOW
      </p>
      <div className="flex flex-col">
        {trending.slice(0, 5).map((company, i) => (
          <button
            key={company.id}
            onClick={() => setSelectedCompany(company)}
            className="flex items-center gap-2.5 py-1.5 px-1 rounded hover:bg-bg-4 transition-all text-left"
          >
            <span className="font-mono text-xs text-muted w-4 flex-shrink-0">{i + 1}</span>
            <span className="flex-1 min-w-0">
              <span className="text-xs font-semibold text-slate-200 truncate block">{company.name}</span>
            </span>
            <span className="font-mono text-xs text-neon-green flex-shrink-0">
              {company.growthRate != null ? `+${Math.round(company.growthRate)}%` : '↑'}
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
