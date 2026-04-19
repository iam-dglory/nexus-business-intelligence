// nexus/frontend/src/components/panels/ConnectModal.tsx
'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { api } from '../../lib/api';
import type { ConnectionRole } from '../../types';

const ROLES: ConnectionRole[] = ['BUYER', 'SELLER', 'INVESTOR'];
const ROLE_DESC: Record<ConnectionRole, string> = {
  BUYER: 'Looking to purchase products or services',
  SELLER: 'Offering products or services',
  INVESTOR: 'Seeking investment opportunities',
};

export function ConnectModal() {
  const open = useStore((s) => s.connectModalOpen);
  const setOpen = useStore((s) => s.setConnectModalOpen);
  const company = useStore((s) => s.selectedCompany);
  const token = useStore((s) => s.token);

  const [role, setRole] = useState<ConnectionRole>('BUYER');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSend() {
    if (!company) return;
    if (!token) {
      setErrorMsg('Please log in to send connection requests.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      await api.connections.send(company.id, role, message || undefined);
      setStatus('success');
      setTimeout(() => {
        setOpen(false);
        setStatus('idle');
        setMessage('');
      }, 1800);
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to send request.');
      setStatus('error');
    }
  }

  function handleClose() {
    setOpen(false);
    setStatus('idle');
    setErrorMsg('');
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-bg/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-sm glass-panel border border-neon-purple/50 rounded-lg p-6 shadow-neon-purple"
          >
            {status === 'success' ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-3">✓</div>
                <p className="font-display text-lg font-bold text-neon-green">Request Sent!</p>
                <p className="text-sm text-muted mt-1">
                  Your connection request to <strong className="text-slate-300">{company?.name}</strong> has been delivered.
                </p>
              </div>
            ) : (
              <>
                <h3 className="font-display text-base font-extrabold text-slate-100 mb-0.5">
                  Connect with{' '}
                  <span className="text-neon-blue">{company?.name}</span>
                </h3>
                <p className="font-mono text-xs text-muted mb-4 tracking-wide">SEND CONNECTION REQUEST</p>

                {/* Role selection */}
                <p className="font-mono text-xs text-muted uppercase tracking-widest mb-2">
                  Your Role
                </p>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {ROLES.map((r) => (
                    <button
                      key={r}
                      onClick={() => setRole(r)}
                      className={`py-2 rounded border font-mono text-xs transition-all ${
                        role === r
                          ? 'border-neon-purple text-neon-purple bg-neon-purple/15'
                          : 'border-border text-muted hover:border-border-bright hover:text-slate-300'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted mb-4 -mt-2">{ROLE_DESC[role]}</p>

                {/* Message */}
                <p className="font-mono text-xs text-muted uppercase tracking-widest mb-2">
                  Message (optional)
                </p>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Introduce yourself or describe your interest..."
                  maxLength={500}
                  rows={3}
                  className="w-full bg-bg-3 border border-border rounded text-xs font-mono text-slate-200 placeholder-muted p-2.5 resize-none focus:outline-none focus:border-neon-purple transition-colors mb-1"
                />
                <p className="text-xs text-muted text-right mb-4">{message.length}/500</p>

                {errorMsg && (
                  <p className="text-xs text-red-400 font-mono mb-3">⚠ {errorMsg}</p>
                )}

                {/* Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 border border-border rounded font-mono text-xs text-muted hover:border-border-bright hover:text-slate-300 transition-all"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={status === 'loading'}
                    className="flex-1 py-2 rounded font-mono text-xs font-bold tracking-widest
                      bg-neon-purple text-white hover:opacity-85 disabled:opacity-50 transition-all"
                  >
                    {status === 'loading' ? 'SENDING...' : 'SEND REQUEST →'}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
