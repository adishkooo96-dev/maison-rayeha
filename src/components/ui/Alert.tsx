import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export type AlertVariant = 'info' | 'warning' | 'error' | 'success';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  onClose,
  className = '',
}) => {
  const variantConfig = {
    info: {
      container: 'bg-ivory-surface border-gold/40 text-near-black',
      iconColor: 'text-gold-dark',
      Icon: Info,
    },
    warning: {
      container: 'bg-amber-500/10 border-amber-600/30 text-amber-950',
      iconColor: 'text-amber-700',
      Icon: AlertTriangle,
    },
    error: {
      container: 'bg-red-500/10 border-red-600/30 text-red-950',
      iconColor: 'text-red-700',
      Icon: AlertCircle,
    },
    success: {
      container: 'bg-emerald-500/10 border-emerald-600/30 text-emerald-950',
      iconColor: 'text-emerald-700',
      Icon: CheckCircle2,
    },
  };

  const { container, iconColor, Icon } = variantConfig[variant];

  return (
    <div
      role="alert"
      className={`relative w-full p-4 border rounded-xs shadow-2xs flex items-start gap-3 text-start ${container} ${className}`}
    >
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 stroke-[1.5] ${iconColor}`} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="text-sm font-medium tracking-wide mb-1 leading-snug">
            {title}
          </h4>
        )}
        <div className="text-xs sm:text-sm font-normal leading-relaxed opacity-90">
          {children}
        </div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss alert"
          className="min-h-[36px] min-w-[36px] -me-2 -mt-1 p-1 text-muted hover:text-near-black transition-colors rounded-xs flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          <X className="w-4 h-4 stroke-[1.5]" />
        </button>
      )}
    </div>
  );
};
