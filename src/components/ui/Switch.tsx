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

  const handleToggle = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (disabled) return;
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onChange(!checked);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={checked}
      onClick={handleToggle}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          handleToggle(e);
        }
      }}
      className={`flex items-center justify-between gap-3 min-h-[44px] py-1.5 px-1 rounded-sm cursor-pointer select-none transition-colors group ${
        disabled ? 'opacity-50 pointer-events-none' : 'hover:bg-black/5 dark:hover:bg-white/5'
      } ${className}`}
    >
      <div className="flex-1 text-start text-xs sm:text-sm font-medium text-near-black group-hover:text-gold transition-colors">
        <span>{label}</span>
        {description && (
          <span className="block text-[11px] font-light text-muted mt-0.5">{description}</span>
        )}
      </div>

      <button
        type="button"
        id={switchId}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        tabIndex={-1}
        onClick={(e) => {
          e.stopPropagation();
          handleToggle();
        }}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
          checked ? 'bg-gold' : 'bg-stone-300 dark:bg-stone-700'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transition-all duration-200 ease-in-out transform ${
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
