// nexus/frontend/src/components/sidebar/Sidebar.tsx
'use client';
import { useStore } from '../../store/useStore';
import { useCompanies } from '../../hooks/useCompanies';
import type { BusinessType } from '../../types';

const INDUSTRIES = [
  'Technology', 'Finance', 'Healthcare', 'Energy',
  'Retail', 'Manufacturing', 'Logistics', 'Education',
  'Real Estate', 'Media', 'Agriculture', 'Aerospace',
];

const VALUATION_STEPS = ['Any', '$1M+', '$10M+', '$50M+', '$100M+', '$500M+', '$1B+', '$5B+'];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-xs tracking-widest text-neon-blue uppercase mb-2.5">
      {children}
    </p>
  );
}

function FilterChip({
  label,
  active,
  onClick,
  color = 'blue',
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  color?: 'blue' | 'amber' | 'green' | 'purple';
}) {
  const colors = {
    blue:   active ? 'border-neon-blue text-neon-blue bg-neon-blue/10' : '',
    amber:  active ? 'border-neon-amber text-neon-amber bg-neon-amber/10' : '',
    green:  active ? 'border-neon-green text-neon-green bg-neon-green/10' : '',
    purple: active ? 'border-neon-purple text-neon-purple bg-neon-purple/10' : '',
  };

  return (
    <button
      onClick={onClick}
      className={`
        inline-flex items-center gap-1 px-2 py-1 rounded border font-mono text-xs
        transition-all duration-150 m-0.5
        ${active ? colors[color] : 'border-border text-muted hover:border-border-bright hover:text-slate-300'}
      `}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-current' : 'bg-muted'}`} />
      {label}
    </button>
  );
}

export function Sidebar() {
  const filters = useStore((s) => s.filters);
  const setFilters = useStore((s) => s.setFilters);
  const resetFilters = useStore((s) => s.resetFilters);
  const { companies, total } = useCompanies();

  const toggleType = (t: BusinessType) => {
    setFilters({ type: filters.type === t ? '' : t });
  };

  const toggleIndustry = (ind: string) => {
    setFilters({ industry: filters.industry === ind ? '' : ind });
  };

  const typeColors: Record<BusinessType, 'blue' | 'amber' | 'green'> = {
    B2B: 'blue', B2C: 'amber', HYBRID: 'green',
  };

  return (
    <div className="p-3 flex flex-col gap-4 min-h-full">

      {/* Live stats */}
      <div className="flex flex-col gap-2">
        <div className="bg-bg-3 border border-border rounded p-2.5">
          <p className="font-mono text-lg font-bold text-neon-blue leading-none">
            {companies.length.toLocaleString()}
          </p>
          <p className="text-xs text-muted mt-1">Visible companies</p>
        </div>
        <div className="bg-bg-3 border border-border rounded p-2.5">
          <p className="font-mono text-lg font-bold text-neon-green leading-none">
            {total.toLocaleString()}
          </p>
          <p className="text-xs text-muted mt-1">Total indexed</p>
        </div>
      </div>

      <div className="h-px bg-border" />

      {/* Business Type */}
      <div>
        <SectionTitle>Business Type</SectionTitle>
        <div className="flex flex-wrap">
          {(['B2B', 'B2C', 'HYBRID'] as BusinessType[]).map((t) => (
            <FilterChip
              key={t}
              label={t}
              active={filters.type === t}
              onClick={() => toggleType(t)}
              color={typeColors[t]}
            />
          ))}
        </div>
      </div>

      <div className="h-px bg-border" />

      {/* Industry */}
      <div>
        <SectionTitle>Industry</SectionTitle>
        <div className="flex flex-wrap">
          {INDUSTRIES.map((ind) => (
            <FilterChip
              key={ind}
              label={ind}
              active={filters.industry === ind}
              onClick={() => toggleIndustry(ind)}
              color="purple"
            />
          ))}
        </div>
      </div>

      <div className="h-px bg-border" />

      {/* Company Age */}
      <div>
        <SectionTitle>Company Age</SectionTitle>
        <div className="flex items-center justify-between font-mono text-xs text-muted mb-1.5">
          <span>0 yrs</span>
          <span className="text-slate-300">{filters.maxAge ?? 50}+ yrs</span>
        </div>
        <input
          type="range" min={1} max={100}
          value={filters.maxAge ?? 50}
          onChange={(e) => setFilters({ maxAge: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      <div className="h-px bg-border" />

      {/* Valuation */}
      <div>
        <SectionTitle>Min Valuation</SectionTitle>
        <div className="flex flex-wrap gap-1">
          {VALUATION_STEPS.map((v, i) => (
            <FilterChip
              key={v}
              label={v}
              active={(filters.minValuation ?? 0) === i * 1_000_000}
              onClick={() => setFilters({ minValuation: i === 0 ? 0 : i * 1_000_000 })}
              color="amber"
            />
          ))}
        </div>
      </div>

      <div className="h-px bg-border" />

      {/* Radius */}
      <div>
        <SectionTitle>Search Radius</SectionTitle>
        <div className="flex items-center justify-between font-mono text-xs text-muted mb-1.5">
          <span>Global</span>
          <span className="text-slate-300">
            {filters.radius ? `${filters.radius} km` : 'Any'}
          </span>
        </div>
        <input
          type="range" min={0} max={500} step={25}
          value={filters.radius ?? 0}
          onChange={(e) => {
            const v = Number(e.target.value);
            setFilters({ radius: v === 0 ? undefined : v });
          }}
          className="w-full"
        />
        {filters.radius && (
          <p className="text-xs text-muted font-mono mt-1">
            Set map center to use radius filter
          </p>
        )}
      </div>

      {/* Reset */}
      <div className="mt-auto pt-2">
        <button
          onClick={resetFilters}
          className="w-full font-mono text-xs py-2 border border-border rounded text-muted hover:border-border-bright hover:text-slate-300 transition-all"
        >
          ↺ RESET FILTERS
        </button>
      </div>
    </div>
  );
}
