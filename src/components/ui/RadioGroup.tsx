import React from 'react';

export interface RadioOption<T extends string | number> {
  value: T;
  label: string;
  sublabel?: string;
  badge?: string;
  disabled?: boolean;
}

export interface RadioGroupProps<T extends string | number> {
  name: string;
  options: RadioOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  layout?: 'row' | 'column';
  disabled?: boolean;
}

export function RadioGroup<T extends string | number>({
  name,
  options,
  value,
  onChange,
  className = '',
  layout = 'row',
  disabled = false,
}: RadioGroupProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={name}
      aria-disabled={disabled}
      className={`flex ${layout === 'row' ? 'flex-wrap gap-2.5' : 'flex-col gap-2'} ${className}`}
    >
      {options.map((option) => {
        const isSelected = value === option.value;
        const isOptionDisabled = disabled || option.disabled;
        const id = `${name}-${option.value}`;

        return (
          <label
            key={String(option.value)}
            htmlFor={id}
            className={`relative flex items-center justify-center min-w-[70px] min-h-[44px] px-4 py-2.5 border text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer select-none rounded-xs ${
              isOptionDisabled
                ? 'opacity-40 cursor-not-allowed border-border bg-ivory-subtle pointer-events-none'
                : isSelected
                ? 'bg-near-black text-ivory border-near-black shadow-xs'
                : 'bg-ivory text-near-black border-border hover:border-gold/80 hover:text-gold'
            }`}
          >
            <input
              type="radio"
              id={id}
              name={name}
              value={String(option.value)}
              checked={isSelected}
              disabled={isOptionDisabled}
              onChange={() => !isOptionDisabled && onChange(option.value)}
              className="sr-only"
            />
            <div className="flex flex-col items-center">
              <span>{option.label}</span>
              {option.sublabel && (
                <span
                  className={`text-[10px] font-mono mt-0.5 ${
                    isSelected ? 'text-ivory/70' : 'text-muted'
                  }`}
                >
                  {option.sublabel}
                </span>
              )}
            </div>
            {option.badge && (
              <span className="absolute -top-2 -end-2 text-[9px] bg-gold text-near-black px-1.5 py-0.2 rounded-xs font-mono font-semibold uppercase tracking-wider">
                {option.badge}
              </span>
            )}
          </label>
        );
      })}
    </div>
  );
}
