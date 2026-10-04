import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';

export interface QuantityStepperProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  className?: string;
  size?: 'sm' | 'md';
  disabled?: boolean;
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  value,
  onChange,
  min = 1,
  max = 99,
  className = '',
  size = 'md',
  disabled = false,
}) => {
  const { formatNumber } = useI18n();
  const handleDecrement = () => {
    if (!disabled && value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (!disabled && value < max) {
      onChange(value + 1);
    }
  };

  const padStyles =
    size === 'sm'
      ? 'min-h-[38px] min-w-[38px] flex items-center justify-center p-1.5'
      : 'min-h-[44px] min-w-[44px] flex items-center justify-center p-2.5';
  const textStyles = size === 'sm' ? 'px-3 text-xs' : 'px-4 text-sm';
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <div
      className={`inline-flex items-center border border-border bg-ivory rounded-xs select-none ${
        disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''
      } ${className}`}
      role="group"
      aria-label="Quantity selector"
      aria-disabled={disabled}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
        className={`${padStyles} text-muted hover:text-near-black disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-not-allowed`}
      >
        <Minus className={iconSize} />
      </button>

      <span
        className={`${textStyles} font-mono font-medium text-near-black text-center min-w-[32px]`}
        aria-live="polite"
      >
        {formatNumber(value, { useGrouping: false })}
      </span>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
        className={`${padStyles} text-muted hover:text-near-black disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-not-allowed`}
      >
        <Plus className={iconSize} />
      </button>
    </div>
  );
};
