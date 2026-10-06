import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  Search,
  RotateCcw,
  Sparkles,
  Heart,
  Tag,
  Boxes,
  Sliders,
  X,
} from 'lucide-react';
import { ProductFilters, ScentFamilyId, Gender } from '../../types';
import { useI18n } from '../../hooks/useI18n';
import { Checkbox } from '../ui/Checkbox';
import { PriceRangeInput } from '../ui/PriceRangeInput';
import { Switch } from '../ui/Switch';
import { Button } from '../ui/Button';

export interface ShopFiltersProps {
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
  totalFilteredCount?: number;
  className?: string;
  isMobileDrawer?: boolean;
  onCloseMobileDrawer?: () => void;
}

export const ShopFilters: React.FC<ShopFiltersProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  availableBrands,
  productCounts,
  totalFilteredCount = 0,
  className = '',
  isMobileDrawer = false,
  onCloseMobileDrawer,
}) => {
  const { lang, t, formatNumber } = useI18n();

  // First two open by default: gender and scentFamily
  const [openSections, setOpenSections] = useState<string[]>(['gender', 'scentFamily']);
  const [brandSearch, setBrandSearch] = useState('');

  const toggleSection = (id: string) => {
    setOpenSections((prev) =>
      prev.includes(id) ? prev.filter((sec) => sec !== id) : [...prev, id]
    );
  };

  // Filter toggles
  const handleGenderToggle = (gender: Gender) => {
    const current = filters.gender || [];
    const next = current.includes(gender)
      ? current.filter((g) => g !== gender)
      : [...current, gender];
    onFilterChange({ ...filters, gender: next.length > 0 ? next : undefined });
  };

  const handleFamilyToggle = (family: ScentFamilyId) => {
    const current = filters.scentFamily || [];
    const next = current.includes(family)
      ? current.filter((f) => f !== family)
      : [...current, family];
    onFilterChange({ ...filters, scentFamily: next.length > 0 ? next : undefined });
  };

  const handleBrandToggle = (brand: string) => {
    const current = filters.brand || [];
    const next = current.includes(brand)
      ? current.filter((b) => b !== brand)
      : [...current, brand];
    onFilterChange({ ...filters, brand: next.length > 0 ? next : undefined });
  };

  const handleSizeToggle = (size: string) => {
    const current = filters.sizes || [];
    const next = current.includes(size)
      ? current.filter((s) => s !== size)
      : [...current, size];
    onFilterChange({ ...filters, sizes: next.length > 0 ? next : undefined });
  };

  const handlePriceRangeChange = (min?: number, max?: number) => {
    onFilterChange({ ...filters, minPrice: min, maxPrice: max });
  };

  const handleInStockToggle = (checked: boolean) => {
    onFilterChange({ ...filters, inStockOnly: checked ? true : undefined });
  };

  const handleDiscountedToggle = (checked: boolean) => {
    onFilterChange({ ...filters, discountedOnly: checked ? true : undefined });
  };

  // Options configuration
  const genderOptions: { id: Gender; labelKey: string }[] = [
    { id: 'feminine', labelKey: 'filters.women' },
    { id: 'masculine', labelKey: 'filters.men' },
    { id: 'unisex', labelKey: 'filters.unisex' },
  ];

  const familyOptions: { id: ScentFamilyId; labelKey: string }[] = [
    { id: 'oriental', labelKey: 'filters.oriental' },
    { id: 'woody', labelKey: 'filters.woody' },
    { id: 'floral', labelKey: 'filters.floral' },
    { id: 'fresh', labelKey: 'filters.fresh' },
    { id: 'citrus', labelKey: 'filters.citrus' },
  ];

  const sizeOptions = ['30ml', '50ml', '100ml'];

  // Filtered brands based on in-list search box
  const displayedBrands = useMemo(() => {
    if (!brandSearch.trim()) return availableBrands;
    const q = brandSearch.toLowerCase().trim();
    return availableBrands.filter((b) => b.toLowerCase().includes(q));
  }, [availableBrands, brandSearch]);

  // Section active counts
  const activeGenderCount = filters.gender?.length || 0;
  const activeFamilyCount = filters.scentFamily?.length || 0;
  const activeBrandCount = filters.brand?.length || 0;
  const activeSizeCount = filters.sizes?.length || 0;
  const activePriceCount = filters.minPrice !== undefined || filters.maxPrice !== undefined ? 1 : 0;
  const activeStatusCount = (filters.inStockOnly ? 1 : 0) + (filters.discountedOnly ? 1 : 0);

  const hasAnyActiveFilter = Boolean(
    activeGenderCount > 0 ||
    activeFamilyCount > 0 ||
    activeBrandCount > 0 ||
    activeSizeCount > 0 ||
    activePriceCount > 0 ||
    activeStatusCount > 0 ||
    filters.searchQuery
  );

  // Price limits based on language
  const priceConfig =
    lang === 'fa'
      ? { minLimit: 8000000, maxLimit: 32000000, step: 500000 }
      : { minLimit: 100, maxLimit: 600, step: 10 };

  return (
    <div className={`flex flex-col text-start ${className}`}>
      {/* Top Header / Clear All Link */}
      <div className="flex items-center justify-between pb-3.5 mb-2 border-b border-[var(--border)]">
        <div className="flex items-center gap-2 font-medium text-sm text-[var(--text-primary)]">
          <Sliders className="w-4 h-4 stroke-[1.5] text-gold" aria-hidden="true" />
          <span>{t('filters.title')}</span>
        </div>

        {hasAnyActiveFilter && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs text-[var(--text-secondary)] hover:text-gold transition-colors inline-flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-xs px-1"
          >
            <RotateCcw className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>{t('filters.clearAllFilters')}</span>
          </button>
        )}
      </div>

      {/* Accordion Sections */}
      <div className="divide-y divide-[var(--border)]">
        {/* 1. Gender */}
        <div className="py-3">
          <button
            type="button"
            aria-expanded={openSections.includes('gender')}
            onClick={() => toggleSection('gender')}
            className="w-full flex items-center justify-between py-1 px-1 text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] hover:text-gold transition-colors cursor-pointer rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <span className="flex items-center gap-2">
              <span>{t('filters.gender')}</span>
              {activeGenderCount > 0 && (
                <span className="min-w-4 h-4 px-1.5 bg-gold text-[#111111] text-[10px] font-mono font-bold rounded-full flex items-center justify-center">
                  {formatNumber(activeGenderCount, { useGrouping: false })}
                </span>
              )}
            </span>
            <ChevronDown
              className={`w-4 h-4 stroke-[1.5] text-[var(--text-secondary)] transition-transform duration-200 ${
                openSections.includes('gender') ? 'rotate-180 text-gold' : ''
              }`}
              aria-hidden="true"
            />
          </button>

          {openSections.includes('gender') && (
            <div className="pt-3 pb-1 space-y-1.5">
              {genderOptions.map((opt) => (
                <Checkbox
                  key={opt.id}
                  id={`filter-gender-${opt.id}`}
                  checked={Boolean(filters.gender?.includes(opt.id))}
                  onChange={() => handleGenderToggle(opt.id)}
                  label={t(opt.labelKey)}
                  count={productCounts.gender[opt.id] || 0}
                />
              ))}
            </div>
          )}
        </div>

        {/* 2. Scent Family */}
        <div className="py-3">
          <button
            type="button"
            aria-expanded={openSections.includes('scentFamily')}
            onClick={() => toggleSection('scentFamily')}
            className="w-full flex items-center justify-between py-1 px-1 text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] hover:text-gold transition-colors cursor-pointer rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <span className="flex items-center gap-2">
              <span>{t('filters.scentFamily')}</span>
              {activeFamilyCount > 0 && (
                <span className="min-w-4 h-4 px-1.5 bg-gold text-[#111111] text-[10px] font-mono font-bold rounded-full flex items-center justify-center">
                  {formatNumber(activeFamilyCount, { useGrouping: false })}
                </span>
              )}
            </span>
            <ChevronDown
              className={`w-4 h-4 stroke-[1.5] text-[var(--text-secondary)] transition-transform duration-200 ${
                openSections.includes('scentFamily') ? 'rotate-180 text-gold' : ''
              }`}
              aria-hidden="true"
            />
          </button>

          {openSections.includes('scentFamily') && (
            <div className="pt-3 pb-1 space-y-1.5">
              {familyOptions.map((opt) => (
                <Checkbox
                  key={opt.id}
                  id={`filter-family-${opt.id}`}
                  checked={Boolean(filters.scentFamily?.includes(opt.id))}
                  onChange={() => handleFamilyToggle(opt.id)}
                  label={t(opt.labelKey)}
                  count={productCounts.scentFamily[opt.id] || 0}
                />
              ))}
            </div>
          )}
        </div>

        {/* 3. Brand (with small in-list search box if >= 5 brands) */}
        <div className="py-3">
          <button
            type="button"
            aria-expanded={openSections.includes('brand')}
            onClick={() => toggleSection('brand')}
            className="w-full flex items-center justify-between py-1 text-xs font-semibold uppercase tracking-wider text-near-black hover:text-gold transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <span>{t('filters.brand')}</span>
              {activeBrandCount > 0 && (
                <span className="min-w-4 h-4 px-1.5 bg-gold text-near-black text-[10px] font-mono font-bold rounded-full flex items-center justify-center">
                  {formatNumber(activeBrandCount, { useGrouping: false })}
                </span>
              )}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-muted transition-transform duration-200 ${
                openSections.includes('brand') ? 'rotate-180 text-gold' : ''
              }`}
              aria-hidden="true"
            />
          </button>

          {openSections.includes('brand') && (
            <div className="pt-3 pb-1 space-y-2">
              {/* In-list search box for brands */}
              {availableBrands.length >= 5 && (
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 text-[var(--text-secondary)] absolute top-2.5 start-2.5 pointer-events-none" />
                  <input
                    type="text"
                    value={brandSearch}
                    onChange={(e) => setBrandSearch(e.target.value)}
                    placeholder={t('filters.searchBrand')}
                    className="w-full ps-8 pe-6 py-1.5 text-xs bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border)] rounded-xs focus:outline-none focus:border-gold placeholder:text-[var(--text-secondary)]/70"
                  />
                  {brandSearch && (
                    <button
                      type="button"
                      onClick={() => setBrandSearch('')}
                      className="absolute top-2.5 end-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-0.5 cursor-pointer"
                      aria-label={t('common.clear')}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}

              <div className="flex flex-col space-y-1.5 max-h-48 overflow-y-auto pe-1">
                {displayedBrands.map((brand) => (
                  <Checkbox
                    key={brand}
                    id={`filter-brand-${brand.replace(/\s+/g, '-')}`}
                    checked={Boolean(filters.brand?.includes(brand))}
                    onChange={() => handleBrandToggle(brand)}
                    label={brand}
                    count={productCounts.brand[brand] || 0}
                  />
                ))}
                {displayedBrands.length === 0 && (
                  <p className="text-xs text-muted py-2 text-center">
                    {t('filters.noBrandFound')}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 4. Price Range (dual slider + min/max inputs) */}
        <div className="py-3">
          <button
            type="button"
            aria-expanded={openSections.includes('price')}
            onClick={() => toggleSection('price')}
            className="w-full flex items-center justify-between py-1 text-xs font-semibold uppercase tracking-wider text-near-black hover:text-gold transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <span>{t('filters.priceRange')}</span>
              {activePriceCount > 0 && (
                <span className="min-w-4 h-4 px-1.5 bg-gold text-near-black text-[10px] font-mono font-bold rounded-full flex items-center justify-center">
                  {formatNumber(activePriceCount, { useGrouping: false })}
                </span>
              )}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-muted transition-transform duration-200 ${
                openSections.includes('price') ? 'rotate-180 text-gold' : ''
              }`}
              aria-hidden="true"
            />
          </button>

          {openSections.includes('price') && (
            <div className="pt-3 pb-1">
              <PriceRangeInput
                minLimit={priceConfig.minLimit}
                maxLimit={priceConfig.maxLimit}
                step={priceConfig.step}
                currentMin={filters.minPrice}
                currentMax={filters.maxPrice}
                onChange={handlePriceRangeChange}
              />
            </div>
          )}
        </div>

        {/* 5. Size (30/50/100 ml) */}
        <div className="py-3">
          <button
            type="button"
            aria-expanded={openSections.includes('size')}
            onClick={() => toggleSection('size')}
            className="w-full flex items-center justify-between py-1 text-xs font-semibold uppercase tracking-wider text-near-black hover:text-gold transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <span>{t('filters.size')}</span>
              {activeSizeCount > 0 && (
                <span className="min-w-4 h-4 px-1.5 bg-gold text-near-black text-[10px] font-mono font-bold rounded-full flex items-center justify-center">
                  {formatNumber(activeSizeCount, { useGrouping: false })}
                </span>
              )}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-muted transition-transform duration-200 ${
                openSections.includes('size') ? 'rotate-180 text-gold' : ''
              }`}
              aria-hidden="true"
            />
          </button>

          {openSections.includes('size') && (
            <div className="pt-3 pb-1 space-y-1.5">
              {sizeOptions.map((sz) => (
                <Checkbox
                  key={sz}
                  id={`filter-size-${sz}`}
                  checked={Boolean(filters.sizes?.includes(sz))}
                  onChange={() => handleSizeToggle(sz)}
                  label={sz}
                  count={productCounts.sizes[sz] || 0}
                />
              ))}
            </div>
          )}
        </div>

        {/* 6. Toggle Switches: Only in-stock & Only discounted */}
        <div className="py-3 space-y-1">
          <Switch
            id="filter-toggle-instock"
            checked={Boolean(filters.inStockOnly)}
            onChange={handleInStockToggle}
            label={t('filters.inStockOnly')}
          />
          <Switch
            id="filter-toggle-discounted"
            checked={Boolean(filters.discountedOnly)}
            onChange={handleDiscountedToggle}
            label={t('filters.discountedOnly')}
          />
        </div>
      </div>

      {/* Mobile Drawer Sticky Footer */}
      {isMobileDrawer && (
        <div className="sticky bottom-0 bg-[var(--bg-surface)] pt-4 pb-2 border-t border-[var(--border)] mt-auto flex items-center gap-2">
          <Button
            variant="primary"
            size="md"
            className="flex-1 text-xs"
            onClick={onCloseMobileDrawer}
          >
            {t('filters.showResults').replace('{count}', formatNumber(totalFilteredCount, { useGrouping: false }))}
          </Button>

          {hasAnyActiveFilter && (
            <Button
              variant="outline"
              size="md"
              className="text-xs px-3"
              onClick={onResetFilters}
            >
              {t('filters.clearAll')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
