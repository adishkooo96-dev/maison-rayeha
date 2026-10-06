import React from 'react';

export interface RadioCardProps {
  id: string;
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  title: string;
  description?: string;
  badge?: string;
  price?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export const RadioCard: React.FC<RadioCardProps> = ({
  id,
  name,
  value,
  checked,
  onChange,
  title,
  description,
  badge,
  price,
  icon,
  disabled = false,
  className = '',
}) => {
  return (
    <label
      htmlFor={id}
      className={`relative flex items-start gap-3.5 p-4 rounded-xs border transition-all cursor-pointer select-none text-start focus-within:ring-2 focus-within:ring-gold focus-within:ring-offset-2 focus-within:ring-offset-[var(--bg-page)] ${
        checked
          ? 'border-gold bg-gold/10 shadow-xs ring-1 ring-gold/40'
          : 'border-[var(--border)] bg-[var(--bg-surface)] hover:border-gold/60 hover:shadow-2xs'
      } ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}
    >
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange(value)}
        className="mt-0.5 w-4 h-4 text-gold border-[var(--border)] focus:ring-gold accent-gold shrink-0 cursor-pointer"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {icon && <span className="text-gold shrink-0">{icon}</span>}
            <span className="text-sm font-medium text-[var(--text-primary)]">{title}</span>
            {badge && (
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-gold/20 text-gold rounded-xs">
                {badge}
              </span>
            )}
          </div>
          {price && (
            <span className="text-xs sm:text-sm font-medium text-[var(--text-primary)] font-mono shrink-0">
              {price}
            </span>
          )}
        </div>

        {description && (
          <p className="text-xs text-[var(--text-secondary)] font-light mt-1 leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </label>
  );
};
