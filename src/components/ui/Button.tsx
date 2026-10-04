import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'outline-ivory' | 'ghost' | 'gold';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold uppercase rtl:normal-case tracking-[0.14em] rtl:tracking-normal transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-ivory disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none disabled:active:scale-100 whitespace-nowrap cursor-pointer select-none motion-reduce:transition-none';

  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'text-xs px-5 py-2.5 min-h-[42px] gap-2 rounded-[8px]',
    md: 'text-sm px-8 py-4 min-h-[52px] gap-2.5 rounded-[10px]',
    lg: 'text-base px-10 py-4.5 min-h-[58px] gap-3 rounded-[12px]',
  };

  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      'bg-near-black text-ivory border-2 border-near-black hover:bg-gold hover:border-gold hover:text-near-black active:scale-[0.98] motion-reduce:active:scale-100 shadow-sm hover:shadow-md',
    secondary:
      'bg-ivory-subtle text-near-black border-2 border-border hover:border-gold hover:text-near-black hover:bg-ivory active:scale-[0.98] motion-reduce:active:scale-100 shadow-2xs',
    gold:
      'bg-gold text-near-black border-2 border-gold hover:bg-gold-light hover:border-gold-light active:scale-[0.98] motion-reduce:active:scale-100 shadow-sm hover:shadow-md font-bold',
    outline:
      'bg-transparent text-near-black border-2 border-near-black/40 hover:border-gold-dark hover:text-gold-dark hover:bg-gold/10 active:scale-[0.98] motion-reduce:active:scale-100',
    'outline-ivory':
      'bg-transparent text-ivory border-2 border-ivory/50 hover:border-gold hover:text-gold hover:bg-ivory/10 active:scale-[0.98] motion-reduce:active:scale-100',
    ghost:
      'bg-transparent text-near-black hover:text-gold-dark hover:bg-near-black/5 active:scale-[0.98] motion-reduce:active:scale-100',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span
          className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin me-2"
          aria-hidden="true"
        />
      )}
      {!isLoading && leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
};
