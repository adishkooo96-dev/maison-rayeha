import React, { useRef } from 'react';
import { X, Check } from 'lucide-react';
import { SortOption } from '../../types';
import { useI18n } from '../../hooks/useI18n';
import { useFocusTrap } from '../../hooks/useFocusTrap';

export interface SortBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentSort: SortOption;
  onSelectSort: (sort: SortOption) => void;
}

export const SortBottomSheet: React.FC<SortBottomSheetProps> = ({
  isOpen,
  onClose,
  currentSort,
  onSelectSort,
}) => {
  const { t } = useI18n();
  const sheetRef = useRef<HTMLDivElement>(null);

  useFocusTrap(sheetRef, isOpen, onClose);

  if (!isOpen) return null;

  const sortItems: { id: SortOption; label: string }[] = [
    { id: 'popular', label: t('sort.popular') },
    { id: 'bestseller', label: t('sort.bestseller') },
    { id: 'newest', label: t('sort.newest') },
    { id: 'price-asc', label: t('sort.cheapest') },
    { id: 'price-desc', label: t('sort.mostExpensive') },
  ];

  const handleSelect = (sort: SortOption) => {
    onSelectSort(sort);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label={t('sort.sortBy')}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-near-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet Container */}
      <div
        ref={sheetRef}
        className="relative w-full max-w-lg bg-[var(--bg-surface)] rounded-t-2xl border-t border-[var(--border)] shadow-2xl z-10 animate-in slide-in-from-bottom duration-200 motion-reduce:animate-none pb-8"
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1" aria-hidden="true">
          <div className="w-10 h-1 rounded-full bg-[var(--border)]" />
        </div>

        {/* Sheet Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)] text-start">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            {t('sort.sortBy')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors rounded-xs focus:outline-none focus-visible:ring-1 focus-visible:ring-gold"
            aria-label={t('filters.closeSort')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Radio Option List */}
        <div className="py-2" role="radiogroup" aria-label={t('sort.sortBy')}>
          {sortItems.map((item) => {
            const isSelected = currentSort === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-5 py-3.5 text-xs text-start transition-colors cursor-pointer ${
                  isSelected
                    ? 'text-gold bg-gold/10 font-medium'
                    : 'text-[var(--text-primary)] hover:bg-[var(--bg-surface-raised)] font-light'
                }`}
              >
                <span>{item.label}</span>
                {isSelected && (
                  <Check className="w-4 h-4 text-gold shrink-0" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
