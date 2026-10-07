import React, { useState, useEffect, useMemo } from 'react';
import { Seo } from '../components/seo/Seo';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Lock,
  Sparkles,
  MapPin,
  ChevronRight,
  Tag,
  AlertTriangle,
  Trash2,
  AlertCircle,
  X,
} from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useOrderStore } from '../store/orderStore';
import { useI18n } from '../hooks/useI18n';
import { Container } from '../components/ui/Container';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Stepper } from '../components/ui/Stepper';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { RadioCard } from '../components/ui/RadioCard';
import { useToast } from '../components/ui/Toast';
import { LocaleLink, useLocaleNavigate } from '../components/navigation/LocaleLink';
import { IRAN_PROVINCES, COUNTRIES, normalizeDigits, handleLiveDigitInput, generateOrderNumber } from '../data/iranLocations';
import { useAuth } from '../context/AuthContext';
import { createOrderInFirestore } from '../lib/ordersApi';
import { getAllProducts, decrementProductStockForOrder } from '../lib/productsApi';
import { getSizePrice } from '../lib/products';
import { STANDARD_SHIPPING_COST, EXPRESS_SHIPPING_COST } from '../lib/pricing';
import { validateCouponInFirestore } from '../lib/couponsApi';
import { ShippingMethodId, PaymentMethodId, Order, PersianShippingAddress, EnglishShippingAddress, CartItem } from '../types';

// Zod validation schemas built dynamically to support language changes
function buildPersianAddressSchema() {
  return z.object({
    fullName: z.string().min(3, 'لطفاً نام و نام خانوادگی کامل خود را وارد فرمایید'),
    phone: z
      .string()
      .transform((val) => normalizeDigits(val).replace(/\s+/g, ''))
      .refine((val) => /^09\d{9}$/.test(val), 'شماره همراه باید با ۰۹ شروع شده و ۱۱ رقم باشد (مثال: ۰۹۱۲۳۴۵۶۷۸۹)'),
    email: z.string().email('لطفاً یک آدرس ایمیل معتبر وارد فرمایید'),
    province: z.string().min(1, 'لطفاً استان خود را انتخاب نمایید'),
    city: z.string().min(1, 'لطفاً شهر خود را انتخاب نمایید'),
    fullAddress: z.string().min(10, 'نشانی پستی باید شامل نام خیابان، کوچه و پلاک باشد (حداقل ۱۰ کاراکتر)'),
    postalCode: z
      .string()
      .transform((val) => normalizeDigits(val).replace(/\s+/g, ''))
      .refine((val) => /^\d{10}$/.test(val), 'کد پستی باید دقیقاً یک عدد ۱۰ رقمی باشد'),
    unitFloor: z.string().optional(),
    orderNote: z.string().optional(),
  });
}

function buildEnglishAddressSchema() {
  return z.object({
    fullName: z.string().min(3, 'Please enter your full name'),
    phone: z.string().min(7, 'Please enter a valid phone number'),
    email: z.string().email('Please enter a valid email address'),
    country: z.string().min(1, 'Please select your country'),
    state: z.string().min(2, 'Please enter your state or province'),
    city: z.string().min(2, 'Please enter your city'),
    addressLine1: z.string().min(5, 'Please enter your street address'),
    addressLine2: z.string().optional(),
    postalCode: z.string().min(4, 'Please enter a valid ZIP or postal code'),
    orderNote: z.string().optional(),
  });
}

type PersianFormValues = z.infer<ReturnType<typeof buildPersianAddressSchema>>;
type EnglishFormValues = z.infer<ReturnType<typeof buildEnglishAddressSchema>>;

