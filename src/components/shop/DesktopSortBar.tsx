import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import { SortOption } from '../../types';
import { useI18n } from '../../hooks/useI18n';

export interface DesktopSortBarProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalCount: number;
  className?: string;
}

export const DesktopSortBar: React.FC<DesktopSortBarProps> = ({
  currentSort,
  onSortChange,
  totalCount,
  className = '',
}) => {
  const { t, formatNumber } = useI18n();

  const sortItems: { id: SortOption; label: string }[] = [
    { id: 'popular', label: t('sort.popular') },
    { id: 'bestseller', label: t('sort.bestseller') },
    { id: 'newest', label: t('sort.newest') },
    { id: 'price-asc', label: t('sort.cheapest') },
    { id: 'price-desc', label: t('sort.mostExpensive') },
  ];

  return (
    <div
      className={`hidden lg:flex items-center justify-between border-b border-border/80 pb-3 mb-6 ${className}`}
      role="toolbar"
      aria-label={t('sort.sortBy')}
    >
      {/* Start side: Sort label and inline options */}
      <div className="flex items-center gap-1 sm:gap-2">
        <div className="flex items-center gap-1.5 text-xs text-muted me-2 shrink-0 select-none">
          <ArrowUpDown className="w-3.5 h-3.5 text-gold" aria-hidden="true" />
          <span className="font-medium text-near-black">{t('sort.sortBy')}</span>
        </div>

        <div className="flex items-center gap-1" role="radiogroup" aria-label={t('sort.sortBy')}>
          {sortItems.map((item) => {
            const isActive = currentSort === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => onSortChange(item.id)}
                className={`relative px-3 py-1.5 text-xs tracking-wide transition-colors cursor-pointer ${
                  isActive
                    ? 'text-gold font-medium border-b-2 border-gold -mb-[13px] pb-[11px]'
                    : 'text-muted hover:text-near-black font-light'
                }`}
              >
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Opposite end: Total result count */}
      <div className="text-xs text-muted shrink-0">
        <span>
          <strong className="text-near-black font-mono font-medium">
            {formatNumber(totalCount, { useGrouping: false })}
          </strong>{' '}
          {t('shop.results')}
        </span>
      </div>
    </div>
  );
};
