import React from 'react';

export const SuspenseFallback: React.FC = () => {
  const isRtl = typeof document !== 'undefined' && document.documentElement.dir === 'rtl';

  return (
    <div
      className="min-h-[60vh] flex flex-col items-center justify-center p-8 pt-32 pb-20 bg-ivory text-near-black"
      role="status"
      aria-live="polite"
    >
      <div className="relative flex items-center justify-center mb-6">
        {/* Subtle pulsating gold ring */}
        <div className="w-16 h-16 rounded-full border border-gold/40 animate-ping opacity-25" />
        <div className="w-12 h-12 rounded-full border border-gold/60 flex items-center justify-center text-gold absolute">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-6 h-6 text-gold animate-pulse"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M10 2h4v3h-4z" />
            <path d="M7 8h10l2 4v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-8l2-4z" />
            <circle cx="12" cy="15" r="1.5" fill="currentColor" />
          </svg>
        </div>
      </div>

      <div className="text-center space-y-1">
        <p className="text-xs uppercase font-mono tracking-widest text-gold font-medium">
          Maison Rayeha
        </p>
        <p className="text-xs text-muted font-light">
          {isRtl ? 'در حال تقطیر شاهکارهای بویایی...' : 'Distilling sensory essences...'}
        </p>
      </div>
    </div>
  );
};
