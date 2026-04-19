// nexus/frontend/src/app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6">
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative z-10 text-center">
        <p className="font-mono text-8xl font-bold text-neon-blue/20 mb-2 select-none">404</p>
        <h1 className="font-display text-2xl font-extrabold text-slate-100 mb-2">
          Signal Lost
        </h1>
        <p className="text-sm text-muted font-mono mb-8">
          This node does not exist in the network.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded border border-neon-blue text-neon-blue font-mono text-xs tracking-widest hover:bg-neon-blue/10 transition-colors"
        >
          ← RETURN TO MAP
        </Link>
      </div>
    </div>
  );
}
