import React, { useEffect } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, ArrowLeft, ShieldCheck, Sparkles, AlertTriangle } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useI18n } from '../../hooks/useI18n';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import { LocaleLink, useLocaleNavigate } from '../navigation/LocaleLink';
import { CartItem } from '../../types';

export const CartDrawer: React.FC = () => {
  const { isCartOpen, closeCart, items, updateQuantity, removeItem, restoreItem, getSubtotal } = useCartStore();
  const { lang, isRTL, t, formatPrice, getLocalized, formatNumber } = useI18n();
  const { showToast } = useToast();
  const localeNavigate = useLocaleNavigate();

  const handleRemove = (item: CartItem) => {
    removeItem(item.product.id, item.size);
    showToast({
      message: t('cartPage.itemRemoved', { name: getLocalized(item.product.name, lang) ?? '' }),
      type: 'info',
      action: {
        label: t('cartPage.undo'),
        onClick: () => {
          restoreItem(item);
        },
      },
    });
  };

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartOpen) {
        closeCart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, closeCart]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  const subtotal = getSubtotal(lang);
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  if (!isCartOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('cart.title')}
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-near-black/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer panel positioned on logical 'end' side */}
      <div className="fixed inset-y-0 end-0 flex max-w-full">
        <div className="w-screen max-w-md bg-ivory-surface border-s border-border shadow-2xl flex flex-col justify-between animate-in slide-in-from-end duration-300">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-gold-dark stroke-[1.5]" aria-hidden="true" />
              <h2 className="text-lg font-medium text-near-black font-display">
                {t('cart.title')}
              </h2>
              <span className="text-xs text-muted bg-ivory-subtle px-2 py-0.5 rounded-xs">
                {formatNumber(items.reduce((sum, item) => sum + item.quantity, 0), { useGrouping: false })}
              </span>
            </div>

            <button
              type="button"
              onClick={closeCart}
              aria-label={t('common.close')}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted hover:text-near-black transition-colors rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>

          {/* Complimentary Shipping Notice Banner */}
          <div className="bg-ivory-subtle/80 px-4 sm:px-6 py-2.5 border-b border-border/60 flex items-center gap-2 text-xs text-near-black/80">
            <Sparkles className="w-4 h-4 text-gold-dark stroke-[1.5] shrink-0" aria-hidden="true" />
            <span>{t('cart.shippingNote')}</span>
          </div>

          {/* Cart Items List or Empty State */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 divide-y divide-border/60">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-ivory-subtle flex items-center justify-center text-muted mb-4 border border-border shadow-2xs">
                  <ShoppingBag className="w-7 h-7 text-gold-dark stroke-[1.5]" />
                </div>
                <h3 className="text-base font-medium text-near-black">
                  {t('cart.empty')}
                </h3>
                <p className="text-xs text-muted max-w-xs mt-1.5 leading-relaxed">
                  {t('cart.emptyPrompt')}
                </p>
                <Button
                  variant="primary"
                  size="md"
                  className="mt-6 min-h-[44px]"
                  onClick={() => {
                    closeCart();
                    localeNavigate('/shop');
                  }}
                >
                  {t('cart.exploreShop')}
                </Button>
              </div>
            ) : (
              items.map((item) => {
                const priceObj = item.unitPrice || item.product?.price;
                const itemPrice = getLocalized(priceObj, lang) ?? 0;
                const productName = getLocalized(item.product.name, lang) ?? '';
                const isOutOfStock = item.product?.inStock === false;

                return (
                  <div key={`${item.product.id}-${item.size}`} className="py-4 first:pt-0 last:pb-0 flex gap-3 sm:gap-4">
                    {/* Thumbnail */}
                    <LocaleLink
                      to={`/shop/${item.product.slug}`}
                      onClick={closeCart}
                      className="w-18 sm:w-20 h-22 sm:h-24 bg-ivory-subtle border border-border/80 rounded-xs shrink-0 overflow-hidden relative block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                    >
                      <img
                        src={item.product.images[0]}
                        alt={productName}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        decoding="async"
                        className={`w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300 motion-reduce:transform-none ${
                          isOutOfStock ? 'opacity-50 grayscale-[40%]' : ''
                        }`}
                      />
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-near-black/30 flex items-center justify-center pointer-events-none">
                          <span className="text-[9px] font-semibold uppercase bg-near-black/90 text-rose-200 px-1 py-0.5 rounded-xs">
                            {t('product.outOfStock')}
                          </span>
                        </div>
                      )}
                    </LocaleLink>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between text-start min-w-0">
                      <div>
                        <div className="flex justify-between items-start gap-1">
                          <LocaleLink
                            to={`/shop/${item.product.slug}`}
                            onClick={closeCart}
                            className="hover:text-gold-dark transition-colors truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-xs"
                          >
                            <h4 className="text-sm font-medium text-near-black truncate">
                              {productName}
                            </h4>
                          </LocaleLink>
                          <button
                            type="button"
                            onClick={() => handleRemove(item)}
                            aria-label={`${t('cart.remove')} ${productName}`}
                            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-xs transition-colors cursor-pointer shrink-0 -me-2 -mt-2"
                          >
                            <Trash2 className="w-4 h-4 stroke-[1.5]" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-mono text-gold-dark font-medium bg-gold/10 px-2 py-0.5 rounded-xs">
                            {item.size}
                          </span>
                          <span className="text-xs text-muted">
                            {formatPrice(itemPrice)}
                          </span>
                        </div>

                        {isOutOfStock && (
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold bg-rose-100 text-rose-800 border border-rose-300 rounded-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                              {t('cart.noLongerAvailable')}
                            </span>
                          </div>
                        )}

                        {!isOutOfStock &&
                          typeof item.product?.stockQuantity === 'number' &&
                          item.product.stockQuantity > 0 &&
                          item.product.stockQuantity <= 5 && (
                            <div className="mt-1 flex items-center gap-1">
                              <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-xs font-mono">
                                {t('product.limitedStock')}
                              </span>
                            </div>
                          )}
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        {/* Quantity Selector */}
                        <div className="flex items-center border border-border bg-ivory rounded-xs shadow-2xs">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.product.id, item.size, item.quantity - 1)
                            }
                            aria-label="Decrease quantity"
                            className="min-h-[38px] min-w-[38px] flex items-center justify-center text-muted hover:text-near-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-xs transition-colors disabled:opacity-30 cursor-pointer"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3.5 h-3.5 stroke-[1.5]" />
                          </button>
                          <span className="px-2 text-xs font-medium text-near-black">
                            {formatNumber(item.quantity, { useGrouping: false })}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.product.id, item.size, item.quantity + 1)
                            }
                            aria-label="Increase quantity"
                            disabled={
                              typeof item.product?.stockQuantity === 'number' &&
                              item.product.stockQuantity > 0 &&
                              item.quantity >= item.product.stockQuantity
                            }
                            className="min-h-[38px] min-w-[38px] flex items-center justify-center text-muted hover:text-near-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-xs transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[1.5]" />
                          </button>
                        </div>

                        {/* Line item total */}
                        <span className="text-sm font-medium font-mono text-near-black">
                          {formatPrice(itemPrice * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer / Subtotal & Actions */}
          {items.length > 0 && (
            <div className="p-4 sm:p-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] border-t border-border bg-ivory-subtle/50 flex flex-col gap-3 sm:gap-4">
              {items.some((it) => it.product?.inStock === false) && (
                <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 text-xs rounded-xs flex items-start gap-2 animate-in fade-in duration-200">
                  <AlertTriangle className="w-4 h-4 stroke-[1.75] text-rose-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{t('cart.outOfStockWarning')}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-sm">
                <span className="text-muted">{t('cart.subtotal')}</span>
                <span className="text-lg font-semibold font-mono text-near-black">
                  {formatPrice(subtotal)}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-muted">
                <ShieldCheck className="w-4 h-4 stroke-[1.5] text-gold-dark shrink-0" aria-hidden="true" />
                <span>{t('common.luxuryPackaging')}</span>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  disabled={items.some((it) => it.product?.inStock === false)}
                  className="min-h-[44px]"
                  rightIcon={<ArrowIcon className="w-4 h-4 stroke-[1.5]" />}
                  onClick={() => {
                    closeCart();
                    localeNavigate('/checkout');
                  }}
                >
                  {t('cart.checkout')}
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  fullWidth
                  className="min-h-[44px]"
                  onClick={() => {
                    closeCart();
                    localeNavigate('/cart');
                  }}
                >
                  {t('cart.viewCart')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
