import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem, Product, Language, ShippingMethodId, Coupon } from '../types';
import { getSizePrice } from '../lib/products';
import { getLocalized } from '../lib/formatters';
import {
  calculateOrderTotals,
  calculateShippingCost,
  calculateDiscountAmount,
} from '../lib/pricing';

interface CartState {
  items: CartItem[];
  isCartOpen: boolean;
  coupon: Coupon | null;
  shippingMethod: ShippingMethodId;

  // Actions
  addItem: (product: Product, size?: string | number, quantity?: number) => boolean;
  removeItem: (productId: string, size: string) => void;
  restoreItem: (item: CartItem) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  setCoupon: (coupon: Coupon | null) => void;
  removeCoupon: () => void;
  setShippingMethod: (method: ShippingMethodId) => void;
  syncProducts: (products: Product[]) => void;
  hasOutOfStockItems: () => boolean;
  getOutOfStockItems: () => CartItem[];
  removeOutOfStockItems: () => void;

  // Computed helpers
  getItemCount: () => number;
  getTotalCount: () => number;
  getSubtotal: (lang: Language) => number;
  getDiscountAmount: (lang: Language) => number;
  getShippingCost: (lang: Language) => number;
  getTotal: (lang: Language) => number;
  getTotals: (lang: Language) => ReturnType<typeof calculateOrderTotals>;
}

