// nexus/frontend/src/components/ui/Toast.tsx
'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

let addToast: ((msg: Omit<ToastMessage, 'id'>) => void) | null = null;

export function toast(message: string, type: ToastMessage['type'] = 'success') {
  addToast?.({ message, type });
}

const TYPE_STYLES: Record<ToastMessage['type'], string> = {
  success: 'bg-neon-green  text-bg border-neon-green',
  error:   'bg-red-500     text-white border-red-500',
  info:    'bg-neon-blue   text-bg border-neon-blue',
};

const TYPE_ICONS: Record<ToastMessage['type'], string> = {
  success: '✓',
  error:   '✕',
  info:    'ℹ',
};

export function ToastProvider() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    addToast = (msg) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { ...msg, id }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    };
    return () => { addToast = null; };
  }, []);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 items-center pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{   opacity: 0, y: 20,  scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded font-mono text-xs font-bold tracking-widest shadow-panel ${TYPE_STYLES[t.type]}`}
          >
            <span>{TYPE_ICONS[t.type]}</span>
            <span>{t.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
