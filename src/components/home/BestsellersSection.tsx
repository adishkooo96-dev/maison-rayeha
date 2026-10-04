import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, X, Sparkles, ShoppingBag, Check } from 'lucide-react';
import { products as initialProducts } from '../../data/products';
import { getAllProducts, subscribeToProducts } from '../../lib/productsApi';
import { Product } from '../../types';
import { useI18n } from '../../hooks/useI18n';
import { useCartStore } from '../../store/cartStore';
import { getSizePrice } from '../../lib/products';
import { Container } from '../ui/Container';
import { SectionHeading } from '../ui/SectionHeading';
import { ProductCard } from '../product/ProductCard';
import { ProductCardSkeleton } from '../ui/Skeleton';
import { Button } from '../ui/Button';
import { LocaleLink } from '../navigation/LocaleLink';

export const BestsellersSection: React.FC = () => {
  const { lang, isRTL, t, formatPrice } = useI18n();
  const addItem = useCartStore((state) => state.addItem);
  const [productList, setProductList] = useState<Product[]>(initialProducts);
  const [filter, setFilter] = useState<'all' | 'bestseller' | 'new' | 'unisex'>('all');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [modalAdded, setModalAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('50ml');

  useEffect(() => {
    const unsub = subscribeToProducts((data) => {
      if (data && data.length > 0) {
        setProductList(data);
      }
    });
    return () => unsub();
  }, []);

  const filteredProducts = productList.filter((p) => {
    if (filter === 'bestseller') return p.isBestseller;
    if (filter === 'new') return p.isNew;
    if (filter === 'unisex') return p.gender === 'unisex';
    return true;
  });

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const handleOpenQuickView = (product: Product) => {
    setQuickViewProduct(product);
    const initialSize = product.sizes && product.sizes.length > 0 ? `${product.sizes[0].ml}ml` : '50ml';
    setSelectedSize(initialSize);
    setModalAdded(false);
  };

  const handleModalAddToCart = () => {
    if (!quickViewProduct || quickViewProduct.inStock === false) return;
    addItem(quickViewProduct, selectedSize, 1);
    setModalAdded(true);
    setTimeout(() => {
      setModalAdded(false);
      setQuickViewProduct(null);
    }, 1200);
  };

  return (
    <section
      id="bestsellers-section"
      className="py-16 sm:py-24 bg-ivory text-near-black"
      aria-labelledby="bestsellers-heading"
    >
      <Container size="lg">
        <SectionHeading
          eyebrow={t('bestsellers.eyebrow')}
          title={t('bestsellers.title')}
          subtitle={t('bestsellers.subtitle')}
        />

        {/* Filter Pills - single-line horizontally scrollable on mobile, centered on desktop */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto flex-nowrap gap-2.5 mb-10 sm:mb-12 pb-2 sm:pb-0 px-4 sm:px-0 -mx-4 sm:mx-0 scrollbar-none">
          {[
            { id: 'all', label: t('bestsellers.tabAll') },
            { id: 'bestseller', label: t('bestsellers.tabBestseller') },
            { id: 'new', label: t('bestsellers.tabNew') },
            { id: 'unisex', label: t('bestsellers.tabUnisex') },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id as any)}
              className={`px-5 py-2.5 text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer rounded-[8px] border shrink-0 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                filter === tab.id
                  ? 'bg-near-black text-ivory border-near-black font-semibold shadow-xs'
                  : 'bg-ivory-subtle text-muted hover:text-near-black border-border hover:border-gold-dark hover:shadow-2xs'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Products Grid: 2-col on mobile (<640px), 3-col on tablet (640-1024px), 4-col on desktop (1024px+) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={handleOpenQuickView}
            />
          ))}
        </div>

        {/* Bottom Callout / Full Gallery Link */}
        <div className="mt-14 sm:mt-16 text-center">
          <LocaleLink
            to="/shop?sort=bestseller"
            className="inline-flex items-center gap-3 text-xs sm:text-sm uppercase tracking-widest font-medium text-near-black hover:text-gold-dark transition-colors group pb-1 border-b border-near-black/20 hover:border-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-xs"
          >
            <span>{t('bestsellers.viewAll')}</span>
            <ArrowIcon className="w-4 h-4 stroke-[1.5] transition-transform duration-300 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
          </LocaleLink>
        </div>
      </Container>

      {/* Quick View Olfactory Modal */}
      {quickViewProduct && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={quickViewProduct.name[lang]}
          className="fixed inset-0 z-50 bg-near-black/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
        >
          <div
            className="bg-ivory-surface w-full max-w-2xl border-2 border-gold shadow-2xl relative flex flex-col md:flex-row overflow-hidden rounded-[12px] animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setQuickViewProduct(null)}
              aria-label={t('common.close')}
              className="absolute top-4 end-4 z-10 min-h-[44px] min-w-[44px] flex items-center justify-center bg-ivory/80 text-near-black hover:text-gold-dark transition-colors rounded-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <X className="w-5 h-5 stroke-[1.5]" />
            </button>

            {/* Image Side */}
            <div className="md:w-1/2 bg-ivory-subtle relative aspect-square md:aspect-auto overflow-hidden">
              <img
                src={quickViewProduct.images[0]}
                alt={quickViewProduct.name[lang]}
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

            {/* Info Side */}
            <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between text-start">
              <div>
                <span className="text-xs uppercase tracking-widest text-gold-dark font-medium block mb-1">
                  {quickViewProduct.brand} • {t(`product.${quickViewProduct.gender}`)}
                </span>

                <h3 className="text-2xl font-light font-display text-near-black">
                  {quickViewProduct.name[lang]}
                </h3>

                <p className="text-xs text-muted mt-1">
                  {quickViewProduct.subtitle[lang]}
                </p>

                <div className="mt-3 text-lg font-mono font-semibold text-near-black">
                  {formatPrice(getSizePrice(quickViewProduct, selectedSize))}
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

                <p className="mt-3 text-xs text-muted leading-relaxed">
                  {quickViewProduct.description[lang]}
                </p>

                {/* Olfactory Pyramids */}
                <div className="mt-4 pt-4 border-t border-border/80 space-y-2 text-xs">
                  <div>
                    <span className="font-semibold text-near-black me-2">
                      {t('bestsellers.topNotes')}:
                    </span>
                    <span className="text-muted">
                      {quickViewProduct.notes.top[lang].join('، ')}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-near-black me-2">
                      {t('bestsellers.heartNotes')}:
                    </span>
                    <span className="text-muted">
                      {quickViewProduct.notes.heart[lang].join('، ')}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-near-black me-2">
                      {t('bestsellers.baseNotes')}:
                    </span>
                    <span className="text-muted">
                      {quickViewProduct.notes.base[lang].join('، ')}
                    </span>
                  </div>
                </div>

                {/* Sizes Selector */}
                <div className="mt-5">
                  <span className="text-xs font-medium text-near-black block mb-2">
                    {t('product.selectSize')}
                  </span>
                  <div className="flex gap-2">
                    {quickViewProduct.sizes.map((s) => {
                      const sizeStr = `${s.ml}ml`;
                      return (
                        <button
                          key={sizeStr}
                          type="button"
                          disabled={!quickViewProduct.inStock}
                          onClick={() => setSelectedSize(sizeStr)}
                          className={`min-h-[38px] px-3.5 py-1.5 text-xs font-mono font-medium rounded-xs border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                            !quickViewProduct.inStock
                              ? 'opacity-40 cursor-not-allowed bg-ivory text-muted border-border'
                              : selectedSize === sizeStr
                              ? 'bg-near-black text-ivory border-near-black shadow-2xs cursor-pointer'
                              : 'bg-ivory text-near-black border-border hover:border-gold-dark cursor-pointer'
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
    </section>
  );
};
