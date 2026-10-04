import { Language, ShippingMethodId, Coupon } from '../types';

export const FREE_SHIPPING_THRESHOLD = {
  fa: 3000000, // 3,000,000 Toman
  en: 150,     // $150 USD
};

export const STANDARD_SHIPPING_COST = {
  fa: 150000,  // 150,000 Toman
  en: 15,      // $15 USD
};

export const EXPRESS_SHIPPING_COST = {
  fa: 350000,  // 350,000 Toman
  en: 35,      // $35 USD
};

export interface CouponValidationResult {
  valid: boolean;
  coupon?: Coupon;
  errorMessage?: {
    fa: string;
    en: string;
  };
}

export function calculateShippingCost(
  subtotal: number,
  method: ShippingMethodId,
  lang: Language
): number {
  const threshold = FREE_SHIPPING_THRESHOLD[lang];
  const isFreeStandard = subtotal >= threshold;

  if (method === 'standard') {
    return isFreeStandard ? 0 : STANDARD_SHIPPING_COST[lang];
  }

  if (method === 'express') {
    return EXPRESS_SHIPPING_COST[lang];
  }

  return 0;
}

/**
 * Computes discount amount from coupon type and value.
 * - Fixed discount can never exceed the subtotal.
 * - Percent discount applies percentage between 1 and 100.
 * - If coupon is null or subtotal < minOrderAmount, discount is 0.
 */
export function calculateDiscountAmount(
  subtotal: number,
  coupon?: Coupon | null
): number {
  if (!coupon || !coupon.code) {
    return 0;
  }

  // Minimum order amount restriction
  if (coupon.minOrderAmount && coupon.minOrderAmount > 0 && subtotal < coupon.minOrderAmount) {
    return 0;
  }

  if (coupon.type === 'fixed') {
    const fixedVal = Number(coupon.value) || 0;
    // A fixed discount can never exceed the subtotal
    return Math.max(0, Math.min(subtotal, fixedVal));
  }

  // Percent discount (default)
  const percentVal = Number(coupon.value ?? coupon.discountPercent) || 0;
  if (percentVal <= 0) {
    return 0;
  }

  const safePercent = Math.min(100, Math.max(0, percentVal));
  return Math.round((subtotal * safePercent) / 100);
}

export function calculateOrderTotals(
  subtotal: number,
  shippingMethod: ShippingMethodId,
  coupon: Coupon | null | undefined,
  lang: Language
) {
  const discountAmount = calculateDiscountAmount(subtotal, coupon);
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const shippingCost = calculateShippingCost(subtotal, shippingMethod, lang);
  const total = discountedSubtotal + shippingCost;
  const threshold = FREE_SHIPPING_THRESHOLD[lang];
  const amountNeededForFreeShipping = Math.max(0, threshold - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / threshold) * 100));

  return {
    subtotal,
    discountAmount,
    discountedSubtotal,
    shippingCost,
    total,
    freeShippingThreshold: threshold,
    amountNeededForFreeShipping,
    freeShippingProgress,
    isEligibleForFreeShipping: subtotal >= threshold,
  };
}
