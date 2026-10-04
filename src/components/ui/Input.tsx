import React from 'react';
import { handleLiveDigitInput } from '../../lib/formatters';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  darkVariant?: boolean;
  normalizeDigits?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  startIcon,
  endIcon,
  darkVariant = false,
  normalizeDigits = false,
  className = '',
  id,
  onChange,
  onInput,
  ...props
}) => {
  const generatedId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (normalizeDigits) {
      handleLiveDigitInput(e);
    }
    onChange?.(e);
  };

  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    if (normalizeDigits) {
      handleLiveDigitInput(e);
    }
    (onInput as any)?.(e);
  };

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={generatedId}
          className={`text-xs font-medium tracking-wide ${
            darkVariant ? 'text-ivory/80' : 'text-near-black/80'
          }`}
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {startIcon && (
          <span className="absolute start-3.5 text-muted pointer-events-none flex items-center">
            {startIcon}
          </span>
        )}

        <input
          id={generatedId}
          className={`w-full min-h-[44px] text-base sm:text-sm px-4 py-2.5 sm:py-3 transition-colors duration-200 outline-none rounded-xs ${
            startIcon ? 'ps-10' : ''
          } ${endIcon ? 'pe-10' : ''} ${
            darkVariant
              ? 'bg-near-black/60 border border-ivory/20 text-ivory placeholder:text-ivory/40 focus:border-gold focus:ring-2 focus:ring-gold/30 shadow-2xs'
              : 'bg-ivory-surface border border-border text-near-black placeholder:text-muted/60 focus:border-gold focus:ring-2 focus:ring-gold/30 shadow-2xs'
          } ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''} ${className}`}
          {...props}
          onChange={handleChange}
          onInput={handleInput}
        />

        {endIcon && (
          <span className="absolute end-3.5 text-muted flex items-center">
            {endIcon}
          </span>
        )}
      </div>

      {error && <span className="text-xs text-red-500 ps-1">{error}</span>}
      {!error && helperText && (
        <span className={`text-xs ps-1 ${darkVariant ? 'text-ivory/50' : 'text-muted'}`}>
          {helperText}
        </span>
      )}
    </div>
  );
};
