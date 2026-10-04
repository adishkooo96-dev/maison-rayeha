import React from 'react';
import { Seo } from '../components/seo/Seo';
import {
  CheckCircle,
  Package,
  Calendar,
  MapPin,
  CreditCard,
  Truck,
  Printer,
  ShoppingBag,
  Sparkles,
  PhoneCall,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import { useOrderStore } from '../store/orderStore';
import { useI18n } from '../hooks/useI18n';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import { LocaleLink, useLocaleNavigate } from '../components/navigation/LocaleLink';
import { getSizePrice } from '../lib/products';
import { PersianShippingAddress, EnglishShippingAddress } from '../types';

export const OrderConfirmationPage: React.FC = () => {
  const { lastOrder } = useOrderStore();
  const { lang, isRTL, t, formatPrice, getLocalized, formatNumber } = useI18n();
  const localeNavigate = useLocaleNavigate();
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const handlePrint = () => {
    window.print();
  };

  if (!lastOrder) {
    return (
      <div className="py-20 bg-ivory">
        <Container>
          <div className="max-w-md mx-auto text-center space-y-4 p-8 border border-dashed border-border/80 bg-ivory-surface rounded-xs shadow-2xs">
            <div className="w-16 h-16 rounded-full bg-ivory-subtle flex items-center justify-center text-muted mx-auto border border-border">
              <ShoppingBag className="w-7 h-7 text-gold-dark stroke-[1.5]" />
            </div>
            <h1 className="text-xl font-display text-near-black">
              {t('orderConfirmation.noOrderTitle')}
            </h1>
            <p className="text-xs text-muted">
              {t('orderConfirmation.noOrderDesc')}
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
        </Container>
      </div>
    );
  }

  const isPersianAddress = 'province' in lastOrder.shippingAddress;
  const faAddr = isPersianAddress ? (lastOrder.shippingAddress as PersianShippingAddress) : null;
  const enAddr = !isPersianAddress ? (lastOrder.shippingAddress as EnglishShippingAddress) : null;

  return (
    <>
      <Seo title={t('orderConfirmation.title')} noindex={true} />

      <div className="py-8 sm:py-14 bg-ivory">
        <Container>
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Success Celebration Card */}
            <div className="bg-ivory-surface border border-gold/40 rounded-xs p-6 sm:p-10 text-center relative overflow-hidden shadow-2xs">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/15 text-gold-dark mb-4 border border-gold/40">
                <CheckCircle className="w-8 h-8 stroke-[1.75]" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-display font-light rtl:font-normal rtl:leading-[1.45] text-near-black mb-2">
                {t('orderConfirmation.title')}
              </h1>
              <p className="text-xs sm:text-sm text-muted font-light max-w-lg mx-auto leading-relaxed rtl:leading-loose">
                {t('orderConfirmation.subtitle')}
              </p>

              {/* Order Reference Pill */}
              <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-3 bg-ivory border border-border px-5 py-2.5 rounded-xs shadow-2xs">
                <span className="text-xs text-muted">{t('orderConfirmation.orderNumber')}</span>
                <span className="text-sm font-mono font-bold text-gold-dark tracking-wider rtl:tracking-normal">
                  <bdi dir="ltr">{lastOrder.orderNumber}</bdi>
                </span>
                <span className="text-muted/40">•</span>
                <span className="text-xs text-muted flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 stroke-[1.5]" />
                  <span>{new Date(lastOrder.createdAt).toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US')}</span>
                </span>
              </div>
            </div>

            {/* Atelier Status Banner */}
            <div className="bg-ivory-surface border border-border rounded-xs shadow-2xs p-4 sm:p-5 flex items-center gap-3.5 text-start">
              <div className="w-10 h-10 rounded-full bg-gold/15 flex items-center justify-center text-gold-dark shrink-0">
                <Sparkles className="w-5 h-5 stroke-[1.5]" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-mono uppercase tracking-wider rtl:tracking-normal text-gold-dark block font-medium">
                  {t('orderConfirmation.status')}
                </span>
                <p className="text-xs sm:text-sm font-medium text-near-black mt-0.5">
                  {t('orderConfirmation.statusPreparing')}
                </p>
              </div>
            </div>

            {/* Delivery & Payment Details Card */}
            <div className="bg-ivory-surface border border-border rounded-xs shadow-2xs p-6 text-start">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Shipping Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-near-black uppercase tracking-wider rtl:tracking-normal pb-2 border-b border-border">
                    <MapPin className="w-4 h-4 stroke-[1.5] text-gold-dark" />
                    <span>{t('orderConfirmation.deliveryTo')}</span>
                  </div>

                  <div className="text-xs text-muted space-y-1">
                    <p className="text-near-black font-medium">
                      {isPersianAddress ? faAddr?.fullName : enAddr?.fullName}
                    </p>
                    <p className="text-start">
                      <bdi dir="ltr">{isPersianAddress ? faAddr?.phone : enAddr?.phone}</bdi>
                    </p>
                    <p>
                      <bdi dir="ltr">{isPersianAddress ? faAddr?.email : enAddr?.email}</bdi>
                    </p>
                    {isPersianAddress ? (
                      <>
                        <p>{faAddr?.province}، {faAddr?.city}</p>
                        <p>{faAddr?.fullAddress}</p>
                        {faAddr?.unitFloor && <p>{faAddr.unitFloor}</p>}
                        <p>کد پستی: <bdi dir="ltr">{faAddr?.postalCode}</bdi></p>
                      </>
                    ) : (
                      <>
                        <p>{enAddr?.addressLine1}</p>
                        {enAddr?.addressLine2 && <p>{enAddr.addressLine2}</p>}
                        <p>{enAddr?.city}, {enAddr?.state} {enAddr?.postalCode}</p>
                        <p>{enAddr?.country}</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Method Details */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-near-black uppercase tracking-wider pb-2 border-b border-border mb-2">
                      <Truck className="w-4 h-4 stroke-[1.5] text-gold-dark" />
                      <span>{t('orderConfirmation.shippingMethod')}</span>
                    </div>
                    <p className="text-xs font-medium text-near-black">
                      {lastOrder.shippingMethod === 'standard'
                        ? t('checkout.standardShipping')
                        : t('checkout.expressShipping')}
                    </p>
                    <p className="text-[11px] text-muted mt-0.5">
                      {lastOrder.shippingMethod === 'standard'
                        ? t('checkout.standardShippingDesc')
                        : t('checkout.expressShippingDesc')}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-near-black uppercase tracking-wider pb-2 border-b border-border mb-2">
                      <CreditCard className="w-4 h-4 stroke-[1.5] text-gold-dark" />
                      <span>{t('orderConfirmation.paymentMethod')}</span>
                    </div>
                    <p className="text-xs font-medium text-near-black">
                      {lastOrder.paymentMethod === 'online'
                        ? t('checkout.paymentOnline')
                        : t('checkout.paymentCod')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Inscribed Items Summary */}
            <div className="bg-ivory-surface border border-border rounded-xs shadow-2xs p-6 text-start">
              <h2 className="text-sm font-semibold text-near-black uppercase tracking-wider pb-3 border-b border-border mb-4 flex items-center gap-2">
                <Package className="w-4 h-4 stroke-[1.5] text-gold-dark" />
                <span>{t('orderConfirmation.summaryTitle')}</span>
              </h2>

              <div className="divide-y divide-border/60">
                {lastOrder.items.map((item) => {
                  const priceObj = item.unitPrice || getSizePrice(item.product, item.size);
                  const unitPrice = getLocalized(priceObj, lang) ?? 0;
                  const productName = getLocalized(item.product.name, lang) ?? '';

                  return (
                    <div
                      key={`${item.product.id}-${item.size}`}
                      className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.product.images[0]}
                          alt={productName}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          decoding="async"
                          className="w-12 h-14 object-cover rounded-xs border border-border"
                        />
                        <div>
                          <h4 className="text-xs sm:text-sm font-medium text-near-black font-display">
                            {productName}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted">
                            <span className="font-mono text-gold-dark font-medium">{item.size}</span>
                            <span>× {formatNumber(item.quantity, { useGrouping: false })}</span>
                          </div>
                        </div>
                      </div>

                      <span className="text-xs sm:text-sm font-medium font-mono text-near-black">
                        {formatPrice(unitPrice * item.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Totals Breakdown */}
              <div className="mt-6 pt-4 border-t border-border space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between items-center text-muted">
                  <span>{t('checkout.subtotal')}</span>
                  <span className="font-mono">{formatPrice(lastOrder.totals.subtotal)}</span>
                </div>

                {lastOrder.totals.discountAmount > 0 && (
                  <div className="flex justify-between items-center text-gold-dark">
                    <span>{t('checkout.discount')} ({lastOrder.coupon?.code})</span>
                    <span className="font-mono">-{formatPrice(lastOrder.totals.discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-muted">
                  <span>{t('checkout.shipping')}</span>
                  <span className="font-mono">
                    {lastOrder.totals.shippingCost === 0
                      ? t('cartPage.free')
                      : formatPrice(lastOrder.totals.shippingCost)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-base font-semibold text-near-black pt-2 border-t border-border/60">
                  <span>{t('orderConfirmation.totalPaid')}</span>
                  <span className="font-mono text-gold-dark">
                    {formatPrice(lastOrder.totals.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Assistance Banner */}
            <div className="p-4 bg-ivory border border-border rounded-xs shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-start text-xs text-muted">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 stroke-[1.5] text-gold-dark shrink-0" />
                <span>{t('orderConfirmation.needHelp')}</span>
              </div>
              <span className="font-medium text-near-black font-mono">
                {t('orderConfirmation.callConcierge')}
              </span>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Button
                variant="outline"
                size="md"
                onClick={handlePrint}
                leftIcon={<Printer className="w-4 h-4 stroke-[1.5]" />}
                className="w-full sm:w-auto"
              >
                {t('orderConfirmation.printReceipt')}
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => localeNavigate('/shop')}
                rightIcon={<ArrowIcon className="w-4 h-4 stroke-[1.5]" />}
                className="w-full sm:w-auto"
              >
                {t('orderConfirmation.continueShopping')}
              </Button>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
};
