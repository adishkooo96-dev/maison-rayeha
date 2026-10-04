export type Language = 'fa' | 'en';
export type Direction = 'rtl' | 'ltr';

export interface LocalizedString {
  fa: string;
  en: string;
}

export interface LocalizedStringArray {
  fa: string[];
  en: string[];
}

export interface ProductNotes {
  top: LocalizedStringArray;
  heart: LocalizedStringArray;
  base: LocalizedStringArray;
}

export type ScentFamilyId = 'floral' | 'woody' | 'oriental' | 'fresh' | 'citrus';
export type Gender = 'unisex' | 'feminine' | 'masculine';
export type FragranceGender = Gender;

export interface ProductSizeOption {
  ml: 30 | 50 | 100;
  price: {
    fa: number; // in Toman
    en: number; // in USD
  };
}

export interface Product {
  id: string;
  slug: string;
  brand: string;
  name: LocalizedString;
  subtitle: LocalizedString;
  description: LocalizedString;
  price: {
    fa: number; // in Toman (starting price)
    en: number; // in USD (starting price)
  };
  sizes: ProductSizeOption[];
  scentFamily: ScentFamilyId;
  gender: Gender;
  notes: ProductNotes;
  images: string[];
  isBestseller: boolean;
  isNew: boolean;
  inStock: boolean;
  stockQuantity?: number; // numeric stock inventory (derived inStock = stockQuantity > 0)
  discountPercent?: number; // e.g. 15 for 15% discount
  popularity: number; // views count (e.g. 18450)
  salesCount?: number; // total units sold
  createdAt?: string; // ISO date string (e.g. '2026-08-20')
  rating?: number;
  reviewCount?: number;
  concentration?: LocalizedString; // e.g. Extrait de Parfum / Eau de Parfum
  longevity?: number; // 1 - 5 (e.g. 4.8)
  sillage?: number; // 1 - 5 (e.g. 4.5)
}

export interface CollectionItem {
  id: string;
  slug: string;
  title: LocalizedString;
  subtitle: LocalizedString;
  description: LocalizedString;
  image: string;
  itemCount: number;
}

export interface ScentFamily {
  id: ScentFamilyId;
  name: LocalizedString;
  tagline: LocalizedString;
  description: LocalizedString;
  characteristicNotes: LocalizedStringArray;
  image: string;
}

export interface CartItem {
  product: Product;
  size: string; // e.g. '30ml' | '50ml' | '100ml'
  quantity: number;
  unitPrice?: {
    fa: number;
    en: number;
  };
}

export type ShippingMethodId = 'standard' | 'express';

export interface ShippingMethod {
  id: ShippingMethodId;
  name: LocalizedString;
  estimatedDays: LocalizedString;
  price: {
    fa: number; // in Toman
    en: number; // in USD
  };
}

export interface Coupon {
  code: string;
  type?: 'percent' | 'fixed';
  value?: number;
  discountPercent?: number; // legacy percent or convenience alias
  minOrderAmount?: number;
  expiresAt?: string | null;
  isActive?: boolean;
  note?: string;
}

export interface PersianShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  province: string;
  city: string;
  fullAddress: string;
  postalCode: string;
  unitFloor?: string;
  orderNote?: string;
}

export interface EnglishShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  country: string;
  city: string;
  state: string;
  addressLine1: string;
  addressLine2?: string;
  postalCode: string;
  orderNote?: string;
}

export type PaymentMethodId = 'online' | 'cod' | 'card' | 'paypal';

export interface Order {
  orderNumber: string;
  createdAt: string;
  items: CartItem[];
  shippingAddress: PersianShippingAddress | EnglishShippingAddress;
  shippingMethod: ShippingMethodId;
  paymentMethod: PaymentMethodId;
  coupon?: Coupon | null;
  totals: {
    subtotal: number;
    discountAmount: number;
    shippingCost: number;
    total: number;
  };
  language: Language;
}

export type SortOption =
  | 'featured'
  | 'popular'
  | 'bestseller'
  | 'bestsellers'
  | 'newest'
  | 'price-asc'
  | 'price-desc'
  | 'priceAsc'
  | 'priceDesc';

export interface ProductFilters {
  gender?: Gender[];
  scentFamily?: ScentFamilyId[];
  brand?: string[];
  size?: (number | string)[]; // [30, 50, 100] or ['30ml', '50ml', '100ml']
  sizes?: string[]; // e.g. ['30ml', '50ml', '100ml']
  minPrice?: number;
  maxPrice?: number;
  searchQuery?: string;
  inStockOnly?: boolean;
  discountedOnly?: boolean;
}
