import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';

export interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  showStartIcon?: boolean;
  startIcon?: React.ReactNode;
}

/**
 * Reusable PasswordInput with show/hide password toggle (eye icon).
 * - Defaults to masked (type="password")
 * - Logical start and end positioning for RTL/LTR support
 * - Accessible toggle button with dynamic aria-label and aria-pressed
 * - Fully compatible with react-hook-form (forwards ref)
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      className = '',
      showStartIcon = true,
      startIcon,
      dir = 'ltr',
      autoComplete = 'current-password',
      placeholder = '••••••••',
      ...rest
    },
    ref
  ) => {
    const { lang } = useI18n();
    const [showPassword, setShowPassword] = useState(false);

    const toggleShowPassword = () => {
      setShowPassword((prev) => !prev);
    };

    const isFa = lang === 'fa';
    const toggleAriaLabel = showPassword
      ? isFa
        ? 'پنهان کردن رمز عبور'
        : 'Hide password'
      : isFa
      ? 'نمایش رمز عبور'
      : 'Show password';

    return (
      <div className="relative flex items-center w-full">
        {showStartIcon && (
          <span className="absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted flex items-center justify-center">
            {startIcon || <Lock className="w-4 h-4 stroke-[1.5]" aria-hidden="true" />}
          </span>
        )}

        <input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          dir={dir}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={`w-full bg-ivory border border-border px-3.5 py-2.5 ${
            showStartIcon ? 'ps-10' : 'ps-3.5'
          } pe-10 text-xs sm:text-sm text-near-black min-h-[44px] rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold transition-colors placeholder:text-muted/60 ${className}`}
          {...rest}
        />

        <button
          type="button"
          onClick={toggleShowPassword}
          aria-label={toggleAriaLabel}
          aria-pressed={showPassword}
          className="absolute end-3 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-near-black focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold rounded-xs transition-colors flex items-center justify-center"
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4 stroke-[1.5]" aria-hidden="true" />
          ) : (
            <Eye className="w-4 h-4 stroke-[1.5]" aria-hidden="true" />
          )}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
