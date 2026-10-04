import React from 'react';
import { Check } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';

export interface CheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: React.ReactNode;
  count?: number;
  disabled?: boolean;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  checked,
  onChange,
  label,
  count,
  disabled = false,
  className = '',
}) => {
  const { formatNumber } = useI18n();

  return (
    <label
      htmlFor={id}
      className={`inline-flex items-center gap-2.5 min-h-[40px] text-xs sm:text-sm text-near-black cursor-pointer select-none py-1 group ${
        disabled ? 'opacity-40 cursor-not-allowed' : ''
      } ${className}`}
    >
      <div className="relative flex items-center justify-center">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <div
          className={`w-4 h-4 rounded-xs border transition-colors flex items-center justify-center ${
            checked
              ? 'bg-near-black border-near-black text-ivory'
              : 'bg-ivory border-border group-hover:border-gold'
          }`}
        >
          {checked && <Check className="w-3 h-3 stroke-[2.5]" aria-hidden="true" />}
        </div>
      </div>

      <span className="flex-1 font-light text-near-black group-hover:text-gold transition-colors">
        {label}
      </span>

      {count !== undefined && (
        <span className="text-[11px] text-muted font-mono bg-ivory-subtle px-1.5 py-0.5 rounded-xs">
          {formatNumber(count, { useGrouping: false })}
        </span>
      )}
    </label>
  );
};
