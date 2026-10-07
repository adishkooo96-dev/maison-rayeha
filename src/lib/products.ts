import { Product, ProductFilters, SortOption, Language, ProductSizeOption } from '../types';
import { getLocalized } from './formatters';

/**
 * Returns the starting price (lowest price among available sizes or fallback to product.price)
 */
export function getStartingPrice(product: Product): { fa: number; en: number } {
  if (!product.sizes || product.sizes.length === 0) {
    return product.price;
  }

  // Find minimum price across size options
  const sortedSizes = [...product.sizes].sort((a, b) => a.ml - b.ml);
  const lowestSize = sortedSizes[0];
  return {
    fa: lowestSize.price?.fa ?? product.price?.fa ?? 0,
    en: lowestSize.price?.en ?? product.price?.en ?? 0,
  };
}

/**
 * Extracts numeric ml from string like "50ml", "100", 50
 */
export function parseSizeMl(size: string | number): number {
  if (typeof size === 'number') return size;
  const match = size.match(/\d+/);
  return match ? parseInt(match[0], 10) : 50;
}

/**
 * Returns the exact price for a given size
 */
export function getSizePrice(product: Product, size: string | number): { fa: number; en: number } {
  if (!product.sizes || product.sizes.length === 0) {
    return product.price;
  }

  const ml = parseSizeMl(size);
  const found = product.sizes.find((s) => s.ml === ml);

  if (found && found.price) {
    return found.price;
  }

  // Fallback to first size or product price
  return product.sizes[0]?.price ?? product.price;
}

/**
 * Calculates final price after product-level discount (if any)
 */
export function getDiscountedPrice(
  originalPrice: { fa: number; en: number },
  discountPercent?: number
): { fa: number; en: number } {
  if (!discountPercent || discountPercent <= 0) {
    return originalPrice;
  }

  const factor = (100 - discountPercent) / 100;
  return {
    fa: Math.round(originalPrice.fa * factor),
    en: Math.round(originalPrice.en * factor),
  };
}

/**
 * Finds a product by its unique slug
 */
export function getProductBySlug(slug: string, products: Product[]): Product | undefined {
  return products.find((p) => p.slug === slug);
}

/**
 * Related products: same scent family first, then same brand, excluding the current product
 */
export function getRelatedProducts(
  product: Product,
  allProducts: Product[],
  limit = 4
): Product[] {
  const others = allProducts.filter((p) => p.id !== product.id && p.slug !== product.slug);

  const sameFamily = others.filter((p) => p.scentFamily === product.scentFamily);
  const sameBrand = others.filter(
    (p) => p.brand === product.brand && p.scentFamily !== product.scentFamily
  );
  const remainder = others.filter(
    (p) => p.scentFamily !== product.scentFamily && p.brand !== product.brand
  );

  return [...sameFamily, ...sameBrand, ...remainder].slice(0, limit);
}

/**
 * Bilingual search against product attributes:
 * - Persian and English name
 * - Brand
 * - Scent family name
 * - Subtitle & description
 * - Top, heart, base notes
 */
export function searchProducts(
  products: Product[],
  query: string,
  _lang: Language = 'fa'
): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return products;

  return products.filter((p) => {
    // Check Persian name, English name, brand
    if (p.name.fa.toLowerCase().includes(q) || p.name.en.toLowerCase().includes(q)) return true;
    if (p.brand.toLowerCase().includes(q)) return true;
    if (p.subtitle.fa.toLowerCase().includes(q) || p.subtitle.en.toLowerCase().includes(q)) return true;
    if (p.description.fa.toLowerCase().includes(q) || p.description.en.toLowerCase().includes(q)) return true;
    if (p.scentFamily.toLowerCase().includes(q)) return true;

    // Check notes (top, heart, base) in both languages
    const allNotes = [
      ...p.notes.top.fa,
      ...p.notes.top.en,
      ...p.notes.heart.fa,
      ...p.notes.heart.en,
      ...p.notes.base.fa,
      ...p.notes.base.en,
    ];

    if (allNotes.some((note) => note.toLowerCase().includes(q))) {
      return true;
    }

    return false;
  });
}

