// nexus/frontend/src/app/auth/page.tsx
'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useStore } from '../../store/useStore';
import { api } from '../../lib/api';

type Mode = 'login' | 'register';

export default function AuthPage() {
  const router = useRouter();
  const setAuth = useStore((s) => s.setAuth);

  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const result =
        mode === 'login'
          ? await api.auth.login(email, password)
          : await api.auth.register(email, password, name);

      setAuth(result.user, result.token);
      router.push('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
      setStatus('error');
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-blue opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-neon-blue" />
            </span>
            <span className="font-mono text-2xl font-bold tracking-widest text-neon-blue">NEXUS</span>
          </div>
          <p className="text-xs text-muted font-mono tracking-wider">BUSINESS INTELLIGENCE PLATFORM</p>
        </div>

        <div className="glass-panel border border-border rounded-lg overflow-hidden shadow-panel">
          {/* Mode tabs */}
          <div className="flex border-b border-border">
            {(['login', 'register'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setErrorMsg(''); setStatus('idle'); }}
                className={`flex-1 py-3 font-mono text-xs tracking-widest uppercase transition-all ${
                  mode === m
                    ? 'text-neon-blue border-b-2 border-neon-blue bg-neon-blue/5'
                    : 'text-muted hover:text-slate-300'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
            <AnimatePresence mode="wait">
              {mode === 'register' && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block font-mono text-xs text-muted uppercase tracking-widest mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={mode === 'register'}
                    placeholder="Jane Smith"
                    className="w-full bg-bg-3 border border-border rounded px-3 py-2.5 font-mono text-sm text-slate-200 placeholder-muted focus:outline-none focus:border-neon-blue transition-colors"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block font-mono text-xs text-muted uppercase tracking-widest mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@company.com"
                className="w-full bg-bg-3 border border-border rounded px-3 py-2.5 font-mono text-sm text-slate-200 placeholder-muted focus:outline-none focus:border-neon-blue transition-colors"
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-muted uppercase tracking-widest mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="••••••••"
                className="w-full bg-bg-3 border border-border rounded px-3 py-2.5 font-mono text-sm text-slate-200 placeholder-muted focus:outline-none focus:border-neon-blue transition-colors"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-red-400 font-mono">⚠ {errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-3 rounded font-mono text-xs font-bold tracking-widest uppercase
                bg-gradient-to-r from-neon-blue/80 to-neon-purple text-white
                hover:opacity-90 disabled:opacity-50 transition-all mt-1"
            >
              {status === 'loading'
                ? 'AUTHENTICATING...'
                : mode === 'login'
                ? 'ENTER NEXUS →'
                : 'CREATE ACCOUNT →'}
            </button>
          </form>

          <div className="px-6 pb-5 text-center">
            <p className="text-xs text-muted font-mono">
              Demo account:{' '}
              <button
                onClick={() => {
                  setEmail('demo@nexus.dev');
                  setPassword('demo123');
                  setMode('login');
                }}
                className="text-neon-blue hover:underline"
              >
                demo@nexus.dev / demo123
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted font-mono mt-6">
          <a href="/" className="hover:text-neon-blue transition-colors">
            ← Continue without account
          </a>
        </p>
      </motion.div>
    </div>
  );
}
