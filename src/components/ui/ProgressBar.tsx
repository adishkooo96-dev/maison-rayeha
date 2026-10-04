import React from 'react';

export interface ProgressBarProps {
  value: number; // 0 to 100
  label?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  className = '',
}) => {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between items-center text-xs mb-1.5 text-muted">
          <span>{label}</span>
          <span className="font-mono text-[11px] font-medium text-near-black">{clamped}%</span>
        </div>
      )}
      <div
        className="h-1.5 w-full bg-border rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress'}
      >
        <div
          className="h-full bg-gold transition-all duration-300 ease-out rounded-full"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