export const CheckoutPage: React.FC = () => {
  const { lang, isRTL, t, formatPrice, getLocalized, formatNumber, formatPercent } = useI18n();
  const {
    items,
    coupon,
    setCoupon,
    removeCoupon,
    shippingMethod,
    setShippingMethod,
    getTotals,
    clearCart,
    removeItem,
  } = useCartStore();
  const { setLastOrder } = useOrderStore();
  const { showToast } = useToast();
  const localeNavigate = useLocaleNavigate();

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>('online');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stockError, setStockError] = useState<string[] | null>(null);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState<boolean>(false);
  const { user, profile } = useAuth();

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

  const unavailableItems = useMemo(
    () => items.filter((it) => it.product?.inStock === false),
    [items]
  );
  const hasOutOfStock = unavailableItems.length > 0;

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      localeNavigate('/cart');
    }
  }, [items.length, localeNavigate]);

  const totals = useMemo(() => getTotals(lang), [lang, getTotals, items, coupon, shippingMethod]);
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const persianSchema = useMemo(() => buildPersianAddressSchema(), []);
  const englishSchema = useMemo(() => buildEnglishAddressSchema(), []);

  // Form for Persian address
  const faForm = useForm<PersianFormValues>({
    resolver: zodResolver(persianSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      province: '',
      city: '',
      fullAddress: '',
      postalCode: '',
      unitFloor: '',
      orderNote: '',
    },
    mode: 'onBlur',
  });

  // Form for English address
  const enForm = useForm<EnglishFormValues>({
    resolver: zodResolver(englishSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      country: 'US',
      state: 'New York',
      city: 'New York',
      addressLine1: '',
      addressLine2: '',
      postalCode: '',
      orderNote: '',
    },
    mode: 'onBlur',
  });

  // Prefill contact/address if logged in
  useEffect(() => {
    if (user || profile) {
      const name = profile?.name || user?.displayName || '';
      const email = user?.email || profile?.email || '';
      const phone = profile?.phone || '';

      if (name) {
        if (!faForm.getValues('fullName')) faForm.setValue('fullName', name);
        if (!enForm.getValues('fullName')) enForm.setValue('fullName', name);
      }
      if (email) {
        if (!faForm.getValues('email')) faForm.setValue('email', email);
        if (!enForm.getValues('email')) enForm.setValue('email', email);
      }
      if (phone) {
        const normalizedPhone = normalizeDigits(phone);
        if (!faForm.getValues('phone')) faForm.setValue('phone', normalizedPhone);
        if (!enForm.getValues('phone')) enForm.setValue('phone', normalizedPhone);
      }
    }
  }, [user, profile, faForm, enForm]);

  // Re-evaluate and clear stale validation errors when language changes
  useEffect(() => {
    faForm.clearErrors();
    enForm.clearErrors();
  }, [lang, faForm, enForm]);

  const selectedProvince = faForm.watch('province');
  const citiesForProvince =
    IRAN_PROVINCES.find((p) => p.name === selectedProvince)?.cities || [];

  const steps = [
    { id: 'address', label: t('checkout.stepAddress') },
    { id: 'shipping', label: t('checkout.stepShipping') },
    { id: 'payment', label: t('checkout.stepPayment') },
    { id: 'review', label: t('checkout.stepReview') },
  ];

  const handleNextFromAddress = async () => {
    if (lang === 'fa') {
      const isValid = await faForm.trigger();
      if (isValid) {
        setCurrentStep(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      const isValid = await enForm.trigger();
      if (isValid) {
        setCurrentStep(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    setStockError(null);

    // Final safety check: verify all cart items are still inStock right before placing order
    try {
      const freshProducts = await getAllProducts();
      useCartStore.getState().syncProducts(freshProducts);

      const outOfStockList = items.filter((it) => {
        const fresh = freshProducts.find((p) => p.id === it.product?.id || p.slug === it.product?.slug);
        const available =
          typeof fresh?.stockQuantity === 'number'
            ? fresh.stockQuantity
            : fresh?.inStock === false
            ? 0
            : 20;
        return available < it.quantity || fresh?.inStock === false;
      });

      if (outOfStockList.length > 0) {
        setIsSubmitting(false);
        setStockError(
          outOfStockList.map((it) => getLocalized(it.product.name, lang) ?? it.product.id)
        );
        return;
      }
    } catch (checkErr) {
      console.warn('Error during pre-order stock verification:', checkErr);
      const invalidItems = items.filter(
        (it) =>
          it.product?.inStock === false ||
          (typeof it.product?.stockQuantity === 'number' && it.quantity > it.product.stockQuantity)
      );
      if (invalidItems.length > 0) {
        setIsSubmitting(false);
        setStockError(
          invalidItems.map((it) => getLocalized(it.product.name, lang) ?? it.product.id)
        );
        return;
      }
    }

    const addressData: PersianShippingAddress | EnglishShippingAddress =
      lang === 'fa' ? faForm.getValues() : enForm.getValues();

    const orderNumber = generateOrderNumber();
    const newOrder: Order = {
      orderNumber,
      createdAt: new Date().toISOString(),
      items: [...items],
      shippingAddress: addressData,
      shippingMethod,
      paymentMethod,
      coupon: totals.discountAmount > 0 ? coupon : null,
      totals: {
        subtotal: totals.subtotal,
        discountAmount: totals.discountAmount,
        shippingCost: totals.shippingCost,
        total: totals.total,
      },
      language: lang,
    };

    try {
      // Save order to Firestore collection "orders"
      await createOrderInFirestore({
        orderNumber,
        userId: user ? user.uid : null,
        customerName: 'fullName' in addressData ? addressData.fullName : 'Valued Patron',
        customerEmail: 'email' in addressData ? addressData.email : (user?.email || ''),
        customerPhone: 'phone' in addressData ? addressData.phone : '',
        createdAt: new Date().toISOString(),
        status: 'pending',
        items: items.map((it) => {
          const itemPriceObj = it.unitPrice || getSizePrice(it.product, it.size);
          return {
            productId: it.product.id,
            productName: it.product.name,
            size: it.size.endsWith('ml') ? it.size : `${it.size}ml`,
            quantity: it.quantity,
            unitPrice: itemPriceObj,
            image: it.product.images[0],
          };
        }),
        shippingAddress: addressData,
        shippingMethod,
        paymentMethod,
        couponCode: totals.discountAmount > 0 && coupon ? coupon.code : null,
        discountAmount: totals.discountAmount,
        totals: {
          subtotal: totals.subtotal,
          discountAmount: totals.discountAmount,
          shippingCost: totals.shippingCost,
          total: totals.total,
        },
        language: lang,
      });

      // Best-effort inventory stock decrement
      await decrementProductStockForOrder(
        items.map((it) => ({
          productId: it.product.id,
          quantity: it.quantity,
        }))
      );
    } catch (firestoreErr) {
      console.warn('Could not save order to Firestore, continuing with local confirmation:', firestoreErr);
    }

    setLastOrder(newOrder);
    clearCart();
    setIsSubmitting(false);
    localeNavigate('/order-confirmation');
  };

  const breadcrumbs = [
    { label: t('common.home'), href: '/' },
    { label: t('cartPage.breadcrumb'), href: '/cart' },
    { label: t('checkout.breadcrumb') },
  ];

  if (items.length === 0) return null;

  return (
    <>
      <Seo title={t('checkout.title')} noindex={true} />

      <div className="pt-28 sm:pt-32 pb-16 sm:pb-24 bg-ivory">
        <Container>
          <Breadcrumb items={breadcrumbs} className="mb-6 sm:mb-8" />

          {/* Stepper Progress */}
          <div className="mb-8 sm:mb-12">
            <Stepper steps={steps} currentStepIndex={currentStep} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Step Content: Columns 8 */}
            <div className="lg:col-span-8">
              {/* STEP 0: Address & Contact Info */}
              {currentStep === 0 && (
                <div className="bg-ivory-surface border border-border rounded-xs p-6 sm:p-8 space-y-6 text-start">
                  <div className="flex items-center gap-2.5 pb-4 border-b border-border">
                    <MapPin className="w-5 h-5 text-gold shrink-0" />
                    <div>
                      <h2 className="text-lg font-medium text-near-black font-display">
                        {t('checkout.stepAddress')}
                      </h2>
                      <p className="text-xs text-muted font-light mt-0.5">
                        {t('checkout.contactInfo')}
                      </p>
                    </div>
                  </div>

                  {lang === 'fa' ? (
                    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label={t('checkout.fullName')}
                          placeholder={t('checkout.fullNamePlaceholder')}
                          {...faForm.register('fullName')}
                          error={faForm.formState.errors.fullName?.message}
                        />

                        <Input
                          label={t('checkout.phone')}
                          placeholder={t('checkout.phonePlaceholder')}
                          dir="ltr"
                          normalizeDigits
                          {...faForm.register('phone', {
                            onChange: handleLiveDigitInput,
                          })}
                          error={faForm.formState.errors.phone?.message}
                        />
                      </div>

                      <Input
                        label={t('checkout.email')}
                        type="email"
                        placeholder={t('checkout.emailPlaceholder')}
                        dir="ltr"
                        {...faForm.register('email')}
                        error={faForm.formState.errors.email?.message}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        {/* Province */}
                        <div>
                          <label
                            htmlFor="province-select"
                            className="block text-xs font-medium text-near-black mb-1.5"
                          >
                            {t('checkout.province')}
                          </label>
                          <select
                            id="province-select"
                            className="w-full min-h-[44px] bg-ivory text-near-black text-base sm:text-sm px-3.5 py-2.5 border border-border rounded-xs focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none"
                            {...faForm.register('province', {
                              onChange: () => {
                                faForm.setValue('city', '');
                                faForm.clearErrors('city');
                              },
                            })}
                          >
                            <option value="">{t('checkout.selectProvince')}</option>
                            {IRAN_PROVINCES.map((p) => (
                              <option key={p.name} value={p.name}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                          {faForm.formState.errors.province?.message && (
                            <p className="mt-1 text-xs text-rose-600 font-sans">
                              {faForm.formState.errors.province.message}
                            </p>
                          )}
                        </div>

                        {/* City */}
                        <div>
                          <label
                            htmlFor="city-select"
                            className="block text-xs font-medium text-near-black mb-1.5"
                          >
                            {t('checkout.city')}
                          </label>
                          <select
                            id="city-select"
                            disabled={!selectedProvince}
                            className="w-full min-h-[44px] bg-ivory text-near-black text-base sm:text-sm px-3.5 py-2.5 border border-border rounded-xs focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none disabled:bg-ivory/50 disabled:text-muted disabled:cursor-not-allowed"
                            {...faForm.register('city')}
                          >
                            <option value="">
                              {selectedProvince ? t('checkout.selectCity') : t('checkout.chooseProvinceFirst')}
                            </option>
                            {citiesForProvince.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                          {faForm.formState.errors.city?.message && (
                            <p className="mt-1 text-xs text-rose-600 font-sans">
                              {faForm.formState.errors.city.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <Textarea
                        label={t('checkout.fullAddress')}
                        placeholder={t('checkout.fullAddressPlaceholder')}
                        {...faForm.register('fullAddress')}
                        error={faForm.formState.errors.fullAddress?.message}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label={t('checkout.postalCode')}
                          placeholder={t('checkout.postalCodePlaceholder')}
                          dir="ltr"
                          normalizeDigits
                          {...faForm.register('postalCode', {
                            onChange: handleLiveDigitInput,
                          })}
                          error={faForm.formState.errors.postalCode?.message}
                        />

                        <Input
                          label={t('checkout.unitFloor')}
                          placeholder={t('checkout.unitFloorPlaceholder')}
                          {...faForm.register('unitFloor')}
                        />
                      </div>

                      <Textarea
                        label={t('checkout.orderNote')}
                        placeholder={t('checkout.orderNotePlaceholder')}
                        {...faForm.register('orderNote')}
                      />
                    </form>
                  ) : (
                    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label={t('checkout.fullName')}
                          placeholder={t('checkout.fullNamePlaceholder')}
                          {...enForm.register('fullName')}
                          error={enForm.formState.errors.fullName?.message}
                        />

                        <Input
                          label={t('checkout.phone')}
                          placeholder={t('checkout.phonePlaceholder')}
                          dir="ltr"
                          normalizeDigits
                          {...enForm.register('phone', {
                            onChange: handleLiveDigitInput,
                          })}
                          error={enForm.formState.errors.phone?.message}
                        />
                      </div>

                      <Input
                        label={t('checkout.email')}
                        type="email"
                        placeholder={t('checkout.emailPlaceholder')}
                        {...enForm.register('email')}
                        error={enForm.formState.errors.email?.message}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                        <div>
                          <label
                            htmlFor="country-select"
                            className="block text-xs font-medium text-near-black mb-1.5"
                          >
                            {t('checkout.country')}
                          </label>
                          <select
                            id="country-select"
                            className="w-full min-h-[44px] bg-ivory text-near-black text-base sm:text-sm px-3.5 py-2.5 border border-border rounded-xs focus:border-gold focus:ring-1 focus:ring-gold focus:outline-none"
                            {...enForm.register('country')}
                          >
                            {COUNTRIES.map((c) => (
                              <option key={c.code} value={c.code}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <Input
                          label={t('checkout.city')}
                          placeholder="City"
                          {...enForm.register('city')}
                          error={enForm.formState.errors.city?.message}
                        />

                        <Input
                          label={t('checkout.state')}
                          placeholder="State / Region"
                          {...enForm.register('state')}
                          error={enForm.formState.errors.state?.message}
                        />
                      </div>

                      <Input
                        label={t('checkout.addressLine1')}
                        placeholder={t('checkout.addressLine1Placeholder')}
                        {...enForm.register('addressLine1')}
                        error={enForm.formState.errors.addressLine1?.message}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label={t('checkout.addressLine2')}
                          placeholder={t('checkout.addressLine2Placeholder')}
                          {...enForm.register('addressLine2')}
                        />

                        <Input
                          label={t('checkout.postalCode')}
                          placeholder={t('checkout.postalCodePlaceholder')}
                          dir="ltr"
                          normalizeDigits
                          {...enForm.register('postalCode', {
                            onChange: handleLiveDigitInput,
                          })}
                          error={enForm.formState.errors.postalCode?.message}
                        />
                      </div>

                      <Textarea
                        label={t('checkout.orderNote')}
                        placeholder={t('checkout.orderNotePlaceholder')}
                        {...enForm.register('orderNote')}
                      />
                    </form>
                  )}

                  <div className="pt-6 border-t border-border flex justify-end">
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleNextFromAddress}
                      rightIcon={<ArrowIcon className="w-4 h-4" />}
                    >
                      {t('checkout.continue')}
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 1: Shipping Method Selection */}
              {currentStep === 1 && (
                <div className="bg-ivory-surface border border-border rounded-xs p-6 sm:p-8 space-y-6 text-start">
                  <div className="flex items-center gap-2.5 pb-4 border-b border-border">
                    <Truck className="w-5 h-5 text-gold shrink-0" />
                    <div>
                      <h2 className="text-lg font-medium text-near-black font-display">
                        {t('checkout.shippingMethodTitle')}
                      </h2>
                      <p className="text-xs text-muted font-light mt-0.5">
                        {t('cart.shippingNote')}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <RadioCard
                      id="shipping-standard"
                      name="shipping-method"
                      value="standard"
                      checked={shippingMethod === 'standard'}
                      onChange={(val) => setShippingMethod(val as ShippingMethodId)}
                      title={t('checkout.standardShipping')}
                      description={t('checkout.standardShippingDesc')}
                      price={
                        totals.isEligibleForFreeShipping
                          ? t('cartPage.free')
                          : formatPrice(getLocalized(STANDARD_SHIPPING_COST, lang))
                      }
                      badge={totals.isEligibleForFreeShipping ? t('cartPage.free') : undefined}
                      icon={<Truck className="w-4 h-4" />}
                    />

                    <RadioCard
                      id="shipping-express"
                      name="shipping-method"
                      value="express"
                      checked={shippingMethod === 'express'}
                      onChange={(val) => setShippingMethod(val as ShippingMethodId)}
                      title={t('checkout.expressShipping')}
                      description={t('checkout.expressShippingDesc')}
                      price={formatPrice(getLocalized(EXPRESS_SHIPPING_COST, lang))}
                      badge="VIP"
                      icon={<Sparkles className="w-4 h-4" />}
                    />
                  </div>

                  <div className="pt-6 border-t border-border flex justify-between items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentStep(0)}
                    >
                      {t('checkout.back')}
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => {
                        setCurrentStep(2);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      rightIcon={<ArrowIcon className="w-4 h-4" />}
                    >
                      {t('checkout.continue')}
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 2: Payment Method Selection */}
              {currentStep === 2 && (
                <div className="bg-ivory-surface border border-border rounded-xs shadow-2xs p-6 sm:p-8 space-y-6 text-start">
                  <div className="flex items-center gap-2.5 pb-4 border-b border-border">
                    <CreditCard className="w-5 h-5 stroke-[1.5] text-gold-dark shrink-0" />
                    <div>
                      <h2 className="text-lg font-medium text-near-black font-display">
                        {t('checkout.paymentMethodTitle')}
                      </h2>
                      <p className="text-xs text-muted font-light mt-0.5">
                        {t('checkout.securityAssurance')}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <RadioCard
                      id="payment-online"
                      name="payment-method"
                      value="online"
                      checked={paymentMethod === 'online'}
                      onChange={(val) => setPaymentMethod(val as PaymentMethodId)}
                      title={t('checkout.paymentOnline')}
                      description={t('checkout.paymentOnlineDesc')}
                      badge="Shetab / SSL"
                      icon={<Lock className="w-4 h-4 stroke-[1.5]" />}
                    />

                    <RadioCard
                      id="payment-cod"
                      name="payment-method"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(val) => setPaymentMethod(val as PaymentMethodId)}
                      title={t('checkout.paymentCod')}
                      description={t('checkout.paymentCodDesc')}
                      icon={<CreditCard className="w-4 h-4 stroke-[1.5]" />}
                    />
                  </div>

                  <div className="p-4 bg-ivory border border-border rounded-xs shadow-2xs flex items-center gap-3 text-xs text-muted">
                    <ShieldCheck className="w-5 h-5 stroke-[1.5] text-gold-dark shrink-0" />
                    <span>{t('checkout.luxuryBoxGuarantee')}</span>
                  </div>

                  <div className="pt-6 border-t border-border flex justify-between items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentStep(1)}
                    >
                      {t('checkout.back')}
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => {
                        setCurrentStep(3);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      rightIcon={<ArrowIcon className="w-4 h-4 stroke-[1.5]" />}
                    >
                      {t('checkout.continue')}
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3: Review and Confirm Order */}
              {currentStep === 3 && (
                <div className="bg-ivory-surface border border-border rounded-xs shadow-2xs p-6 sm:p-8 space-y-6 text-start">
                  <div className="flex items-center gap-2.5 pb-4 border-b border-border">
                    <CheckCircle className="w-5 h-5 stroke-[1.5] text-gold-dark shrink-0" />
                    <div>
                      <h2 className="text-lg font-medium text-near-black font-display">
                        {t('checkout.stepReview')}
                      </h2>
                      <p className="text-xs text-muted font-light mt-0.5">
                        {t('orderConfirmation.subtitle')}
                      </p>
                    </div>
                  </div>

                  {/* Summary of Address & Methods */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-ivory border border-border rounded-xs shadow-2xs">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-near-black uppercase tracking-wider">
                          {t('checkout.stepAddress')}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(0)}
                          className="text-[11px] text-gold-dark font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-xs px-1"
                        >
                          {t('checkout.editCart')}
                        </button>
                      </div>
                      {lang === 'fa' ? (
                        <div className="text-xs text-muted space-y-1">
                          <p className="text-near-black font-medium">{faForm.getValues('fullName')}</p>
                          <p className="text-start"><bdi dir="ltr">{faForm.getValues('phone')}</bdi></p>
                          <p>{faForm.getValues('province')}، {faForm.getValues('city')}</p>
                          <p className="line-clamp-2">{faForm.getValues('fullAddress')}</p>
                          <p>{t('checkout.postalCode')}: <bdi dir="ltr">{faForm.getValues('postalCode')}</bdi></p>
                        </div>
                      ) : (
                        <div className="text-xs text-muted space-y-1">
                          <p className="text-near-black font-medium">{enForm.getValues('fullName')}</p>
                          <p>{enForm.getValues('phone')}</p>
                          <p>{enForm.getValues('addressLine1')}</p>
                          <p>{enForm.getValues('city')}, {enForm.getValues('state')} {enForm.getValues('postalCode')}</p>
                          <p>{enForm.getValues('country')}</p>
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-ivory border border-border rounded-xs shadow-2xs">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-near-black uppercase tracking-wider rtl:tracking-normal">
                          {t('checkout.stepShipping')} &amp; {t('checkout.stepPayment')}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCurrentStep(1)}
                          className="text-[11px] text-gold-dark font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-xs px-1"
                        >
                          {t('checkout.editCart')}
                        </button>
                      </div>
                      <div className="text-xs text-muted space-y-2">
                        <div>
                          <span className="text-near-black font-medium block">
                            {shippingMethod === 'standard'
                              ? t('checkout.standardShipping')
                              : t('checkout.expressShipping')}
                          </span>
                          <span className="text-[11px]">
                            {shippingMethod === 'standard'
                              ? t('checkout.standardShippingDesc')
                              : t('checkout.expressShippingDesc')}
                          </span>
                        </div>
                        <div className="pt-2 border-t border-border/50">
                          <span className="text-near-black font-medium block">
                            {paymentMethod === 'online'
                              ? t('checkout.paymentOnline')
                              : t('checkout.paymentCod')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Out of Stock Error Card */}
                  {(hasOutOfStock || (stockError && stockError.length > 0)) && (
                    <div className="p-4 sm:p-5 bg-rose-50 border border-rose-300 text-rose-950 rounded-xs space-y-3 animate-in fade-in duration-200">
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-semibold text-rose-900">
                            {t('checkout.outOfStockBlock')}
                          </h4>
                          <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                            {lang === 'fa'
                              ? 'سفارش شما به دلیل ناموجود بودن اقلام زیر قابل ثبت نیست. لطفاً آن‌ها را حذف فرمایید:'
                              : 'Your order cannot be placed because the following items are currently out of stock. Please remove them to proceed:'}
                          </p>
                        </div>
                      </div>

                      {/* List of unavailable items */}
                      <div className="divide-y divide-rose-200/80 bg-[var(--bg-surface)] border border-rose-300/40 rounded-xs p-2.5">
                        {unavailableItems.map((it) => {
                          const pName = getLocalized(it.product.name, lang) ?? it.product.id;
                          return (
                            <div
                              key={`${it.product.id}-${it.size}`}
                              className="py-2.5 flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <img
                                  src={it.product.images[0]}
                                  alt={pName}
                                  className="w-10 h-12 object-cover rounded-xs border border-rose-300 opacity-60 grayscale-[40%]"
                                />
                                <div className="min-w-0">
                                  <span className="font-medium text-rose-950 truncate block">{pName}</span>
                                  <span className="text-[11px] text-rose-700 block mt-0.5">
                                    {it.size} • {t('cart.noLongerAvailable')}
                                  </span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeItem(it.product.id, it.size)}
                                className="px-2.5 py-1 text-xs text-rose-700 hover:text-white hover:bg-rose-600 border border-rose-300 rounded-xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>{t('cart.remove')}</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      <div className="pt-1 flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => localeNavigate('/cart')}
                          className="text-xs border-rose-300 text-rose-800 hover:bg-rose-100"
                        >
                          {t('checkout.returnToCart')}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Line Items Overview */}
                  <div className="border border-border rounded-xs divide-y divide-border/60">
                    {items.map((item) => {
                      const priceObj = item.unitPrice || item.product.price;
                      const unitPrice = getLocalized(priceObj, lang) ?? 0;
                      const productName = getLocalized(item.product.name, lang) ?? '';
                      const isOutOfStock = item.product?.inStock === false;
                      return (
                        <div
                          key={`${item.product.id}-${item.size}`}
                          className={`p-3 sm:p-4 flex items-center justify-between gap-4 transition-colors ${
                            isOutOfStock ? 'bg-rose-50/50' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative shrink-0">
                              <img
                                src={item.product.images[0]}
                                alt={productName}
                                loading="lazy"
                                referrerPolicy="no-referrer"
                                decoding="async"
                                className={`w-12 h-14 object-cover rounded-xs border border-border shrink-0 ${
                                  isOutOfStock ? 'opacity-50 grayscale-[40%]' : ''
                                }`}
                              />
                              {isOutOfStock && (
                                <div className="absolute inset-0 bg-near-black/30 flex items-center justify-center pointer-events-none p-0.5">
                                  <span className="text-[8px] font-bold uppercase bg-near-black/90 text-rose-200 px-1 py-0.5 rounded-xs text-center">
                                    {t('product.outOfStock')}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs sm:text-sm font-medium text-near-black truncate">
                                {productName}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted">
                                <span className="font-mono text-gold-dark font-medium">{item.size}</span>
                                <span>× {formatNumber(item.quantity, { useGrouping: false })}</span>
                              </div>
                              {isOutOfStock && (
                                <div className="mt-1">
                                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-700 bg-rose-100 border border-rose-300 px-1.5 py-0.5 rounded-xs">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                    {t('cart.noLongerAvailable')}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs sm:text-sm font-medium font-mono text-near-black">
                              {formatPrice(unitPrice * item.quantity)}
                            </span>
                            {isOutOfStock && (
                              <button
                                type="button"
                                onClick={() => removeItem(item.product.id, item.size)}
                                className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-100 rounded-xs transition-colors cursor-pointer"
                                title={t('cart.remove')}
                                aria-label={`${t('cart.remove')} ${productName}`}
                              >
                                <Trash2 className="w-4 h-4 stroke-[1.5]" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Actions */}
                  <div className="pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentStep(2)}
                      disabled={isSubmitting}
                    >
                      {t('checkout.back')}
                    </Button>
                    <div className="flex flex-col items-stretch sm:items-end gap-1.5">
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={handlePlaceOrder}
                        disabled={isSubmitting || hasOutOfStock || (stockError !== null && stockError.length > 0)}
                        rightIcon={<Lock className="w-4 h-4 stroke-[1.5]" />}
                      >
                        {isSubmitting ? t('checkout.submitting') : t('checkout.placeOrder')}
                      </Button>
                      {(hasOutOfStock || (stockError !== null && stockError.length > 0)) && (
                        <span className="text-[11px] text-rose-600 font-medium text-center sm:text-end">
                          {lang === 'fa'
                            ? 'جهت ثبت، اقلام ناموجود را حذف فرمایید'
                            : 'Remove unavailable items to place order'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Summary Column: Columns 4 */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-ivory-surface border border-border rounded-xs shadow-2xs p-5 sm:p-6 text-start sticky top-24">
                <div className="flex justify-between items-center pb-3 border-b border-border">
                  <h3 className="text-base font-medium text-near-black font-display">
                    {t('checkout.orderSummary')}
                  </h3>
                  <LocaleLink
                    to="/cart"
                    className="text-xs text-gold-dark font-medium hover:underline flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-xs"
                  >
                    <span>{t('checkout.editCart')}</span>
                  </LocaleLink>
                </div>

                <div className="space-y-3 py-4 border-b border-border text-xs sm:text-sm">
                  <div className="flex justify-between items-center text-muted">
                    <span>{t('checkout.subtotal')}</span>
                    <span className="font-mono text-near-black">
                      {formatPrice(totals.subtotal)}
                    </span>
                  </div>

                  {/* Coupon Form in Checkout */}
                  <div className="pt-2 pb-1">
                    <label
                      htmlFor="checkout-coupon-input"
                      className="block text-xs font-medium text-near-black mb-1.5"
                    >
                      {t('cartPage.couponTitle')}
                    </label>

                    {coupon && totals.discountAmount > 0 ? (
                      <div className="flex items-center justify-between p-2.5 bg-gold/10 border border-gold/30 rounded-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <Tag className="w-4 h-4 stroke-[1.5] text-gold-dark shrink-0" />
                          <span className="font-mono text-xs font-semibold text-near-black uppercase truncate">
                            <bdi dir="ltr">{coupon.code}</bdi>
                          </span>
                          <span className="text-[11px] text-gold-dark shrink-0">
                            ({coupon.type === 'fixed' ? formatPrice(coupon.value || 0) : formatPercent(coupon.value || coupon.discountPercent || 0)} {lang === 'fa' ? 'تخفیف' : 'off'})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={removeCoupon}
                          aria-label={t('cartPage.removeCoupon')}
                          className="min-h-[36px] min-w-[36px] flex items-center justify-center text-muted hover:text-red-600 transition-colors cursor-pointer rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                        >
                          <X className="w-4 h-4 stroke-[1.5]" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          id="checkout-coupon-input"
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
                          className="shrink-0 min-h-[40px]"
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
                  </div>

                  {totals.discountAmount > 0 && (
                    <div className="flex justify-between items-center text-gold-dark">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5 stroke-[1.5]" />
                        <span>{t('checkout.discount')} {coupon ? `(${coupon.code})` : ''}</span>
                      </span>
                      <span className="font-mono">
                        -{formatPrice(totals.discountAmount)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-muted">
                    <span>{t('checkout.shipping')}</span>
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
                    <span>{t('checkout.grandTotal')}</span>
                    <span className="font-mono text-gold-dark">
                      {formatPrice(totals.total)}
                    </span>
                  </div>
                </div>

                <div className="pt-4 space-y-2 text-[11px] text-muted">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 stroke-[1.5] text-gold-dark shrink-0" />
                    <span>{t('common.luxuryPackaging')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 stroke-[1.5] text-gold-dark shrink-0" />
                    <span>{t('checkout.securityAssurance')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
};
