import React from 'react';

export type BadgeVariant = 'gold' | 'dark' | 'outline' | 'subtle';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'gold',
  className = '',
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    gold: 'bg-gold/15 text-gold-dark border border-gold/40 font-medium',
    dark: 'bg-near-black text-ivory border border-near-black',
    outline: 'bg-transparent text-near-black border border-near-black/20',
    subtle: 'bg-ivory-subtle text-muted border border-border',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-[11px] font-medium tracking-wider uppercase rounded-xs whitespace-nowrap select-none ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
