export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  photoURL?: string;
  role: 'customer' | 'admin';
  isOwner?: boolean;
  createdAt: string;
  defaultAddress?: {
    province?: string;
    city?: string;
    fullAddress?: string;
    postalCode?: string;
    unitFloor?: string;
  };
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface FirestoreOrder {
  id?: string;
  orderNumber: string;
  userId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  createdAt: string;
  status: OrderStatus;
  items: Array<{
    productId: string;
    productName: { fa: string; en: string };
    size: string;
    quantity: number;
    unitPrice: { fa: number; en: number };
    image?: string;
  }>;
  shippingAddress: any;
  shippingMethod: string;
  paymentMethod: string;
  couponCode?: string | null;
  discountAmount?: number;
  totals: {
    subtotal: number;
    discountAmount: number;
    shippingCost: number;
    total: number;
  };
  language: 'fa' | 'en';
}
