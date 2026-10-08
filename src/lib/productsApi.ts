import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { safeOnSnapshotQuery } from './safeSnapshot';
import { Product, ProductFilters, SortOption } from '../types';
import { products as fallbackProducts } from '../data/products';
import { normalizeProductStock } from './inventory';

const PRODUCTS_COLLECTION = 'products';

// Maintain in-memory cached products list and listener registry for instant real-time updates
let cachedProducts: Product[] = fallbackProducts.map(normalizeProductStock);
const localSubscribers = new Set<(products: Product[]) => void>();

function notifySubscribers(productsList: Product[]) {
  cachedProducts = productsList.map(normalizeProductStock);
  localSubscribers.forEach((cb) => {
    try {
      cb(cachedProducts);
    } catch (e) {
      console.error('Subscriber callback error:', e);
    }
  });
}

// Single shared Firestore onSnapshot listener for the whole application
// Having multiple parallel listeners on the products collection causes Firestore assertion collisions (ca9 / b815)
let globalUnsubscribeFirestore: (() => void) | null = null;

function ensureGlobalFirestoreListener() {
  if (globalUnsubscribeFirestore) return;

  try {
    const productsCol = collection(db, PRODUCTS_COLLECTION);
    globalUnsubscribeFirestore = safeOnSnapshotQuery(
      productsCol,
      (snap) => {
        if (!snap.empty) {
          const items: Product[] = [];
          snap.forEach((docSnap) => {
            items.push(
              normalizeProductStock({
                ...(docSnap.data() as Product),
                id: docSnap.id,
              })
            );
          });
          notifySubscribers(items);
        }
      },
      (error) => {
        console.warn('[productsApi] Snapshot error:', error);
      }
    );
  } catch (error) {
    console.warn('[productsApi] Could not establish products snapshot listener:', error);
  }
}

function releaseGlobalFirestoreListenerIfUnused() {
  if (localSubscribers.size === 0 && globalUnsubscribeFirestore) {
    try {
      globalUnsubscribeFirestore();
    } catch {
      // Ignore
    }
    globalUnsubscribeFirestore = null;
  }
}

/**
 * Fetch all products from Firestore or in-memory cache.
 */
export async function getAllProducts(): Promise<Product[]> {
  try {
    const productsCol = collection(db, PRODUCTS_COLLECTION);
    const snap = await getDocs(productsCol);

    if (snap.empty) {
      return cachedProducts;
    }

    const items: Product[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data() as Product;
      items.push(
        normalizeProductStock({
          ...data,
          id: docSnap.id,
        })
      );
    });

    cachedProducts = items;
    return items;
  } catch (error) {
    console.warn('Firestore fetch failed, falling back to cached dataset:', error);
    return cachedProducts;
  }
}

/**
 * Real-time listener for products (used in admin, layout, shop, and product details).
 * Shares a single underlying Firestore snapshot across all components to eliminate assertion errors.
 */
export function subscribeToProducts(
  callback: (products: Product[]) => void,
  _onError?: (err: Error) => void
): () => void {
  // Immediately call with current cached list
  callback(cachedProducts);
  localSubscribers.add(callback);

  // Ensure the shared Firestore subscription is active
  ensureGlobalFirestoreListener();

  return () => {
    localSubscribers.delete(callback);
    releaseGlobalFirestoreListenerIfUnused();
  };
}

/**
 * Get single product by slug.
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const inCache = cachedProducts.find((p) => p.slug === slug || p.id === slug);
  if (inCache) return inCache;

  try {
    const productsCol = collection(db, PRODUCTS_COLLECTION);
    const q = query(productsCol, where('slug', '==', slug));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const firstDoc = snap.docs[0];
      return {
        ...(firstDoc.data() as Product),
        id: firstDoc.id,
      };
    }

    const docRef = doc(db, PRODUCTS_COLLECTION, slug);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        ...(docSnap.data() as Product),
        id: docSnap.id,
      };
    }

    return null;
  } catch (err) {
    console.warn('Error fetching product by slug from Firestore:', err);
    return null;
  }
}

/**
 * Get bestseller products.
 */
export async function getBestsellers(): Promise<Product[]> {
  const all = await getAllProducts();
  return all.filter((p) => p.isBestseller);
}

/**
 * Create a new product in Firestore.
 */
export async function createProduct(productData: Omit<Product, 'id'> & { id?: string }): Promise<Product> {
  const id = productData.id || productData.slug || `prod-${Date.now()}`;
  const stockQuantity =
    typeof productData.stockQuantity === 'number' && !isNaN(productData.stockQuantity)
      ? Math.max(0, Math.floor(productData.stockQuantity))
      : productData.inStock === false
      ? 0
      : 20;
  const inStock = stockQuantity > 0;

  const newProduct: Product = normalizeProductStock({
    ...productData,
    id,
    stockQuantity,
    inStock,
    createdAt: productData.createdAt || new Date().toISOString(),
  });

  // 1. Immediately update local cache and notify listeners
  cachedProducts = [newProduct, ...cachedProducts.filter((p) => p.id !== id)];
  notifySubscribers(cachedProducts);

  // 2. Persist to Firestore
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    await setDoc(docRef, newProduct);
  } catch (err) {
    console.warn('Could not persist new product to Firestore, saved in local cache:', err);
  }

  return newProduct;
}

/**
 * Update an existing product in Firestore.
 * Always keeps stockQuantity and derived inStock synchronized.
 */
