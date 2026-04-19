// nexus/frontend/src/components/ui/CompareBar.tsx
'use client';
import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { useCompany } from '../../hooks/useCompanies';

function CompareSlot({ id }: { id: string }) {
  const { company } = useCompany(id);
  const toggleCompare = useStore((s) => s.toggleCompare);

  if (!company) return (
    <div className="w-40 h-16 border border-dashed border-border rounded flex items-center justify-center">
      <span className="font-mono text-xs text-muted">Loading...</span>
    </div>
  );

  return (
    <div className="relative w-40 bg-bg-3 border border-border rounded p-2.5 group">
      <button
        onClick={() => toggleCompare(id)}
        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-bg-2 border border-border text-muted hover:text-red-400 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        ✕
      </button>
      <p className="text-xs font-semibold text-slate-200 truncate">{company.name}</p>
      <p className="font-mono text-xs text-muted truncate mt-0.5">{company.industry}</p>
      <div className="flex gap-2 mt-1.5">
        <span className="font-mono text-xs text-neon-green">{company.valuationLabel ?? '—'}</span>
        {company.growthRate != null && (
          <span className="font-mono text-xs text-neon-blue">
            {company.growthRate > 0 ? '+' : ''}{company.growthRate}%
          </span>
        )}
      </div>
    </div>
  );
}

export function CompareBar() {
  const compareIds = useStore((s) => s.compareIds);
  const clearCompare = useStore((s) => s.clearCompare);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-5 right-4 glass-panel border border-border rounded-lg p-3 z-10"
    >
      <div className="flex items-center justify-between mb-2">
        <p className="font-mono text-xs text-neon-blue tracking-widest">COMPARE ({compareIds.length}/3)</p>
        <button
          onClick={clearCompare}
          className="font-mono text-xs text-muted hover:text-red-400 transition-colors"
        >
          CLEAR
        </button>
      </div>
      <div className="flex gap-2">
        {compareIds.map((id) => <CompareSlot key={id} id={id} />)}
        {compareIds.length < 3 && (
          <div className="w-40 h-16 border border-dashed border-border rounded flex items-center justify-center">
            <span className="font-mono text-xs text-muted">+ Add company</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
