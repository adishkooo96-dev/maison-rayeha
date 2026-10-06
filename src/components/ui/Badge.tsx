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
    gold: 'bg-gold/15 text-gold border border-gold/40 font-medium',
    dark: 'bg-[var(--badge-bg)] text-[var(--badge-text)] border border-[var(--badge-bg)] font-semibold shadow-xs',
    outline: 'bg-transparent text-[var(--text-primary)] border border-[var(--border)]',
    subtle: 'bg-[var(--bg-surface-raised)] text-[var(--text-secondary)] border border-[var(--border)]',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-[11px] font-medium tracking-wider uppercase rounded-xs whitespace-nowrap select-none ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
