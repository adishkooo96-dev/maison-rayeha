import React from 'react';
import { X } from 'lucide-react';

export interface ChipProps {
  label: string;
  onRemove?: () => void;
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({ label, onRemove, className = '' }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-ivory-subtle text-near-black text-xs font-light border border-border/80 rounded-xs select-none transition-colors ${className}`}
    >
      <span>{label}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove filter ${label}`}
          className="text-muted hover:text-near-black transition-colors p-0.5 rounded-full hover:bg-border/60 cursor-pointer"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
};