function normalizeSizeString(size?: string | number, defaultSizes?: { ml: number }[]): string {
  if (typeof size === 'number') {
    return `${size}ml`;
  }
  if (typeof size === 'string' && size.trim().length > 0) {
    return size.includes('ml') ? size.trim() : `${size.trim()}ml`;
  }
  if (defaultSizes && defaultSizes.length > 0) {
    return `${defaultSizes[0].ml}ml`;
  }
  return '50ml';
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isCartOpen: false,
      coupon: null,
      shippingMethod: 'standard',

      addItem: (product: Product, size?: string | number, quantity = 1) => {
        // Defensive check: Do not allow out-of-stock items to be added to cart
        const maxStock =
          typeof product.stockQuantity === 'number'
            ? product.stockQuantity
            : product.inStock === false
            ? 0
            : 20;

        if (product.inStock === false || maxStock <= 0) {
          console.warn(`Product ${product.id} is out of stock. Cannot add to cart.`);
          return false;
        }

        const chosenSize = normalizeSizeString(size, product.sizes);
        const unitPrice = getSizePrice(product, chosenSize);

        set((state) => {
          // Line identified by productId + size
          const existingIndex = state.items.findIndex(
            (item) => item.product?.id === product.id && item.size === chosenSize
          );

          if (existingIndex > -1) {
            const currentQty = state.items[existingIndex].quantity;
            const newQty = Math.min(maxStock, currentQty + quantity);
            const updated = [...state.items];
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity: newQty,
              unitPrice, // refresh unit price
            };
            return { items: updated, isCartOpen: true };
          } else {
            return {
              items: [
                ...state.items,
                {
                  product,
                  size: chosenSize,
                  quantity: Math.min(maxStock, quantity),
                  unitPrice,
                },
              ],
              isCartOpen: true,
            };
          }
        });
        return true;
      },

      removeItem: (productId: string, size: string) => {
        set((state) => {
          const newItems = state.items.filter(
            (item) => !(item.product?.id === productId && item.size === size)
          );
          return {
            items: newItems,
            coupon: newItems.length === 0 ? null : state.coupon,
          };
        });
      },

      restoreItem: (item: CartItem) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (i) => i.product?.id === item.product.id && i.size === item.size
          );
          if (existingIndex > -1) {
            const updated = [...state.items];
            updated[existingIndex] = {
              ...updated[existingIndex],
              quantity: updated[existingIndex].quantity + item.quantity,
            };
            return { items: updated };
          }
          return { items: [...state.items, item] };
        });
      },

      updateQuantity: (productId: string, size: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId, size);
          return;
        }
        set((state) => ({
          items: state.items.map((item) => {
            if (item.product?.id === productId && item.size === size) {
              const maxStock =
                typeof item.product?.stockQuantity === 'number'
                  ? item.product.stockQuantity
                  : item.product?.inStock === false
                  ? 0
                  : 20;
              const clampedQty = maxStock > 0 ? Math.min(maxStock, quantity) : quantity;
              return { ...item, quantity: clampedQty };
            }
            return item;
          }),
        }));
      },

      clearCart: () => {
        set({ items: [], coupon: null });
      },

      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

      setCoupon: (coupon: Coupon | null) => set({ coupon }),
      removeCoupon: () => set({ coupon: null }),
      setShippingMethod: (shippingMethod: ShippingMethodId) => set({ shippingMethod }),

      syncProducts: (productsList: Product[]) => {
        if (!productsList || productsList.length === 0) return;
        set((state) => {
          let hasChanges = false;
          const updatedItems = state.items.map((item) => {
            const match = productsList.find(
              (p) => p.id === item.product?.id || p.slug === item.product?.slug
            );
            if (
              match &&
              (match.inStock !== item.product?.inStock ||
                match.stockQuantity !== item.product?.stockQuantity)
            ) {
              hasChanges = true;
              return {
                ...item,
                product: {
                  ...item.product,
                  ...match,
                  inStock: match.inStock,
                  stockQuantity: match.stockQuantity,
                },
              };
            }
            return item;
          });
          if (hasChanges) {
            return { items: updatedItems };
          }
          return state;
        });
      },

      hasOutOfStockItems: () => {
        return get().items.some(
          (item) => item.product?.inStock === false || item.product?.stockQuantity === 0
        );
      },

      getOutOfStockItems: () => {
        return get().items.filter(
          (item) => item.product?.inStock === false || item.product?.stockQuantity === 0
        );
      },

      removeOutOfStockItems: () => {
        set((state) => {
          const newItems = state.items.filter(
            (item) => item.product?.inStock !== false && item.product?.stockQuantity !== 0
          );
          return {
            items: newItems,
            coupon: newItems.length === 0 ? null : state.coupon,
          };
        });
      },

      getItemCount: () => {
        return get().items.reduce((total, item) => total + (item.quantity || 0), 0);
      },

      getTotalCount: () => {
        return get().items.reduce((total, item) => total + (item.quantity || 0), 0);
      },

      getSubtotal: (lang: Language) => {
        return get().items.reduce((sum, item) => {
          if (!item.product) return sum;
          const priceObj = item.unitPrice || getSizePrice(item.product, item.size);
          const unitPrice = getLocalized(priceObj, lang) ?? 0;
          return sum + unitPrice * (item.quantity || 1);
        }, 0);
      },

      getDiscountAmount: (lang: Language) => {
        const subtotal = get().getSubtotal(lang);
        const coupon = get().coupon;
        if (!coupon) return 0;
        return calculateDiscountAmount(subtotal, coupon);
      },

      getShippingCost: (lang: Language) => {
        const subtotal = get().getSubtotal(lang);
        const method = get().shippingMethod;
        return calculateShippingCost(subtotal, method, lang);
      },

      getTotal: (lang: Language) => {
        const subtotal = get().getSubtotal(lang);
        const method = get().shippingMethod;
        const coupon = get().coupon;
        const totals = calculateOrderTotals(subtotal, method, coupon, lang);
        return totals.total;
      },

      getTotals: (lang: Language) => {
        const subtotal = get().getSubtotal(lang);
        const method = get().shippingMethod;
        const coupon = get().coupon;
        return calculateOrderTotals(subtotal, method, coupon, lang);
      },
    }),
    {
      name: 'maison_rayeha_cart_v4',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        // Intentionally do NOT persist coupon in localStorage across sessions
        shippingMethod: state.shippingMethod,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Explicitly guarantee coupon is reset to null on start / rehydration
          state.coupon = null;
          // Clean legacy v3 stored coupons if present in localStorage
          if (typeof window !== 'undefined' && window.localStorage) {
            try {
              window.localStorage.removeItem('maison_rayeha_cart_v3');
              window.localStorage.removeItem('maison_rayeha_cart_v2');
              window.localStorage.removeItem('maison_rayeha_cart_v1');
            } catch (e) {
              // Ignore in non-browser contexts
            }
          }
          if (Array.isArray(state.items)) {
            state.items = state.items
              .filter((item) => item && item.product && item.product.id)
              .map((item) => ({
                ...item,
                size: item.size || '50ml',
                quantity: Math.max(1, item.quantity || 1),
                unitPrice: item.unitPrice || getSizePrice(item.product, item.size || '50ml'),
              }));
          }
          if (!state.shippingMethod) {
            state.shippingMethod = 'standard';
          }
        }
      },
    }
  )
);
