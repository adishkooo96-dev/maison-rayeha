import React, { useState } from 'react';
import { ShoppingBag, Check, Eye } from 'lucide-react';
import { Product } from '../../types';
import { useI18n } from '../../hooks/useI18n';
import { useCartStore } from '../../store/cartStore';
import { getStartingPrice } from '../../lib/products';
import { Badge } from '../ui/Badge';
import { LocaleLink } from '../navigation/LocaleLink';

export interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { lang, t, formatPrice } = useI18n();
  const addItem = useCartStore((state) => state.addItem);
  const [isAdded, setIsAdded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const productUrl = `/${lang}/shop/${product.slug}`;
  const startingPrice = getStartingPrice(product);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.inStock === false) return;
    const defaultSize =
      product.sizes && product.sizes.length > 0 ? `${product.sizes[0].ml}ml` : '50ml';
    addItem(product, defaultSize, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1800);
  };

  const primaryImage = product.images[0];
  const secondaryImage = product.images[1] || product.images[0];

  return (
    <article
      className="group relative flex flex-col h-full bg-ivory border sm:border-[1.5px] border-gold/70 sm:border-gold rounded-[8px] sm:rounded-[10px] shadow-[0_2px_8px_rgba(184,155,94,0.1)] transition-all duration-300 hover:border-gold-light hover:shadow-[0_6px_24px_rgba(184,155,94,0.2)] motion-reduce:transition-none overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image container with subtle zoom and secondary image reveal */}
      <LocaleLink
        to={`/shop/${product.slug}`}
        className="relative aspect-square overflow-hidden bg-ivory-subtle block rounded-t-[7px] sm:rounded-t-[8px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
      >
        {/* Badges */}
        <div className="absolute top-2 start-2 z-10 flex flex-col gap-1 pointer-events-none">
          {!product.inStock && (
            <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider rtl:tracking-normal bg-rose-950/90 backdrop-blur-xs text-rose-200 border border-rose-500/50 rounded-xs shadow-xs">
              {t('product.outOfStock')}
            </span>
          )}
          {product.inStock && typeof product.stockQuantity === 'number' && product.stockQuantity > 0 && product.stockQuantity <= 5 && (
            <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold tracking-wider rtl:tracking-normal bg-amber-950/90 backdrop-blur-xs text-amber-200 border border-amber-500/50 rounded-xs shadow-xs">
              {t('product.limitedStock')}
            </span>
          )}
          {product.inStock && product.isBestseller && (
            <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider rtl:tracking-normal bg-gold text-near-black rounded-xs shadow-xs">
              {t('product.bestseller')}
            </span>
          )}
          {product.inStock && product.isNew && (
            <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider rtl:tracking-normal bg-near-black text-ivory rounded-xs shadow-xs">
              {t('product.new')}
            </span>
          )}
        </div>

        {/* Dim overlay for out-of-stock */}
        {!product.inStock && (
          <>
            <div className="absolute inset-0 z-[5] bg-near-black/40 backdrop-grayscale-[35%] pointer-events-none" />
            <div className="absolute inset-0 z-[6] flex items-center justify-center p-2 pointer-events-none">
              <span className="px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wider rtl:tracking-normal bg-near-black/90 backdrop-blur-xs text-rose-200 border border-rose-500/60 rounded-xs shadow-md">
                {t('product.outOfStock')}
              </span>
            </div>
          </>
        )}

        {/* Primary Image */}
        <img
          src={primaryImage}
          alt={`${product.name[lang]} - ${product.brand}`}
          loading="lazy"
          width="400"
          height="400"
          referrerPolicy="no-referrer"
          decoding="async"
          className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-out motion-reduce:transition-none ${
            !product.inStock ? 'opacity-50' : isHovered ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
          }`}
        />

        {/* Secondary Hover Image */}
        <img
          src={secondaryImage}
          alt={`${product.name[lang]} alternate view`}
          loading="lazy"
          width="400"
          height="400"
          referrerPolicy="no-referrer"
          decoding="async"
          className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-out motion-reduce:transition-none ${
            !product.inStock ? 'opacity-0' : isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
          }`}
        />

        {/* Quick action overlay - visible on touch/mobile, hover-activated on sm+ */}
        <div className="absolute inset-x-1.5 sm:inset-x-2.5 bottom-1.5 sm:bottom-2.5 z-10 flex gap-1 sm:gap-1.5 opacity-100 sm:opacity-0 sm:translate-y-2 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 transition-all duration-300 motion-reduce:transition-none">
          {!product.inStock ? (
            <div
              className="flex-1 min-h-[34px] sm:min-h-[38px] py-1 px-1.5 sm:px-2 flex items-center justify-center gap-1 text-[10px] sm:text-xs font-semibold tracking-wide rtl:tracking-normal uppercase rounded-xs bg-near-black/85 backdrop-blur-xs text-ivory/60 border border-ivory/15 cursor-not-allowed select-none"
              aria-disabled="true"
            >
              <span className="truncate">{t('product.outOfStock')}</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleQuickAdd}
              aria-label={`${t('bestsellers.quickAdd')}: ${product.name[lang]}`}
              className={`flex-1 min-h-[34px] sm:min-h-[38px] py-1 px-1.5 sm:px-2 flex items-center justify-center gap-1 text-[10px] sm:text-xs font-medium tracking-wide rtl:tracking-normal uppercase transition-colors duration-200 cursor-pointer rounded-xs shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                isAdded
                  ? 'bg-gold text-near-black'
                  : 'bg-near-black/90 backdrop-blur-xs text-ivory hover:bg-gold hover:text-near-black'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2] shrink-0" aria-hidden="true" />
                  <span className="truncate">{t('bestsellers.added')}</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[1.5] shrink-0" aria-hidden="true" />
                  <span className="truncate">{t('bestsellers.quickAdd')}</span>
                </>
              )}
            </button>
          )}

          {onQuickView && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(product);
              }}
              aria-label={`${t('bestsellers.viewDetails')}: ${product.name[lang]}`}
              className="min-h-[34px] min-w-[34px] sm:min-h-[38px] sm:min-w-[38px] p-1.5 bg-ivory-surface/90 backdrop-blur-xs text-near-black hover:text-gold-dark hover:bg-ivory border border-border/80 transition-colors flex items-center justify-center cursor-pointer rounded-xs shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold shrink-0"
            >
              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[1.5]" aria-hidden="true" />
            </button>
          )}
        </div>
      </LocaleLink>

      {/* Product Details */}
      <div className="p-2.5 sm:p-3.5 md:p-4 flex flex-col flex-1 justify-between text-start">
        <div>
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-muted mb-1 gap-1">
            <span className="tracking-widest rtl:tracking-normal uppercase font-normal text-muted truncate">
              <bdi dir="ltr">{product.brand}</bdi>
            </span>
            <span className="uppercase tracking-wider rtl:tracking-normal font-medium text-gold-dark shrink-0">
              {t(`product.${product.gender}`)}
            </span>
          </div>

          <LocaleLink
            to={`/shop/${product.slug}`}
            className="block group-hover:text-gold-dark transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold rounded-[4px]"
          >
            <h3 className="text-xs sm:text-sm md:text-base font-semibold rtl:font-bold text-near-black transition-colors group-hover:text-gold-dark leading-snug truncate">
              {product.name[lang]}
            </h3>
          </LocaleLink>

          <p className="text-[10px] sm:text-xs text-muted truncate mt-0.5 font-light leading-normal">
            {product.subtitle[lang]}
          </p>
        </div>

        {/* Olfactory Highlights & Price */}
        <div className="mt-2 sm:mt-3 pt-2 sm:pt-2.5 border-t border-border/60 flex items-center justify-between gap-1">
          <div className="hidden sm:block text-[10px] sm:text-[11px] text-muted/90 truncate pe-1">
            <span className="text-near-black/80 font-normal">
              {product.notes.heart[lang].slice(0, 2).join(lang === 'fa' ? '، ' : ', ')}
            </span>
          </div>

          <div className="text-xs sm:text-sm font-mono font-semibold text-near-black whitespace-nowrap shrink-0 ms-auto">
            {formatPrice(startingPrice)}
          </div>
        </div>
      </div>
    </article>
  );
};

