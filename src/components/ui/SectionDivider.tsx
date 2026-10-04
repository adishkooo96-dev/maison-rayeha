import React from 'react';

export interface SectionDividerProps {
  className?: string;
}

export const SectionDivider: React.FC<SectionDividerProps> = ({ className = '' }) => {
  return (
    <div
      className={`w-full max-w-5xl mx-auto px-6 py-8 sm:py-12 flex items-center justify-center gap-4 ${className}`}
      aria-hidden="true"
    >
      {/* Left gold decorative line */}
      <div className="flex-1 h-[1.5px] bg-gradient-to-r from-transparent via-gold/60 to-gold" />

      {/* Center luxury ornament / diamond */}
      <div className="relative flex items-center justify-center shrink-0">
        <div className="w-4 h-4 rotate-45 border-[2px] border-gold bg-ivory shadow-[0_0_10px_rgba(184,155,94,0.35)] flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-gold-dark rotate-45" />
        </div>
      </div>

      {/* Right gold decorative line */}
      <div className="flex-1 h-[1.5px] bg-gradient-to-l from-transparent via-gold/60 to-gold" />
    </div>
  );
};
