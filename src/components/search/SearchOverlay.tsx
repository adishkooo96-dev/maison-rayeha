import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, ArrowLeft, Sparkles, Tag } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';
import { products as initialProducts } from '../../data/products';
import { getAllProducts } from '../../lib/productsApi';
import { searchProducts, getStartingPrice } from '../../lib/products';
import { Product } from '../../types';
import { useLocaleNavigate } from '../navigation/LocaleLink';

export interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
  const { lang, isRTL, t, formatPrice } = useI18n();
  const localeNavigate = useLocaleNavigate();
  const [query, setQuery] = useState('');
  const [productList, setProductList] = useState<Product[]>(initialProducts);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Focus input and fetch latest products on open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      getAllProducts().then((data) => {
        if (data && data.length > 0) setProductList(data);
      }).catch(() => {});

      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
      };
    } else {
      document.body.style.overflow = '';
      setQuery('');
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const results: Product[] = query.trim().length > 0 ? searchProducts(productList, query, lang).slice(0, 6) : [];

  const handleSelectProduct = (product: Product) => {
    onClose();
    localeNavigate(`/shop/${product.slug}`);
  };

  const handleViewAll = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    onClose();
    localeNavigate(`/shop?q=${encodeURIComponent(query.trim())}`);
  };

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const trendingQueries = [
    t('searchOverlay.trending1'),
    t('searchOverlay.trending2'),
    t('searchOverlay.trending3'),
    t('searchOverlay.trending4'),
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('searchOverlay.title')}
      className="fixed inset-0 z-50 overflow-y-auto bg-near-black/60 backdrop-blur-md transition-all duration-300 animate-in fade-in"
      onClick={onClose}
    >
      <div
        ref={overlayRef}
        className="min-h-screen sm:min-h-[500px] w-full max-w-4xl mx-auto bg-ivory-surface border-b sm:border-x sm:border-b border-border shadow-2xl p-4 sm:p-10 pb-[max(2rem,env(safe-area-inset-bottom))] text-start flex flex-col justify-start"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar with close button */}
        <div className="flex items-center justify-between pb-4 sm:pb-6 border-b border-border/80">
          <div className="flex items-center gap-2 text-gold-dark text-xs uppercase tracking-widest font-medium">
            <Sparkles className="w-4 h-4 stroke-[1.5]" aria-hidden="true" />
            <span>{t('searchOverlay.title')}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted hover:text-near-black transition-colors rounded-xs border border-transparent hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {/* Input box */}
        <form onSubmit={handleViewAll} className="mt-6 sm:mt-8 relative">
          <div className="relative flex items-center border-b-2 border-near-black/80 focus-within:border-gold transition-colors pb-2">
            <Search className="w-6 h-6 text-gold-dark stroke-[1.5] shrink-0 me-3" aria-hidden="true" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('searchOverlay.placeholder')}
              className="w-full bg-transparent text-base sm:text-2xl font-light text-near-black placeholder:text-muted/60 focus:outline-none min-h-[44px]"
              aria-label={t('searchOverlay.title')}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted hover:text-near-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-xs transition-colors cursor-pointer"
                aria-label="Clear query"
              >
                <X className="w-4 h-4 stroke-[1.5]" />
              </button>
            )}
          </div>
        </form>

        {/* Trending tags */}
        {!query && (
          <div className="mt-8 pt-4">
            <div className="flex items-center gap-2 text-xs text-muted font-medium mb-3">
              <Tag className="w-3.5 h-3.5 text-gold-dark stroke-[1.5]" aria-hidden="true" />
              <span>{t('searchOverlay.trending')}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {trendingQueries.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setQuery(tag)}
                  className="min-h-[40px] flex items-center text-xs bg-ivory text-near-black border border-border/80 px-3.5 py-1.5 rounded-xs shadow-2xs hover:border-gold hover:text-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold transition-colors cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Live results */}
        {query.trim().length > 0 && (
          <div className="mt-6 sm:mt-8 space-y-4 flex-1">
            <div className="flex items-center justify-between text-xs text-muted pb-2 border-b border-border/60">
              <span>{t('searchOverlay.liveResults')}</span>
              {results.length > 0 && (
                <button
                  type="button"
                  onClick={handleViewAll}
                  className="min-h-[44px] inline-flex items-center gap-1.5 text-gold-dark hover:text-gold font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-xs"
                >
                  <span>{t('searchOverlay.viewAll')} "{query}"</span>
                  <ArrowIcon className="w-3.5 h-3.5 stroke-[1.5]" />
                </button>
              )}
            </div>

            {results.length === 0 ? (
              <div className="py-12 text-center text-muted">
                <p className="text-sm font-light">{t('searchOverlay.noResults')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {results.map((product) => {
                  const startingPrice = getStartingPrice(product);

                  return (
                    <div
                      key={product.id}
                      onClick={() => handleSelectProduct(product)}
                      className="group flex gap-3 sm:gap-4 p-3 border border-border/70 bg-ivory hover:border-gold/60 hover:shadow-2xs transition-all cursor-pointer rounded-xs"
                    >
                      <div className="w-16 h-20 bg-ivory-subtle shrink-0 overflow-hidden relative border border-border/40 rounded-xs">
                        <img
                          src={product.images[0]}
                          alt={product.name[lang]}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          decoding="async"
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 motion-reduce:transform-none"
                        />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <span className="text-[10px] text-gold-dark uppercase tracking-widest font-medium">
                          {product.brand}
                        </span>
                        <h4 className="text-sm font-medium text-near-black group-hover:text-gold-dark transition-colors truncate">
                          {product.name[lang]}
                        </h4>
                        <p className="text-xs text-muted line-clamp-1 mt-0.5">
                          {product.subtitle[lang]}
                        </p>
                        <div className="mt-1 text-xs font-semibold text-near-black font-mono">
                          {formatPrice(startingPrice)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