/**
 * Filter products based on multi-criteria filters
 */
export function filterProducts(
  products: Product[],
  filters: ProductFilters,
  lang: Language = 'fa'
): Product[] {
  return products.filter((p) => {
    // 1. Gender filter
    if (filters.gender && filters.gender.length > 0) {
      if (!filters.gender.includes(p.gender)) {
        return false;
      }
    }

    // 2. Scent family filter
    if (filters.scentFamily && filters.scentFamily.length > 0) {
      if (!filters.scentFamily.includes(p.scentFamily)) {
        return false;
      }
    }

    // 3. Brand filter
    if (filters.brand && filters.brand.length > 0) {
      if (!filters.brand.includes(p.brand)) {
        return false;
      }
    }

    // 4. Size filter (check if product has any of the requested sizes)
    const targetSizes = filters.sizes || filters.size;
    if (targetSizes && targetSizes.length > 0) {
      const productMls = p.sizes.map((s) => s.ml);
      const hasAnySize = targetSizes.some((s) => {
        const ml = parseSizeMl(s);
        return productMls.includes(ml as any);
      });
      if (!hasAnySize) {
        return false;
      }
    }

    // 5. Price range filter (based on starting price in active currency)
    const startingPrice = getStartingPrice(p);
    const activePrice = getLocalized(startingPrice, lang) ?? 0;

    if (filters.minPrice !== undefined && filters.minPrice > 0) {
      if (activePrice < filters.minPrice) {
        return false;
      }
    }

    if (filters.maxPrice !== undefined && filters.maxPrice > 0) {
      if (activePrice > filters.maxPrice) {
        return false;
      }
    }

    // 6. Search query
    if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
      const matched = searchProducts([p], filters.searchQuery, lang);
      if (matched.length === 0) {
        return false;
      }
    }

    // 7. In-stock items only
    if (filters.inStockOnly) {
      if (!p.inStock) {
        return false;
      }
    }

    // 8. Discounted items only
    if (filters.discountedOnly) {
      if (!p.discountPercent || p.discountPercent <= 0) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Sort products by option
 */
export function sortProducts(
  products: Product[],
  sort: SortOption,
  lang: Language = 'fa'
): Product[] {
  const copy = [...products];

  switch (sort) {
    case 'popular':
      // Most popular: views (popularity) descending
      return copy.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

    case 'bestseller':
    case 'bestsellers':
      // Bestsellers: salesCount or isBestseller + reviewCount descending
      return copy.sort((a, b) => {
        if (b.salesCount !== undefined && a.salesCount !== undefined) {
          return b.salesCount - a.salesCount;
        }
        const bScore = (b.isBestseller ? 1000 : 0) + (b.reviewCount || 0);
        const aScore = (a.isBestseller ? 1000 : 0) + (a.reviewCount || 0);
        return bScore - aScore;
      });

    case 'newest':
      // Newest: createdAt date descending, fallback to isNew
      return copy.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
      });

    case 'price-asc':
    case 'priceAsc':
      return copy.sort((a, b) => {
        const priceA = getLocalized(getStartingPrice(a), lang) ?? 0;
        const priceB = getLocalized(getStartingPrice(b), lang) ?? 0;
        return priceA - priceB;
      });

    case 'price-desc':
    case 'priceDesc':
      return copy.sort((a, b) => {
        const priceA = getLocalized(getStartingPrice(a), lang) ?? 0;
        const priceB = getLocalized(getStartingPrice(b), lang) ?? 0;
        return priceB - priceA;
      });

    case 'featured':
    default:
      // Primary sort: Maison curation (bestsellers, new, high rating)
      return copy.sort((a, b) => {
        const scoreA = (a.isBestseller ? 2 : 0) + (a.isNew ? 1 : 0) + (a.rating ?? 4.5);
        const scoreB = (b.isBestseller ? 2 : 0) + (b.isNew ? 1 : 0) + (b.rating ?? 4.5);
        return scoreB - scoreA;
      });
  }
}
