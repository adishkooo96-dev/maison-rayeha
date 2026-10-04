import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Coupon, Language } from '../types';

export const COUPONS_COLLECTION = 'coupons';

export interface FirestoreCoupon {
  code: string; // Document ID (uppercase, e.g. "WELCOME10")
  type: 'percent' | 'fixed';
  value: number; // 1-100 for percent, or amount in Toman for fixed
  isActive: boolean;
  expiresAt: Timestamp | string | null;
  minOrderAmount: number; // 0 = none
  note?: string;
  createdAt: any;
  updatedAt?: any;
}

export interface CouponValidationResult {
  valid: boolean;
  coupon?: Coupon;
  errorMessage?: {
    fa: string;
    en: string;
  };
}

/**
 * Validates a single coupon code against Firestore.
 * IMPORTANT: Reads ONLY that single document with getDoc(doc(db, "coupons", code)).
 * Does NOT list the collection.
 */
export async function validateCouponInFirestore(
  rawCode: string,
  subtotal: number,
  _lang?: Language
): Promise<CouponValidationResult> {
  const normalized = (rawCode || '').trim().toUpperCase();

  if (!normalized) {
    return {
      valid: false,
      errorMessage: {
        fa: 'لطفاً کد تخفیف را وارد نمایید.',
        en: 'Please enter a discount code.',
      },
    };
  }

  try {
    const docRef = doc(db, COUPONS_COLLECTION, normalized);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return {
        valid: false,
        errorMessage: {
          fa: 'کد تخفیف وارد شده معتبر نمی‌باشد.',
          en: 'The discount code is invalid.',
        },
      };
    }

    const data = docSnap.data() as FirestoreCoupon;

    // Check if active
    if (data.isActive === false) {
      return {
        valid: false,
        errorMessage: {
          fa: 'این کد تخفیف در حال حاضر غیرفعال می‌باشد.',
          en: 'This discount code is currently inactive.',
        },
      };
    }

    // Check expiry
    if (data.expiresAt) {
      let expiryTime: number;
      if (typeof (data.expiresAt as any)?.toDate === 'function') {
        expiryTime = (data.expiresAt as Timestamp).toDate().getTime();
      } else if (typeof data.expiresAt === 'string') {
        expiryTime = new Date(data.expiresAt).getTime();
      } else if (typeof data.expiresAt === 'number') {
        expiryTime = data.expiresAt;
      } else {
        expiryTime = new Date(data.expiresAt as any).getTime();
      }

      if (!isNaN(expiryTime) && expiryTime < Date.now()) {
        return {
          valid: false,
          errorMessage: {
            fa: 'مهلت استفاده از این کد تخفیف به پایان رسیده است.',
            en: 'This discount code has expired.',
          },
        };
      }
    }

    // Check minimum order amount
    const minOrder = Number(data.minOrderAmount) || 0;
    if (minOrder > 0 && subtotal < minOrder) {
      return {
        valid: false,
        errorMessage: {
          fa: `حداقل مبلغ سفارش برای استفاده از این کد ${minOrder.toLocaleString('fa-IR')} تومان است.`,
          en: `Minimum order amount for this discount code is ${minOrder.toLocaleString('en-US')} Toman.`,
        },
      };
    }

    const couponType: 'percent' | 'fixed' = data.type === 'fixed' ? 'fixed' : 'percent';
    const couponValue = Number(data.value) || 0;

    let expiresAtIso: string | null = null;
    if (data.expiresAt) {
      if (typeof (data.expiresAt as any)?.toDate === 'function') {
        expiresAtIso = (data.expiresAt as Timestamp).toDate().toISOString();
      } else if (typeof data.expiresAt === 'string') {
        expiresAtIso = data.expiresAt;
      }
    }

    return {
      valid: true,
      coupon: {
        code: normalized,
        type: couponType,
        value: couponValue,
        discountPercent: couponType === 'percent' ? couponValue : undefined,
        minOrderAmount: minOrder,
        expiresAt: expiresAtIso,
        isActive: true,
        note: data.note,
      },
    };
  } catch (error) {
    console.error('Error validating coupon in Firestore:', error);
    return {
      valid: false,
      errorMessage: {
        fa: 'خطا در بررسی کد تخفیف. لطفاً مجدداً تلاش نمایید.',
        en: 'Error validating discount code. Please try again.',
      },
    };
  }
}

/**
 * Admin: Fetch all coupons once via getDocs (no onSnapshot).
 */
