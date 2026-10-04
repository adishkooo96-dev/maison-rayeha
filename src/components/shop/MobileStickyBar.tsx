import React from 'react';
import { ArrowUpDown, SlidersHorizontal, X } from 'lucide-react';
import { SortOption, ProductFilters, Gender, ScentFamilyId } from '../../types';
import { useI18n } from '../../hooks/useI18n';

export interface MobileStickyBarProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
  onOpenSortSheet: () => void;
  onOpenFilterDrawer: () => void;
  activeFilterCount: number;
  filters: ProductFilters;
  onRemoveFilter: (type: string, value?: string) => void;
  onClearAllFilters: () => void;
  className?: string;
}

export const MobileStickyBar: React.FC<MobileStickyBarProps> = ({
  currentSort,
  onSortChange,
  onOpenSortSheet,
  onOpenFilterDrawer,
  activeFilterCount,
  filters,
  onRemoveFilter,
  onClearAllFilters,
  className = '',
}) => {
  const { t, formatNumber, formatPrice } = useI18n();

  const sortChips: { id: SortOption; label: string }[] = [
    { id: 'popular', label: t('sort.popular') },
    { id: 'bestseller', label: t('sort.bestseller') },
    { id: 'newest', label: t('sort.newest') },
    { id: 'price-asc', label: t('sort.cheapest') },
    { id: 'price-desc', label: t('sort.mostExpensive') },
  ];

  // Derive active filter chips for display
  const activeChips: { type: string; value?: string; label: string }[] = [];

  if (filters.gender) {
    filters.gender.forEach((g) => {
      activeChips.push({
        type: 'gender',
        value: g,
        label: t(`filters.${g === 'feminine' ? 'women' : g === 'masculine' ? 'men' : 'unisex'}`),
      });
    });
  }

  if (filters.scentFamily) {
    filters.scentFamily.forEach((fam) => {
      activeChips.push({
        type: 'scentFamily',
        value: fam,
        label: t(`filters.${fam}`),
      });
    });
  }

  if (filters.brand) {
    filters.brand.forEach((b) => {
      activeChips.push({
        type: 'brand',
        value: b,
        label: b,
      });
    });
  }

  if (filters.sizes) {
    filters.sizes.forEach((s) => {
      activeChips.push({
        type: 'size',
        value: s,
        label: s,
      });
    });
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    let priceLabel = '';
    if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
      priceLabel = `${formatPrice(filters.minPrice)} - ${formatPrice(filters.maxPrice)}`;
    } else if (filters.minPrice !== undefined) {
      priceLabel = `${t('filters.from')} ${formatPrice(filters.minPrice)}`;
    } else if (filters.maxPrice !== undefined) {
      priceLabel = `${t('filters.to')} ${formatPrice(filters.maxPrice)}`;
    }
    activeChips.push({
      type: 'price',
      label: priceLabel,
    });
  }

  if (filters.inStockOnly) {
    activeChips.push({
      type: 'inStock',
      label: t('filters.inStockOnly'),
    });
  }

  if (filters.discountedOnly) {
    activeChips.push({
      type: 'discounted',
      label: t('filters.discountedOnly'),
    });
  }

  return (
    <div
      className={`sticky top-16 sm:top-20 z-20 bg-ivory/95 backdrop-blur-md border-b border-border/80 lg:hidden shadow-xs ${className}`}
    >
      {/* Two Equal Action Buttons: Sort and Filters */}
      <div className="grid grid-cols-2 divide-x divide-border/70 rtl:divide-x-reverse border-b border-border/60">
        {/* Sort Trigger Button */}
        <button
          type="button"
          onClick={onOpenSortSheet}
          className="flex items-center justify-center gap-2 py-3 px-4 text-xs font-medium text-near-black hover:bg-ivory hover:text-gold transition-colors cursor-pointer"
          aria-label={t('filters.sortButton')}
        >
          <ArrowUpDown className="w-3.5 h-3.5 text-gold" aria-hidden="true" />
          <span>{t('filters.sortButton')}</span>
        </button>

        {/* Filters Trigger Button */}
        <button
          type="button"
          onClick={onOpenFilterDrawer}
          className="flex items-center justify-center gap-2 py-3 px-4 text-xs font-medium text-near-black hover:bg-ivory hover:text-gold transition-colors cursor-pointer"
          aria-label={t('filters.filterButton')}
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-gold" aria-hidden="true" />
          <span>{t('filters.filterButton')}</span>
          {activeFilterCount > 0 && (
            <span className="min-w-4 h-4 px-1 bg-gold text-near-black text-[10px] font-mono font-bold rounded-full flex items-center justify-center">
              {formatNumber(activeFilterCount, { useGrouping: false })}
            </span>
          )}
        </button>
      </div>

      {/* Horizontally scrollable row of quick sort chips */}
      <div
        className="flex items-center gap-1.5 px-4 py-2 overflow-x-auto scrollbar-none flex-nowrap text-xs"
        role="radiogroup"
        aria-label={t('sort.sortBy')}
      >
        {sortChips.map((chip) => {
          const isActive = currentSort === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onSortChange(chip.id)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs transition-colors whitespace-nowrap cursor-pointer border ${
                isActive
                  ? 'bg-near-black text-ivory border-near-black font-medium shadow-xs'
                  : 'bg-ivory-surface text-muted hover:text-near-black border-border hover:border-gold font-light'
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* Active filters shown as removable chips under the sticky bar */}
      {activeChips.length > 0 && (
        <div className="flex items-center gap-1.5 px-4 py-2 border-t border-border/40 overflow-x-auto scrollbar-none flex-nowrap">
          {activeChips.map((chip, idx) => (
            <span
              key={`${chip.type}-${chip.value || idx}`}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-gold/15 text-near-black border border-gold/40 shrink-0"
            >
              <span>{chip.label}</span>
              <button
                type="button"
                onClick={() => onRemoveFilter(chip.type, chip.value)}
                className="p-0.5 hover:text-gold text-muted transition-colors cursor-pointer"
                aria-label={`${t('common.clear')} ${chip.label}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          <button
            type="button"
            onClick={onClearAllFilters}
            className="text-[11px] text-muted hover:text-near-black underline shrink-0 px-2 cursor-pointer"
          >
            {t('filters.clearAll')}
          </button>
        </div>
      )}
    </div>
  );
};