export async function updateProduct(id: string, updates: Partial<Product>): Promise<void> {
  const sanitizedUpdates: Partial<Product> = { ...updates };

  // If stockQuantity is provided, derive inStock automatically
  if (typeof updates.stockQuantity === 'number' && !isNaN(updates.stockQuantity)) {
    const qty = Math.max(0, Math.floor(updates.stockQuantity));
    sanitizedUpdates.stockQuantity = qty;
    sanitizedUpdates.inStock = qty > 0;
  } else if (updates.inStock !== undefined && updates.stockQuantity === undefined) {
    // If inStock was passed without stockQuantity, update stockQuantity accordingly
    sanitizedUpdates.stockQuantity = updates.inStock ? 20 : 0;
  }

  // 1. Update in-memory cache and notify all listeners immediately
  const existing = cachedProducts.find((p) => p.id === id || p.slug === id);
  if (existing) {
    cachedProducts = cachedProducts.map((p) =>
      p.id === id || p.slug === id ? normalizeProductStock({ ...p, ...sanitizedUpdates }) : p
    );
  } else {
    cachedProducts = [
      normalizeProductStock({ ...sanitizedUpdates, id } as Product),
      ...cachedProducts,
    ];
  }
  notifySubscribers(cachedProducts);

  // 2. Persist to Firestore with setDoc(..., { merge: true })
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    const updatedProd = cachedProducts.find((p) => p.id === id || p.slug === id);
    if (updatedProd) {
      await setDoc(docRef, updatedProd, { merge: true });
    } else {
      await setDoc(docRef, sanitizedUpdates, { merge: true });
    }
  } catch (err) {
    console.warn('Could not persist product update to Firestore, saved to local cache:', err);
  }
}

/**
 * Decrement stock quantity for items in an order (best-effort update).
 * Clamped at 0 and derives inStock = stockQuantity > 0.
 */
export async function decrementProductStockForOrder(
  items: { productId: string; quantity: number }[]
): Promise<void> {
  for (const item of items) {
    try {
      if (!item.productId) continue;
      const targetId = item.productId;
      const docRef = doc(db, PRODUCTS_COLLECTION, targetId);
      const snap = await getDoc(docRef);

      let currentQty = 20;
      if (snap.exists()) {
        const data = snap.data() as Product;
        if (typeof data.stockQuantity === 'number') {
          currentQty = data.stockQuantity;
        } else if (data.inStock === false) {
          currentQty = 0;
        }
      } else {
        const inMemory = cachedProducts.find((p) => p.id === targetId || p.slug === targetId);
        if (inMemory) {
          currentQty = typeof inMemory.stockQuantity === 'number' ? inMemory.stockQuantity : inMemory.inStock ? 20 : 0;
        }
      }

      const decrAmount = Math.max(1, item.quantity || 1);
      const newStock = Math.max(0, currentQty - decrAmount);
      const newInStock = newStock > 0;

      // Update Firestore document
      await setDoc(docRef, { stockQuantity: newStock, inStock: newInStock }, { merge: true });

      // Update local memory
      cachedProducts = cachedProducts.map((p) =>
        p.id === targetId || p.slug === targetId
          ? { ...p, stockQuantity: newStock, inStock: newInStock }
          : p
      );
      notifySubscribers(cachedProducts);
    } catch (err) {
      console.warn(`Best-effort stock decrement failed for product ${item.productId}:`, err);
    }
  }
}

/**
 * One-time migration function to inspect all products in Firestore
 * and populate stockQuantity on any documents missing it.
 */
export async function migrateProductStockQuantities(): Promise<{
  totalCount: number;
  migratedCount: number;
  message: string;
}> {
  try {
    const productsCol = collection(db, PRODUCTS_COLLECTION);
    const snap = await getDocs(productsCol);
    if (snap.empty) {
      return { totalCount: 0, migratedCount: 0, message: 'No products in database to migrate.' };
    }

    let migratedCount = 0;
    const updatePromises: Promise<any>[] = [];

    snap.forEach((docSnap) => {
      const data = docSnap.data() as Product;
      if (typeof data.stockQuantity !== 'number') {
        const defaultQty = data.inStock === false ? 0 : 20;
        const derivedInStock = defaultQty > 0;
        updatePromises.push(
          setDoc(
            doc(db, PRODUCTS_COLLECTION, docSnap.id),
            { stockQuantity: defaultQty, inStock: derivedInStock },
            { merge: true }
          )
        );
        migratedCount++;
      }
    });

    if (updatePromises.length > 0) {
      await Promise.all(updatePromises);
      // Refresh memory cache
      await getAllProducts();
    }

    return {
      totalCount: snap.size,
      migratedCount,
      message: `Migration complete: verified ${snap.size} products, updated ${migratedCount} documents with numeric stock.`,
    };
  } catch (error: any) {
    console.warn('Migration failed or skipped due to network/permissions:', error);
    return {
      totalCount: cachedProducts.length,
      migratedCount: 0,
      message: error?.message || 'Migration encountered an error.',
    };
  }
}

/**
 * Delete a product from Firestore.
 */
export async function deleteProduct(id: string): Promise<void> {
  cachedProducts = cachedProducts.filter((p) => p.id !== id && p.slug !== id);
  notifySubscribers(cachedProducts);

  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Could not delete product in Firestore:', err);
  }
}


