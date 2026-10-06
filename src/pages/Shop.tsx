import React, { useState, useEffect, useMemo, useTransition } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ArrowUpDown, X, Sparkles, RefreshCw, ShoppingBag, Eye, Check } from 'lucide-react';
import { products as initialProducts } from '../data/products';
import { getAllProducts, subscribeToProducts } from '../lib/productsApi';
import { filterProducts, sortProducts, getSizePrice, getStartingPrice } from '../lib/products';
import { Product, ProductFilters, SortOption, Gender, ScentFamilyId } from '../types';
import { useI18n } from '../hooks/useI18n';
import { useCartStore } from '../store/cartStore';
import { Container } from '../components/ui/Container';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { SortDropdown, SortDropdownOption } from '../components/shop/SortDropdown';
import { Chip } from '../components/ui/Chip';
import { Button } from '../components/ui/Button';
import { ProductCard } from '../components/product/ProductCard';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import { ShopFilters } from '../components/shop/ShopFilters';
import { Seo } from '../components/seo/Seo';

const ITEMS_PER_PAGE = 12;

export const Shop: React.FC = () => {
  const { lang, isRTL, t, formatPrice, formatNumber, getLocalized } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [productList, setProductList] = useState<Product[]>(initialProducts);
  const [productsLoading, setProductsLoading] = useState<boolean>(false);

  // Subscribe to real-time products from Firestore
  useEffect(() => {
    setProductsLoading(true);
    const unsub = subscribeToProducts((data) => {
      if (data && data.length > 0) {
        setProductList(data);
      }
      setProductsLoading(false);
    });
    return () => unsub();
  }, []);

  // Mobile Filter Drawer state
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Quick View Modal state
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [selectedQuickViewSize, setSelectedQuickViewSize] = useState<string>('50ml');
  const [modalAdded, setModalAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  // Visible items count for Load More
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  // Screen reader live announcement
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>('');

  // Parse filters from URL
  const filters: ProductFilters = useMemo(() => {
    const gender = searchParams.getAll('gender') as Gender[];
    const scentFamily = searchParams.getAll('scentFamily') as ScentFamilyId[];
    const brand = searchParams.getAll('brand');
    const sizes = searchParams.getAll('size');
    const minPriceParam = searchParams.get('minPrice');
    const maxPriceParam = searchParams.get('maxPrice');
    const searchQuery = searchParams.get('q') || undefined;

    return {
      gender: gender.length > 0 ? gender : undefined,
      scentFamily: scentFamily.length > 0 ? scentFamily : undefined,
      brand: brand.length > 0 ? brand : undefined,
      sizes: sizes.length > 0 ? sizes : undefined,
      minPrice: minPriceParam ? parseFloat(minPriceParam) : undefined,
      maxPrice: maxPriceParam ? parseFloat(maxPriceParam) : undefined,
      searchQuery,
    };
  }, [searchParams]);

  // Parse sort from URL (?sort=popular|bestseller|newest|price-asc|price-desc)
  const currentSort: SortOption = useMemo(() => {
    const sortParam = searchParams.get('sort');
    if (sortParam === 'popular') return 'popular';
    if (sortParam === 'bestseller' || sortParam === 'bestsellers') return 'bestseller';
    if (sortParam === 'newest') return 'newest';
    if (sortParam === 'price-asc' || sortParam === 'priceAsc') return 'price-asc';
    if (sortParam === 'price-desc' || sortParam === 'priceDesc') return 'price-desc';
    return 'featured';
  }, [searchParams]);

  // Available brands
  const availableBrands = useMemo(() => {
    return Array.from(new Set(productList.map((p) => p.brand))).sort();
  }, [productList]);

  // Compute facet product counts for badges
  const productCounts = useMemo(() => {
    const counts = {
      gender: {} as Record<string, number>,
      scentFamily: {} as Record<string, number>,
      brand: {} as Record<string, number>,
      sizes: {} as Record<string, number>,
    };

    productList.forEach((p) => {
      counts.gender[p.gender] = (counts.gender[p.gender] || 0) + 1;
      counts.scentFamily[p.scentFamily] = (counts.scentFamily[p.scentFamily] || 0) + 1;
      counts.brand[p.brand] = (counts.brand[p.brand] || 0) + 1;
      p.sizes.forEach((s) => {
        const sizeStr = `${s.ml}ml`;
        counts.sizes[sizeStr] = (counts.sizes[sizeStr] || 0) + 1;
      });
    });

    return counts;
  }, [productList]);

  // Update filters in URL
  const handleFilterChange = (newFilters: ProductFilters) => {
    startTransition(() => {
      const nextParams = new URLSearchParams();

      if (currentSort && currentSort !== 'featured') {
        nextParams.set('sort', currentSort);
      }

      if (newFilters.searchQuery) {
        nextParams.set('q', newFilters.searchQuery);
      }

      newFilters.gender?.forEach((g) => nextParams.append('gender', g));
      newFilters.scentFamily?.forEach((f) => nextParams.append('scentFamily', f));
      newFilters.brand?.forEach((b) => nextParams.append('brand', b));
      newFilters.sizes?.forEach((s) => nextParams.append('size', s));

      if (newFilters.minPrice !== undefined) {
        nextParams.set('minPrice', String(newFilters.minPrice));
      }
      if (newFilters.maxPrice !== undefined) {
        nextParams.set('maxPrice', String(newFilters.maxPrice));
      }

      setSearchParams(nextParams);
      setVisibleCount(ITEMS_PER_PAGE);
    });
  };

  // Update sort in URL
  const handleSortChange = (newSort: SortOption) => {
    startTransition(() => {
      const nextParams = new URLSearchParams(searchParams);
      if (newSort === 'featured') {
        nextParams.delete('sort');
      } else {
        nextParams.set('sort', newSort);
      }
      setSearchParams(nextParams);
      setVisibleCount(ITEMS_PER_PAGE);

      const targetOpt = sortOptions.find((o) => o.value === newSort);
      if (targetOpt) {
        setLiveAnnouncement(
          t('sort.announce')
            .replace('{sort}', targetOpt.label)
            .replace('{count}', formatNumber(sortedList.length, { useGrouping: false }))
        );
      }
    });
  };

  // Reset all filters
  const handleResetFilters = () => {
    startTransition(() => {
      const nextParams = new URLSearchParams();
      if (currentSort && currentSort !== 'featured') {
        nextParams.set('sort', currentSort);
      }
      setSearchParams(nextParams);
      setVisibleCount(ITEMS_PER_PAGE);
    });
  };

  // Filter and sort products
  const filteredList = useMemo(() => {
    return filterProducts(productList, filters, lang);
  }, [productList, filters, lang]);

  const sortedList = useMemo(() => {
    return sortProducts(filteredList, currentSort, lang);
  }, [filteredList, currentSort, lang]);

  const visibleProducts = useMemo(() => {
    return sortedList.slice(0, visibleCount);
  }, [sortedList, visibleCount]);

  const hasMore = visibleCount < sortedList.length;

  // Quick view handler
  const handleOpenQuickView = (product: Product) => {
    setQuickViewProduct(product);
    const initialSize =
      product.sizes && product.sizes.length > 0 ? `${product.sizes[0].ml}ml` : '50ml';
    setSelectedQuickViewSize(initialSize);
    setModalAdded(false);
  };

  const handleModalAddToCart = () => {
    if (!quickViewProduct || quickViewProduct.inStock === false) return;
    addItem(quickViewProduct, selectedQuickViewSize, 1);
    setModalAdded(true);
    setTimeout(() => {
      setModalAdded(false);
      setQuickViewProduct(null);
    }, 1200);
  };

  // Active filter items for chips
  const activeChips = useMemo(() => {
    const chips: { label: string; onRemove: () => void }[] = [];

    if (filters.searchQuery) {
      chips.push({
        label: `"${filters.searchQuery}"`,
        onRemove: () => {
          const next = { ...filters };
          delete next.searchQuery;
          handleFilterChange(next);
        },
      });
    }

    filters.gender?.forEach((g) => {
      chips.push({
        label: t(`filters.${g}`),
        onRemove: () => {
          const next = { ...filters, gender: filters.gender?.filter((item) => item !== g) };
          handleFilterChange(next);
        },
      });
    });

    filters.scentFamily?.forEach((f) => {
      chips.push({
        label: t(`filters.${f}`),
        onRemove: () => {
          const next = {
            ...filters,
            scentFamily: filters.scentFamily?.filter((item) => item !== f),
          };
          handleFilterChange(next);
        },
      });
    });

    filters.brand?.forEach((b) => {
      chips.push({
        label: b,
        onRemove: () => {
          const next = { ...filters, brand: filters.brand?.filter((item) => item !== b) };
          handleFilterChange(next);
        },
      });
    });

    filters.sizes?.forEach((s) => {
      chips.push({
        label: s,
        onRemove: () => {
          const next = { ...filters, sizes: filters.sizes?.filter((item) => item !== s) };
          handleFilterChange(next);
        },
      });
    });

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      chips.push({
        label: `${formatPrice(filters.minPrice || 120)} - ${formatPrice(filters.maxPrice || 450)}`,
        onRemove: () => {
          const next = { ...filters };
          delete next.minPrice;
          delete next.maxPrice;
          handleFilterChange(next);
        },
      });
    }

    return chips;
  }, [filters, t, formatPrice]);

  // Set document title
  useEffect(() => {
    document.title = `${t('shop.title')} | Maison Rayeha`;
  }, [lang, t]);

  // Lock body scroll when mobile filter drawer or quick view modal is open
  useEffect(() => {
    if (isMobileFiltersOpen || quickViewProduct) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileFiltersOpen, quickViewProduct]);

  const sortOptions: SortDropdownOption[] = useMemo(
    () => [
      { value: 'featured', label: t('sort.featured') },
      { value: 'popular', label: t('sort.popular') },
      { value: 'bestseller', label: t('sort.bestseller') },
      { value: 'newest', label: t('sort.newest') },
      { value: 'price-asc', label: t('sort.priceAsc') },
      { value: 'price-desc', label: t('sort.priceDesc') },
    ],
    [t]
  );

  const breadcrumbJsonLd = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: t('common.home'),
        item: `https://maisonrayeha.com/${lang}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: t('shop.title'),
        item: `https://maisonrayeha.com/${lang}/shop`,
      },
    ],
  }), [lang, t]);

  return (
    <>
      <Seo
        title={t('shop.title')}
        description={t('shop.metaDescription') || (lang === 'fa' ? 'مجموعه دست‌ساز عطرهای نیش میسون رایحه' : 'Explore the handcrafted niche perfume collection by Maison Rayeha.')}
        jsonLd={breadcrumbJsonLd}
      />
      <div className="pt-28 pb-24 bg-[var(--bg-page)] text-[var(--text-primary)]">
      <Container size="xl">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumb
            items={[
              { label: t('common.home'), href: '/' },
              { label: t('shop.breadcrumb'), isCurrent: true },
            ]}
          />
        </div>

        {/* Page Header */}
        <div className="pb-8 mb-8 border-b border-[var(--border)] flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="text-start max-w-2xl">
            <span className="text-xs uppercase tracking-[0.2em] rtl:tracking-normal text-gold font-medium block mb-2">
              {t('shop.eyebrow')}
            </span>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-normal sm:font-medium rtl:font-extrabold rtl:leading-[1.32] text-[var(--text-primary)]">
              {t('shop.title')}
            </h1>
            <p className="mt-2.5 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed rtl:leading-loose font-light">
              {t('shop.subtitle')}
            </p>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeChips.length > 0 && (
          <div className="mb-6 flex items-center flex-wrap gap-2 text-start">
            <span className="text-xs text-muted font-medium me-1">
              {t('filters.active')}:
            </span>
            {activeChips.map((chip, idx) => (
              <Chip key={chip.label + idx} label={chip.label} onRemove={chip.onRemove} />
            ))}
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-muted hover:text-near-black underline ms-2 transition-colors cursor-pointer"
            >
              {t('filters.clearAll')}
            </button>
          </div>
        )}

        {/* Live Result Count Accessibility Region */}
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {liveAnnouncement || `${formatNumber(sortedList.length, { useGrouping: false })} ${t('shop.results')}`}
        </div>

        {/* Main 2-column layout: Desktop Sidebar + Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 xl:gap-12">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-28 bg-ivory-surface p-6 border border-border/80 shadow-2xs">
              <ShopFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onResetFilters={handleResetFilters}
                availableBrands={availableBrands}
                productCounts={productCounts}
              />
            </div>
          </aside>

          {/* Product Grid Area */}
          <main className="lg:col-span-3 flex flex-col justify-start">
            {/* Results count & Sort Toolbar: Visible on both desktop & mobile outside filter drawer */}
            <div className="sticky top-[calc(4rem+env(safe-area-inset-top,0px))] z-10 bg-ivory/95 backdrop-blur-xs py-2 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:static lg:bg-transparent lg:p-0 lg:m-0 flex flex-wrap items-center justify-between gap-3 mb-6 pb-3 border-b border-border/60">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted">
                <span>
                  {t('shop.showing')}{' '}
                  <strong className="text-near-black font-mono font-medium">
                    {formatNumber(Math.min(visibleCount, sortedList.length), { useGrouping: false })}
                  </strong>{' '}
                  {t('shop.of')}{' '}
                  <strong className="text-near-black font-mono font-medium">
                    {formatNumber(sortedList.length, { useGrouping: false })}
                  </strong>{' '}
                  {t('shop.results')}
                </span>
              </div>

              {/* Controls next to result count: Mobile Filter Button + Visible Sort Dropdown */}
              <div className="flex items-center gap-2.5 ms-auto">
                <button
                  type="button"
                  onClick={() => setIsMobileFiltersOpen(true)}
                  className="lg:hidden min-h-[44px] inline-flex items-center gap-2 px-3.5 py-2 border border-border bg-ivory-surface text-xs font-medium text-near-black hover:border-gold-dark transition-colors cursor-pointer rounded-xs shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  aria-label={t('filters.filterButton')}
                >
                  <SlidersHorizontal className="w-4 h-4 stroke-[1.5] text-gold-dark" />
                  <span>{t('filters.filterButton')}</span>
                  {activeChips.length > 0 && (
                    <span className="w-4 h-4 rounded-full bg-gold text-near-black text-[10px] font-mono flex items-center justify-center font-bold">
                      {formatNumber(activeChips.length, { useGrouping: false })}
                    </span>
                  )}
                </button>

                <SortDropdown
                  id="shop-sort-dropdown"
                  value={currentSort}
                  onChange={handleSortChange}
                  options={sortOptions}
                />
              </div>
            </div>

            {/* Loading Skeleton */}
            {isPending || productsLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : sortedList.length === 0 ? (
              /* Empty State */
              <div className="py-20 px-6 text-center border border-dashed border-border/80 bg-ivory-surface rounded-xs shadow-2xs my-4">
                <Sparkles className="w-8 h-8 stroke-[1.5] text-gold-dark mx-auto mb-4" />
                <h3 className="text-lg font-medium text-near-black mb-2">
                  {t('shop.emptyTitle')}
                </h3>
                <p className="text-xs text-muted max-w-md mx-auto mb-6 leading-relaxed">
                  {t('shop.emptyDesc')}
                </p>
                <Button variant="outline" size="md" onClick={handleResetFilters}>
                  {t('shop.resetFilters')}
                </Button>
              </div>
            ) : (
              /* Product Grid: 2-col on mobile (<640px), 3-col on tablet & desktop, 4-col on wide desktop */
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {visibleProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={handleOpenQuickView}
                  />
                ))}
              </div>
            )}

            {/* Load More Button */}
            {!isPending && hasMore && (
              <div className="mt-12 text-center pt-8 border-t border-border/70">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
                  className="px-10"
                >
                  {t('shop.loadMore')}
                </Button>
              </div>
            )}
          </main>
        </div>
      </Container>

      {/* Mobile Filter Slide-Over Drawer */}
      {isMobileFiltersOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('filters.title')}
          className="fixed inset-0 z-50 overflow-hidden bg-near-black/60 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={() => setIsMobileFiltersOpen(false)}
        >
          <div
            className="fixed inset-y-0 end-0 w-[85vw] max-w-xs sm:max-w-sm bg-ivory-surface p-5 sm:p-6 shadow-2xl overflow-y-auto z-50 pb-[max(2rem,env(safe-area-inset-bottom))] animate-in slide-in-from-end duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <ShopFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              availableBrands={availableBrands}
              productCounts={productCounts}
              isMobileDrawer={true}
              onCloseMobileDrawer={() => setIsMobileFiltersOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={quickViewProduct.name[lang]}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-near-black/75 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setQuickViewProduct(null)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-ivory-surface border border-border shadow-2xl p-5 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 text-start rounded-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-3 end-3 min-h-[44px] min-w-[44px] flex items-center justify-center text-muted hover:text-near-black transition-colors rounded-xs border border-transparent hover:border-border cursor-pointer z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              aria-label={t('common.close')}
            >
              <X className="w-5 h-5 stroke-[1.5]" />
            </button>

            {/* Product Image */}
            <div className="aspect-[4/5] bg-ivory-subtle overflow-hidden border border-border/60 rounded-xs relative">
              <img
                src={quickViewProduct.images[0]}
                alt={getLocalized(quickViewProduct.name, lang)}
                loading="lazy"
                referrerPolicy="no-referrer"
                decoding="async"
                className={`w-full h-full object-cover object-center ${
                  !quickViewProduct.inStock ? 'opacity-50 grayscale-[40%]' : ''
                }`}
              />
              {!quickViewProduct.inStock && (
                <div className="absolute inset-0 bg-near-black/35 flex items-center justify-center pointer-events-none p-2">
                  <span className="text-xs font-semibold uppercase bg-near-black/90 text-rose-200 px-2.5 py-1 rounded-xs border border-rose-500/50 shadow-md">
                    {t('product.outOfStock')}
                  </span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-widest rtl:tracking-normal text-gold-dark font-medium">
                  <bdi dir="ltr">{quickViewProduct.brand}</bdi> • {t(`product.${quickViewProduct.gender}`)}
                </span>
                <h3 className="text-xl font-medium rtl:leading-[1.45] text-near-black mt-1">
                  {getLocalized(quickViewProduct.name, lang)}
                </h3>
                <p className="text-xs text-muted mt-0.5 font-light">
                  {getLocalized(quickViewProduct.subtitle, lang)}
                </p>

                <div className="mt-3 text-lg font-semibold text-near-black font-mono">
                  {formatPrice(getSizePrice(quickViewProduct, selectedQuickViewSize))}
                </div>
                {!quickViewProduct.inStock && (
                  <p className="mt-1.5 text-xs font-medium text-rose-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span>{t('product.unavailableNote')}</span>
                  </p>
                )}
                {quickViewProduct.inStock && typeof quickViewProduct.stockQuantity === 'number' && quickViewProduct.stockQuantity > 0 && quickViewProduct.stockQuantity <= 5 && (
                  <p className="mt-1.5 text-xs font-medium text-amber-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>{t('product.limitedStock')}</span>
                  </p>
                )}

                <p className="mt-3 text-xs text-muted leading-relaxed rtl:leading-loose">
                  {getLocalized(quickViewProduct.description, lang)}
                </p>

                {/* Notes */}
                <div className="mt-4 pt-3 border-t border-border/80 space-y-1.5 text-xs">
                  <div>
                    <span className="font-medium text-near-black me-2">
                      {t('bestsellers.topNotes')}:
                    </span>
                    <span className="text-muted">
                      {getLocalized(quickViewProduct.notes.top, lang).join(lang === 'fa' ? '، ' : ', ')}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-near-black me-2">
                      {t('bestsellers.heartNotes')}:
                    </span>
                    <span className="text-muted">
                      {getLocalized(quickViewProduct.notes.heart, lang).join(lang === 'fa' ? '، ' : ', ')}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-near-black me-2">
                      {t('bestsellers.baseNotes')}:
                    </span>
                    <span className="text-muted">
                      {getLocalized(quickViewProduct.notes.base, lang).join(lang === 'fa' ? '، ' : ', ')}
                    </span>
                  </div>
                </div>

                {/* Sizes Selector */}
                <div className="mt-5">
                  <span className="text-xs font-medium text-near-black block mb-2">
                    {t('product.selectSize')}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {quickViewProduct.sizes.map((s) => {
                      const sizeStr = `${s.ml}ml`;
                      return (
                        <button
                          key={sizeStr}
                          type="button"
                          disabled={!quickViewProduct.inStock}
                          onClick={() => setSelectedQuickViewSize(sizeStr)}
                          className={`min-h-[44px] min-w-[54px] px-3.5 py-2 text-xs font-mono font-medium border transition-all rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                            !quickViewProduct.inStock
                              ? 'opacity-40 cursor-not-allowed bg-[var(--bg-surface-raised)] text-[var(--text-secondary)] border-[var(--border)]'
                              : selectedQuickViewSize === sizeStr
                              ? 'bg-[var(--chip-selected-bg)] text-[var(--chip-selected-text)] border-[var(--chip-selected-bg)] shadow-2xs cursor-pointer font-semibold'
                              : 'bg-[var(--bg-surface)] text-[var(--text-primary)] border-[var(--border)] hover:border-gold cursor-pointer'
                          }`}
                        >
                          {sizeStr}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Add to Bag Button */}
              <div className="mt-6 pt-4 border-t border-border">
                <Button
                  variant={!quickViewProduct.inStock ? 'outline' : modalAdded ? 'gold' : 'primary'}
                  size="md"
                  fullWidth
                  className="min-h-[44px]"
                  disabled={!quickViewProduct.inStock}
                  onClick={handleModalAddToCart}
                  leftIcon={
                    !quickViewProduct.inStock ? undefined : modalAdded ? (
                      <Check className="w-4 h-4 stroke-[2]" />
                    ) : (
                      <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
                    )
                  }
                >
                  {!quickViewProduct.inStock
                    ? t('product.outOfStock')
                    : modalAdded
                    ? t('bestsellers.added')
                    : t('bestsellers.quickAdd')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};
