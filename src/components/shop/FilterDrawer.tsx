import React, { useRef } from 'react';
import { X, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { ProductFilters } from '../../types';
import { useI18n } from '../../hooks/useI18n';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { ShopFilters } from './ShopFilters';

export interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: ProductFilters;
  onFilterChange: (newFilters: ProductFilters) => void;
  onResetFilters: () => void;
  availableBrands: string[];
  productCounts: {
    gender: Record<string, number>;
    scentFamily: Record<string, number>;
    brand: Record<string, number>;
    sizes: Record<string, number>;
  };
  totalFilteredCount: number;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onResetFilters,
  availableBrands,
  productCounts,
  totalFilteredCount,
}) => {
  const { t } = useI18n();
  const drawerRef = useRef<HTMLDivElement>(null);

  useFocusTrap(drawerRef, isOpen, onClose);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label={t('filters.title')}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-near-black/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sliding Drawer Container - Always slides from start side (right in FA, left in EN) */}
      <div
        ref={drawerRef}
        className="relative z-10 w-full max-w-xs sm:max-w-sm h-full bg-ivory-surface shadow-2xl flex flex-col animate-in slide-in-from-start duration-300 motion-reduce:animate-none border-e border-border/80 text-start"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/70 shrink-0">
          <div className="flex items-center gap-2 font-semibold text-sm text-near-black">
            <SlidersHorizontal className="w-4 h-4 text-gold" aria-hidden="true" />
            <span>{t('filters.title')}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-muted hover:text-near-black transition-colors rounded-xs focus:outline-none focus-visible:ring-1 focus-visible:ring-gold cursor-pointer"
            aria-label={t('filters.closeFilters')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Filters Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <ShopFilters
            filters={filters}
            onFilterChange={onFilterChange}
            onResetFilters={onResetFilters}
            availableBrands={availableBrands}
            productCounts={productCounts}
            totalFilteredCount={totalFilteredCount}
            isMobileDrawer={true}
            onCloseMobileDrawer={onClose}
          />
        </div>
      </div>
    </div>
  );
};