export async function getAllCoupons(): Promise<FirestoreCoupon[]> {
  try {
    const colRef = collection(db, COUPONS_COLLECTION);
    const snap = await getDocs(colRef);
    const coupons: FirestoreCoupon[] = [];

    snap.forEach((docSnap) => {
      const data = docSnap.data();
      coupons.push({
        code: docSnap.id,
        type: data.type === 'fixed' ? 'fixed' : 'percent',
        value: Number(data.value) || 0,
        isActive: data.isActive ?? true,
        expiresAt: data.expiresAt || null,
        minOrderAmount: Number(data.minOrderAmount) || 0,
        note: data.note || '',
        createdAt: data.createdAt || null,
        updatedAt: data.updatedAt || null,
      });
    });

    coupons.sort((a, b) => a.code.localeCompare(b.code));
    return coupons;
  } catch (error) {
    console.error('Error fetching all coupons:', error);
    throw error;
  }
}

/**
 * Admin: Create or update a coupon in Firestore.
 */
export async function saveCoupon(
  coupon: Omit<FirestoreCoupon, 'createdAt' | 'updatedAt'>,
  isEdit = false
): Promise<void> {
  const code = coupon.code.trim().toUpperCase();
  if (!code) {
    throw new Error('Code is required');
  }

  const docRef = doc(db, COUPONS_COLLECTION, code);

  if (!isEdit) {
    // Check uniqueness
    const existing = await getDoc(docRef);
    if (existing.exists()) {
      throw new Error(`کد تخفیف "${code}" قبلاً ثبت شده است.`);
    }
  }

  let expiresAtValue: any = null;
  if (coupon.expiresAt) {
    if (typeof (coupon.expiresAt as any)?.toDate === 'function') {
      expiresAtValue = coupon.expiresAt;
    } else if (typeof coupon.expiresAt === 'string') {
      expiresAtValue = Timestamp.fromDate(new Date(coupon.expiresAt));
    }
  }

  const payload: any = {
    code,
    type: coupon.type,
    value: Number(coupon.value),
    isActive: Boolean(coupon.isActive),
    expiresAt: expiresAtValue,
    minOrderAmount: Number(coupon.minOrderAmount) || 0,
    note: coupon.note ? coupon.note.trim() : '',
    updatedAt: serverTimestamp(),
  };

  if (!isEdit) {
    payload.createdAt = serverTimestamp();
    await setDoc(docRef, payload);
  } else {
    await updateDoc(docRef, payload);
  }
}

/**
 * Admin: Toggle active state directly from table.
 */
export async function toggleCouponActive(code: string, currentStatus: boolean): Promise<void> {
  const docRef = doc(db, COUPONS_COLLECTION, code);
  await updateDoc(docRef, {
    isActive: !currentStatus,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Admin: Delete a coupon document.
 */
export async function deleteCoupon(code: string): Promise<void> {
  const docRef = doc(db, COUPONS_COLLECTION, code);
  await deleteDoc(docRef);
}

/**
 * Admin: One-time seed default codes (WELCOME10 = 10% and LUXE20 = 20%).
 * Only creates them if they don't already exist.
 */
export async function seedDefaultCoupons(): Promise<{ createdCount: number; existingCount: number }> {
  const defaultCodes = [
    {
      code: 'WELCOME10',
      type: 'percent' as const,
      value: 10,
      isActive: true,
      expiresAt: null,
      minOrderAmount: 0,
      note: 'کد تخفیف ۱۰ درصدی پیش‌فرض خوش‌آمدگویی',
    },
    {
      code: 'LUXE20',
      type: 'percent' as const,
      value: 20,
      isActive: true,
      expiresAt: null,
      minOrderAmount: 0,
      note: 'کد تخفیف ۲۰ درصدی مشتریان ویژه',
    },
  ];

  let createdCount = 0;
  let existingCount = 0;

  for (const item of defaultCodes) {
    const docRef = doc(db, COUPONS_COLLECTION, item.code);
    const existing = await getDoc(docRef);
    if (!existing.exists()) {
      await setDoc(docRef, {
        code: item.code,
        type: item.type,
        value: item.value,
        isActive: item.isActive,
        expiresAt: item.expiresAt,
        minOrderAmount: item.minOrderAmount,
        note: item.note,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      createdCount++;
    } else {
      existingCount++;
    }
  }

  return { createdCount, existingCount };
}
