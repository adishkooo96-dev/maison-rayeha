import React, { useState } from 'react';
import { Seo } from '../components/seo/Seo';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Tag,
  ShieldCheck,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useI18n } from '../hooks/useI18n';
import { Container } from '../components/ui/Container';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useToast } from '../components/ui/Toast';
import { LocaleLink, useLocaleNavigate } from '../components/navigation/LocaleLink';
import { validateCouponInFirestore } from '../lib/couponsApi';
import { getSizePrice } from '../lib/products';
import { CartItem } from '../types';

export const CartPage: React.FC = () => {
  const { lang, isRTL, t, formatPrice, getLocalized, formatPercent, formatNumber } = useI18n();
  const {
    items,
    updateQuantity,
    removeItem,
    restoreItem,
    clearCart,
    coupon,
    setCoupon,
    removeCoupon,
    getTotals,
    hasOutOfStockItems,
    removeOutOfStockItems,
  } = useCartStore();
  const { showToast } = useToast();
  const localeNavigate = useLocaleNavigate();

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState<boolean>(false);

  const totals = getTotals(lang);
  const hasOutOfStock = hasOutOfStockItems();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const handleApplyCoupon = async (e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    const cleanCode = couponCodeInput.trim().toUpperCase();
    if (!cleanCode || isApplyingCoupon) return;

    setCouponError(null);
    setIsApplyingCoupon(true);

    try {
      const currentSubtotal = totals.subtotal;
      const result = await validateCouponInFirestore(cleanCode, currentSubtotal, lang);
      if (result.valid && result.coupon) {
        setCoupon(result.coupon);
        setCouponCodeInput('');
        const discountLabel = result.coupon.type === 'fixed'
          ? formatPrice(result.coupon.value || 0)
          : formatPercent(result.coupon.value || result.coupon.discountPercent || 0);
        showToast({
          message: lang === 'fa'
            ? `کد تخفیف با موفقیت اعمال شد (${discountLabel} تخفیف)`
            : `Discount code applied (${discountLabel} discount)`,
          type: 'success',
        });
      } else {
        const errorText = result.errorMessage
          ? (getLocalized(result.errorMessage, lang) ?? (lang === 'fa' ? 'کد تخفیف نامعتبر است.' : 'Invalid coupon code.'))
          : (lang === 'fa' ? 'کد تخفیف نامعتبر است.' : 'Invalid coupon code.');
        setCouponError(errorText);
      }
    } catch (err: any) {
      setCouponError(lang === 'fa' ? 'خطا در بررسی کد تخفیف.' : 'Error checking coupon code.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveItem = (item: CartItem) => {
    const productName = getLocalized(item.product.name, lang) ?? '';
    removeItem(item.product.id, item.size);
    showToast({
      message: t('cartPage.itemRemoved', { name: productName }),
      type: 'info',
      action: {
        label: t('cartPage.undo'),
        onClick: () => {
          restoreItem(item);
        },
      },
    });
  };

  const handleClearCart = () => {
    if (window.confirm(t('cartPage.clearCartConfirm'))) {
      clearCart();
    }
  };

  const breadcrumbs = [
    { label: t('common.home'), href: '/' },
    { label: t('cartPage.breadcrumb') },
  ];

  return (
    <>
      <Seo title={t('cartPage.title')} noindex={true} />

      <div className="py-8 sm:py-12 pb-[max(7rem,calc(6rem+env(safe-area-inset-bottom)))] lg:pb-12 bg-ivory">
        <Container>
          <Breadcrumb items={breadcrumbs} className="mb-6" />

          {/* Heading */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-border">
            <div>
              <h1 className="text-2xl sm:text-3xl font-display text-near-black">
                {t('cartPage.title')}
              </h1>
              <p className="text-xs sm:text-sm text-muted mt-1 font-light">
                {t('cart.shippingNote')}
              </p>
            </div>
            {items.length > 0 && (
              <button
                type="button"
                onClick={handleClearCart}
                className="text-xs text-muted hover:text-red-600 transition-colors self-start sm:self-auto flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-xs px-1"
              >
                <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
                <span>{t('cartPage.clearCart')}</span>
              </button>
            )}
          </div>

          {items.length === 0 ? (
            /* Empty State */
            <div className="py-20 px-6 text-center flex flex-col items-center justify-center border border-dashed border-border/80 bg-ivory-surface rounded-xs shadow-2xs my-6">
              <div className="w-20 h-20 rounded-full bg-ivory-subtle flex items-center justify-center text-muted mb-5 border border-border">
                <ShoppingBag className="w-8 h-8 stroke-[1.5] text-gold-dark" />
              </div>
              <h2 className="text-xl font-display text-near-black mb-2">
                {t('cart.empty')}
              </h2>
              <p className="text-sm text-muted max-w-md mb-8 leading-relaxed font-light">
                {t('cart.emptyPrompt')}
              </p>
              <Button
                variant="primary"
                size="md"
                onClick={() => localeNavigate('/shop')}
                rightIcon={<ArrowIcon className="w-4 h-4 stroke-[1.5]" />}
              >
                {t('cart.exploreShop')}
              </Button>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Line Items (8 Cols) */}
              <div className="lg:col-span-8 space-y-6">
                {/* Free Shipping Progress Card */}
                <div className="p-4 sm:p-5 bg-ivory-surface border border-border rounded-xs shadow-2xs">
                  <div className="flex items-center gap-2 mb-2 text-xs font-medium text-near-black">
                    <Sparkles className="w-4 h-4 stroke-[1.5] text-gold-dark shrink-0" aria-hidden="true" />
                    <span>
                      {totals.isEligibleForFreeShipping
                        ? t('cartPage.freeShippingQualified')
                        : t('cartPage.freeShippingRemaining', {
                            amount: formatPrice(totals.amountNeededForFreeShipping),
                          })}
                    </span>
                  </div>
                  <ProgressBar value={totals.freeShippingProgress} />
                </div>

                {/* Out of Stock Alert Banner */}
                {hasOutOfStockItems() && (
                  <div className="p-4 bg-rose-50 border border-rose-300 text-rose-900 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200 shadow-2xs">
                    <div className="flex items-start sm:items-center gap-2.5">
                      <AlertCircle className="w-5 h-5 stroke-[1.75] text-rose-600 shrink-0 mt-0.5 sm:mt-0" />
                      <span className="text-xs sm:text-sm font-medium leading-relaxed">
                        {t('cart.outOfStockWarning')}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={removeOutOfStockItems}
                      className="border-rose-300 text-rose-800 hover:bg-rose-100 shrink-0 self-start sm:self-auto cursor-pointer"
                    >
                      {t('cart.removeOutOfStock')}
                    </Button>
                  </div>
                )}

                {/* Items Table / Cards */}
                <div className="bg-ivory-surface border border-border rounded-xs shadow-2xs divide-y divide-border/60">
                  {items.map((item) => {
                    const priceObj = item.unitPrice || getSizePrice(item.product, item.size);
                    const unitPrice = getLocalized(priceObj, lang) ?? 0;
                    const lineTotal = unitPrice * item.quantity;
                    const productName = getLocalized(item.product.name, lang) ?? '';
                    const productSubtitle = getLocalized(item.product.subtitle, lang) ?? '';
                    const isOutOfStock = item.product?.inStock === false;

                    return (
                      <div
                        key={`${item.product.id}-${item.size}`}
                        className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                          isOutOfStock ? 'bg-rose-50/30' : ''
                        }`}
                      >
                        {/* Image + Info */}
                        <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
                          <LocaleLink
                            to={`/shop/${item.product.slug}`}
                            className="w-18 sm:w-20 h-22 sm:h-24 bg-ivory-subtle border border-border/80 shrink-0 overflow-hidden relative block group rounded-xs"
                          >
                            <img
                              src={item.product.images[0]}
                              alt={productName}
                              loading="lazy"
                              referrerPolicy="no-referrer"
                              decoding="async"
                              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                                isOutOfStock ? 'opacity-50 grayscale-[40%]' : ''
                              }`}
                            />
                            {isOutOfStock && (
                              <div className="absolute inset-0 bg-near-black/35 flex items-center justify-center pointer-events-none p-1">
                                <span className="text-[9px] sm:text-[10px] font-semibold uppercase bg-near-black/90 text-rose-200 px-1.5 py-0.5 rounded-xs text-center">
                                  {t('product.outOfStock')}
                                </span>
                              </div>
                            )}
                          </LocaleLink>

                          <div className="min-w-0 text-start flex-1">
                            <span className="text-[10px] uppercase font-mono text-muted tracking-wider">
                              {item.product.brand}
                            </span>
                            <LocaleLink
                              to={`/shop/${item.product.slug}`}
                              className="hover:text-gold transition-colors block"
                            >
                              <h3 className="text-sm sm:text-base font-medium text-near-black truncate font-display">
                                {productName}
                              </h3>
                            </LocaleLink>
                            <p className="text-xs text-muted truncate mt-0.5 font-light">
                              {productSubtitle}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs font-mono text-gold-dark bg-gold/10 px-2 py-0.5 rounded-xs">
                                {item.size}
                              </span>
                              <span className="text-xs text-muted">
                                {formatPrice(unitPrice)}
                              </span>
                            </div>
                            {isOutOfStock && (
                              <div className="mt-2 flex items-center gap-1.5">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-300 rounded-xs">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                  {t('cart.noLongerAvailable')}
                                </span>
                              </div>
                            )}
                            {!isOutOfStock &&
                              typeof item.product?.stockQuantity === 'number' &&
                              item.product.stockQuantity > 0 &&
                              item.product.stockQuantity <= 5 && (
                                <div className="mt-2 flex items-center gap-1.5">
                                  <span className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-xs font-mono">
                                    {t('product.limitedStock')}
                                  </span>
                                </div>
                              )}
                          </div>
                        </div>

                        {/* Quantity + Line Total + Remove */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-border/40">
                          {/* Quantity selector */}
                          <div className="flex items-center border border-border bg-ivory rounded-xs shadow-2xs">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(item.product.id, item.size, item.quantity - 1)
                              }
                              aria-label="Decrease quantity"
                              className="min-h-[38px] min-w-[38px] flex items-center justify-center text-muted hover:text-near-black transition-colors disabled:opacity-30 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-xs"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-3.5 h-3.5 stroke-[1.5]" />
                            </button>
                            <span className="px-2.5 text-xs font-mono font-medium text-near-black">
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
                              className="min-h-[38px] min-w-[38px] flex items-center justify-center text-muted hover:text-near-black transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-xs disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Plus className="w-3.5 h-3.5 stroke-[1.5]" />
                            </button>
                          </div>

                          {/* Line total */}
                          <div className="text-end min-w-[80px]">
                            <span className="text-sm sm:text-base font-medium text-near-black font-mono">
                              {formatPrice(lineTotal)}
                            </span>
                          </div>

                          {/* Delete item button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item)}
                            aria-label={`${t('cart.remove')} ${productName}`}
                            className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted hover:text-red-600 transition-colors cursor-pointer -me-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded-xs"
                          >
                            <Trash2 className="w-4 h-4 stroke-[1.5]" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center text-xs">
                  <LocaleLink
                    to="/shop"
                    className="inline-flex items-center gap-1.5 text-muted hover:text-gold-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-xs px-1"
                  >
                    <span>←</span>
                    <span>{t('cart.continueShopping')}</span>
                  </LocaleLink>
                </div>
              </div>

              {/* Right Column: Order Summary & Coupon (4 Cols) */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-ivory-surface border border-border rounded-xs shadow-2xs p-5 sm:p-6 text-start">
                  <h2 className="text-base font-medium text-near-black font-display mb-4 pb-3 border-b border-border">
                    {t('checkout.orderSummary')}
                  </h2>

                  {/* Coupon Form */}
                  <div className="mb-6">
                    <label
                      htmlFor="coupon-input"
                      className="block text-xs font-medium text-near-black mb-1.5"
                    >
                      {t('cartPage.couponTitle')}
                    </label>

                    {coupon && totals.discountAmount > 0 ? (
                      <div className="flex items-center justify-between p-2.5 bg-gold/10 border border-gold/30 rounded-xs">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 stroke-[1.5] text-gold-dark" />
                          <span className="font-mono text-xs font-semibold text-near-black uppercase">
                            <bdi dir="ltr">{coupon.code}</bdi>
                          </span>
                          <span className="text-[11px] text-gold-dark">
                            ({coupon.type === 'fixed' ? formatPrice(coupon.value || 0) : formatPercent(coupon.value || coupon.discountPercent || 0)} {lang === 'fa' ? 'تخفیف' : 'off'})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={removeCoupon}
                          aria-label={t('cartPage.removeCoupon')}
                          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-muted hover:text-red-600 transition-colors cursor-pointer rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                        >
                          <X className="w-4 h-4 stroke-[1.5]" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          id="coupon-input"
                          type="text"
                          value={couponCodeInput}
                          onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleApplyCoupon(e);
                            }
                          }}
                          placeholder={t('cartPage.couponPlaceholder')}
                          className="text-xs uppercase"
                          disabled={isApplyingCoupon}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={isApplyingCoupon || !couponCodeInput.trim()}
                          isLoading={isApplyingCoupon}
                          className="shrink-0 min-h-[44px]"
                        >
                          {t('cartPage.applyCoupon')}
                        </Button>
                      </div>
                    )}

                    {couponError && (
                      <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1" role="alert">
                        <AlertCircle className="w-3.5 h-3.5 stroke-[1.5]" />
                        <span>{couponError}</span>
                      </p>
                    )}

                    {(!coupon || totals.discountAmount === 0) && (
                      <p className="text-[11px] text-muted mt-2">
                        {t('cartPage.testCouponsHelp')}
                      </p>
                    )}
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="space-y-3 py-4 border-t border-b border-border/80 text-xs sm:text-sm">
                    <div className="flex justify-between items-center text-muted">
                      <span>{t('cart.subtotal')}</span>
                      <span className="font-mono text-near-black">
                        {formatPrice(totals.subtotal)}
                      </span>
                    </div>

                    {totals.discountAmount > 0 && (
                      <div className="flex justify-between items-center text-gold-dark">
                        <span className="flex items-center gap-1">
                          <Tag className="w-3.5 h-3.5 stroke-[1.5]" />
                          <span>{t('cartPage.discountAmount')} {coupon ? `(${coupon.code})` : ''}</span>
                        </span>
                        <span className="font-mono">
                          -{formatPrice(totals.discountAmount)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-muted">
                      <span>{t('cartPage.estimatedShipping')}</span>
                      <span className="font-mono text-near-black">
                        {totals.shippingCost === 0 ? (
                          <span className="text-gold-dark font-medium">
                            {t('cartPage.free')}
                          </span>
                        ) : (
                          formatPrice(totals.shippingCost)
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-base sm:text-lg font-semibold text-near-black pt-2 border-t border-border/60">
                      <span>{t('cartPage.total')}</span>
                      <span className="font-mono text-gold-dark">
                        {formatPrice(totals.total)}
                      </span>
                    </div>
                  </div>

                  {/* Checkout CTA */}
                  <div className="mt-6 space-y-3">
                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      disabled={hasOutOfStockItems()}
                      onClick={() => localeNavigate('/checkout')}
                      rightIcon={<ArrowIcon className="w-4 h-4" />}
                    >
                      {t('cartPage.proceedToCheckout')}
                    </Button>

                    {hasOutOfStockItems() && (
                      <p className="text-xs text-rose-700 text-center font-medium bg-rose-50 border border-rose-200 p-2.5 rounded-xs leading-relaxed">
                        {lang === 'fa'
                          ? 'جهت ثبت سفارش، ابتدا کالاهای ناموجود را از سبد خرید حذف فرمایید.'
                          : 'Please remove unavailable items before proceeding to checkout.'}
                      </p>
                    )}

                    <div className="flex items-center justify-center gap-2 text-[11px] text-muted text-center pt-2">
                      <ShieldCheck className="w-4 h-4 text-gold shrink-0" aria-hidden="true" />
                      <span>{t('common.luxuryPackaging')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Container>

        {/* Mobile Sticky Bottom Summary Bar */}
        {items.length > 0 && (
          <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-ivory/95 backdrop-blur-md border-t border-border px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-lg flex items-center justify-between gap-4">
            <div className="min-w-0">
              <span className="text-[11px] text-muted block leading-none">{t('cartPage.total')}</span>
              <span className="text-base font-bold font-mono text-gold-dark truncate block mt-1">
                {formatPrice(totals.total)}
              </span>
            </div>
            <Button
              variant="primary"
              size="md"
              className="min-h-[44px] px-5 shrink-0"
              disabled={hasOutOfStockItems()}
              onClick={() => localeNavigate('/checkout')}
              rightIcon={<ArrowIcon className="w-4 h-4" />}
            >
              {t('cartPage.proceedToCheckout')}
            </Button>
          </div>
        )}
      </div>
    </>
  );
};
