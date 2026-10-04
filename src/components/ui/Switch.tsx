import React from 'react';

export interface SwitchProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  id,
  checked,
  onChange,
  label,
  description,
  disabled = false,
  className = '',
}) => {
  const switchId = id || `switch-${label.toLowerCase().replace(/\s+/g, '-')}`;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onChange(!checked);
    }
  };

  return (
    <div className={`flex items-center justify-between gap-3 min-h-[44px] py-1.5 cursor-pointer select-none ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className}`}>
      <label
        htmlFor={switchId}
        className="flex-1 cursor-pointer text-start text-xs sm:text-sm font-medium text-near-black hover:text-gold transition-colors"
      >
        <span>{label}</span>
        {description && (
          <span className="block text-[11px] font-light text-muted mt-0.5">{description}</span>
        )}
      </label>

      <button
        type="button"
        id={switchId}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        onKeyDown={handleKeyDown}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-1 focus-visible:ring-gold ${
          checked ? 'bg-gold' : 'bg-border'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-ivory shadow-sm transition-transform duration-200 ease-in-out transform ${
            checked
              ? 'translate-x-5 rtl:-translate-x-5'
              : 'translate-x-0.5 rtl:-translate-x-0.5'
          }`}
          aria-hidden="true"
        />
      </button>
    </div>
  );
};
