import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Undo2, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';

export interface ToastOptions {
  id?: string;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  showToast: (options: ToastOptions) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastOptions[]>([]);
  const { isRTL } = useI18n();

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (options: ToastOptions) => {
      const id = options.id || Math.random().toString(36).substring(2, 9);
      const newToast: ToastOptions = {
        ...options,
        id,
        duration: options.duration || 5000,
      };

      setToasts((prev) => [...prev.filter((t) => t.id !== id), newToast]);

      if (newToast.duration && newToast.duration > 0) {
        setTimeout(() => {
          hideToast(id);
        }, newToast.duration);
      }
    },
    [hideToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {/* Toast Notification Container (Live Region for screen readers) */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-5 inset-x-4 sm:inset-x-auto sm:end-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none"
      >
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              role="alert"
              className="pointer-events-auto bg-near-black text-ivory border border-gold/30 shadow-xl px-4 py-3 rounded-xs flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                {toast.type === 'success' && (
                  <CheckCircle2 className="w-4 h-4 text-gold shrink-0" aria-hidden="true" />
                )}
                {toast.type === 'error' && (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" aria-hidden="true" />
                )}
                {toast.type !== 'success' && toast.type !== 'error' && (
                  <Info className="w-4 h-4 text-gold shrink-0" aria-hidden="true" />
                )}
                <span className="truncate leading-normal">{toast.message}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {toast.action && (
                  <button
                    type="button"
                    onClick={() => {
                      toast.action?.onClick();
                      if (toast.id) hideToast(toast.id);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-gold hover:text-gold-light hover:bg-gold/10 transition-colors rounded-xs border border-gold/40 cursor-pointer"
                  >
                    <Undo2 className="w-3 h-3" />
                    <span>{toast.action.label}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => toast.id && hideToast(toast.id)}
                  aria-label="Close notification"
                  className="p-1 text-muted hover:text-ivory transition-colors rounded-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
