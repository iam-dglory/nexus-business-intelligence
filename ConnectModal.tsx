'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { api } from '../../lib/api';

const PURPOSES = [
  { id: 'sell',     label: 'Sell Products / Services',  icon: '📦', desc: 'Offer your products or services to this company' },
  { id: 'buy',      label: 'Buy / Source from them',    icon: '🛒', desc: 'Looking to purchase or source their offerings' },
  { id: 'partner',  label: 'Business Partnership',      icon: '🤝', desc: 'Explore joint ventures or strategic alliances' },
  { id: 'invest',   label: 'Investment Opportunity',    icon: '💰', desc: 'Interested in investing or funding' },
  { id: 'collab',   label: 'Research & Collaboration',  icon: '🔬', desc: 'Academic or R&D collaboration' },
  { id: 'consult',  label: 'Consulting / Advisory',     icon: '💡', desc: 'Offer consulting or advisory services' },
];

const ROLE_MAP: Record<string, string> = {
  sell: 'SELLER', buy: 'BUYER', partner: 'BUYER',
  invest: 'INVESTOR', collab: 'BUYER', consult: 'SELLER',
};

export function ConnectModal() {
  const open = useStore((s) => s.connectModalOpen);
  const setOpen = useStore((s) => s.setConnectModalOpen);
  const company = useStore((s) => s.selectedCompany);
  const token = useStore((s) => s.token);
  const user = useStore((s) => s.user);

  const [purpose, setPurpose] = useState('sell');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSend() {
    if (!company) return;
    if (!token) { setErrorMsg('Please log in to send connection requests.'); setStatus('error'); return; }
    setStatus('loading'); setErrorMsg('');
    try {
      const role = ROLE_MAP[purpose] ?? 'BUYER';
      const fullMessage = `[${PURPOSES.find(p => p.id === purpose)?.label}]\n\n${message}`.trim();
      await api.connections.send(company.id, role, fullMessage);
      setStatus('success');
      setTimeout(() => { setOpen(false); setStatus('idle'); setMessage(''); setPurpose('sell'); }, 2200);
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to send.'); setStatus('error');
    }
  }

  function handleClose() { setOpen(false); setStatus('idle'); setErrorMsg(''); }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(7,11,20,0.88)', backdropFilter: 'blur(6px)' }}
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-lg glass-panel rounded-xl overflow-hidden shadow-panel"
            style={{ border: '1px solid rgba(124,58,237,0.4)', maxHeight: '90vh', overflowY: 'auto' }}
          >
            {status === 'success' ? (
              <div className="text-center py-12 px-8">
                <div className="text-5xl mb-4">✓</div>
                <p className="font-display text-xl font-bold text-neon-green mb-2">Request Sent!</p>
                <p className="text-sm text-muted">Your connection request to <strong className="text-slate-200">{company?.name}</strong> has been delivered. They can view your profile and respond.</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="bg-bg-2 border-b border-border px-6 py-4 flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-lg font-extrabold text-slate-100">
                      Connect with <span className="text-neon-blue">{company?.name}</span>
                    </h3>
                    <p className="font-mono text-xs text-muted mt-1 tracking-wide">
                      {company?.industry} · {company?.city}, {company?.country}
                    </p>
                  </div>
                  <button onClick={handleClose} className="text-muted hover:text-slate-200 text-xl leading-none ml-4 mt-1">✕</button>
                </div>

                <div className="p-6 flex flex-col gap-5">

                  {/* Your profile preview */}
                  {user && (
                    <div className="bg-bg-3 border border-border rounded-lg p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-neon-purple/20 border border-neon-purple/40 flex items-center justify-center font-mono text-sm font-bold text-neon-purple flex-shrink-0">
                        {user.name.slice(0,2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-200">{user.name}</p>
                        <p className="text-xs text-muted font-mono truncate">{user.email}</p>
                      </div>
                      <span className="font-mono text-xs text-neon-green border border-neon-green/30 bg-neon-green/10 px-2 py-1 rounded">
                        YOUR PROFILE
                      </span>
                    </div>
                  )}

                  {/* Purpose selection */}
                  <div>
                    <p className="font-mono text-xs text-muted uppercase tracking-widest mb-3">What is your purpose?</p>
                    <div className="grid grid-cols-2 gap-2">
                      {PURPOSES.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setPurpose(p.id)}
                          className={`p-3 rounded-lg border text-left transition-all ${
                            purpose === p.id
                              ? 'border-neon-purple bg-neon-purple/15 text-slate-100'
                              : 'border-border text-muted hover:border-border-bright hover:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span style={{ fontSize: 14 }}>{p.icon}</span>
                            <span className="font-mono text-xs font-bold">{p.label}</span>
                          </div>
                          <p className="text-xs text-muted leading-tight">{p.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <p className="font-mono text-xs text-muted uppercase tracking-widest mb-2">Your message</p>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={
                        purpose === 'sell' ? 'Describe what you offer and why it would benefit this company...' :
                        purpose === 'buy' ? 'Describe what you are looking to source or purchase...' :
                        purpose === 'invest' ? 'Share your investment thesis and what you bring beyond capital...' :
                        purpose === 'partner' ? 'Describe the partnership opportunity and mutual benefits...' :
                        'Describe your proposal in detail...'
                      }
                      maxLength={600}
                      rows={4}
                      className="w-full bg-bg-3 border border-border rounded-lg text-xs font-mono text-slate-200 placeholder-muted p-3 resize-none focus:outline-none focus:border-neon-purple transition-colors"
                    />
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-muted">This is shared with {company?.name} along with your profile</p>
                      <p className="text-xs text-muted font-mono">{message.length}/600</p>
                    </div>
                  </div>

                  {/* What they'll see */}
                  <div className="bg-bg-3 border border-border rounded-lg p-3">
                    <p className="font-mono text-xs text-neon-blue uppercase tracking-widest mb-2">What {company?.name} will see</p>
                    <div className="flex flex-col gap-1">
                      {['Your name and email', 'Your connection purpose', 'Your message', 'Link to your NEXUS profile'].map(item => (
                        <div key={item} className="flex items-center gap-2">
                          <span className="text-neon-green text-xs">✓</span>
                          <span className="text-xs text-slate-300">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {errorMsg && (
                    <p className="text-xs text-red-400 font-mono">⚠ {errorMsg}</p>
                  )}

                  <div className="flex gap-3">
                    <button onClick={handleClose} className="px-5 py-2.5 border border-border rounded-lg font-mono text-xs text-muted hover:border-border-bright hover:text-slate-300 transition-all">
                      CANCEL
                    </button>
                    <button
                      onClick={handleSend}
                      disabled={status === 'loading' || !message.trim()}
                      className="flex-1 py-2.5 rounded-lg font-mono text-xs font-bold tracking-widest bg-neon-purple text-white hover:opacity-85 disabled:opacity-40 transition-all"
                    >
                      {status === 'loading' ? 'SENDING...' : `SEND TO ${company?.name?.toUpperCase().slice(0,20)} →`}
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
