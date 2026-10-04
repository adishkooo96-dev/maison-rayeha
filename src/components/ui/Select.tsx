import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  containerClassName?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  className = '',
  containerClassName = '',
  id,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`relative inline-block ${containerClassName}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs uppercase tracking-wider text-muted font-medium mb-1.5"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={onChange}
          className={`appearance-none w-full min-h-[44px] bg-ivory-surface text-near-black text-base sm:text-sm border border-border ps-3.5 pe-9 py-2.5 rounded-xs transition-all duration-200 hover:border-gold/60 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/30 shadow-2xs cursor-pointer ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-ivory-surface text-near-black">
              {opt.label}
            </option>
          ))}
        </select>

        <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center pe-3 text-muted">
          <ChevronDown className="w-4 h-4 stroke-[1.5]" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
};
