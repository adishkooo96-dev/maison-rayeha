import React from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';
import { LocaleLink } from '../navigation/LocaleLink';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrent?: boolean;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  const { isRTL } = useI18n();
  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  return (
    <nav aria-label="Breadcrumb" className={`text-xs text-muted font-light ${className}`}>
      <ol className="flex items-center flex-wrap gap-1.5 list-none p-0 m-0">
        {items.map((item, index) => {
          const isLast = index === items.length - 1 || item.isCurrent;

          return (
            <li key={item.label + index} className="inline-flex items-center gap-1.5">
              {item.href && !isLast ? (
                <LocaleLink
                  to={item.href}
                  className="hover:text-gold transition-colors focus-visible:outline-none focus-visible:text-gold"
                >
                  {item.label}
                </LocaleLink>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className={isLast ? 'text-near-black font-medium' : ''}
                >
                  {item.label}
                </span>
              )}

              {!isLast && (
                <Chevron
                  className="w-3.5 h-3.5 text-muted/60 shrink-0 select-none"
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
