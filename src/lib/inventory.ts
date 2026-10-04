import { Product } from '../types';

/**
 * Standard threshold for low-stock inventory alerts (inclusive: 1 to 5).
 */
export const LOW_STOCK_THRESHOLD = 5;

/**
 * Checks if a product has low stock (between 1 and LOW_STOCK_THRESHOLD).
 */
export function isLowStock(stock?: number | null): boolean {
  return typeof stock === 'number' && stock > 0 && stock <= LOW_STOCK_THRESHOLD;
}

/**
 * Checks if a product is completely out of stock (stockQuantity <= 0 or inStock is false).
 */
export function isOutOfStock(product: { stockQuantity?: number; inStock?: boolean } | null | undefined): boolean {
  if (!product) return true;
  if (typeof product.stockQuantity === 'number') {
    return product.stockQuantity <= 0;
  }
  return product.inStock === false;
}

/**
 * Normalizes a product so stockQuantity and derived inStock are always consistent.
 * Default fallback is 20 for inStock=true, 0 for inStock=false.
 */
export function normalizeProductStock(prod: Product): Product {
  const hasQty = typeof prod.stockQuantity === 'number' && !isNaN(prod.stockQuantity);
  const stockQuantity = hasQty ? Math.max(0, Math.floor(prod.stockQuantity!)) : prod.inStock ? 20 : 0;
  const inStock = stockQuantity > 0;

  return {
    ...prod,
    stockQuantity,
    inStock,
  };
}
