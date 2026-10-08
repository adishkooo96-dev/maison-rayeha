import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import { safeOnSnapshotQuery } from './safeSnapshot';
import { FirestoreOrder, OrderStatus } from '../types/auth';

const ORDERS_COLLECTION = 'orders';

/**
 * Creates an order in the Firestore 'orders' collection.
 */
export async function createOrderInFirestore(orderData: Omit<FirestoreOrder, 'id'>): Promise<string> {
  try {
    const ordersCol = collection(db, ORDERS_COLLECTION);
    const docRef = await addDoc(ordersCol, {
      ...orderData,
      createdAt: orderData.createdAt || new Date().toISOString(),
      status: orderData.status || 'pending',
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating order in Firestore:', error);
    throw error;
  }
}

/**
 * Fetch all orders for a specific logged-in user.
 */
export async function getUserOrders(userId: string): Promise<FirestoreOrder[]> {
  try {
    const ordersCol = collection(db, ORDERS_COLLECTION);
    // Query without compound sort first to avoid requiring a composite index immediately
    const q = query(ordersCol, where('userId', '==', userId));
    const snap = await getDocs(q);

    const orders: FirestoreOrder[] = [];
    snap.forEach((docSnap) => {
      orders.push({
        id: docSnap.id,
        ...(docSnap.data() as Omit<FirestoreOrder, 'id'>),
      });
    });

    // In-memory sort by date descending
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return orders;
  } catch (error) {
    console.warn('Error fetching user orders from Firestore:', error);
    return [];
  }
}

/**
 * Fetch all orders for the admin dashboard.
 */
export async function getAllOrders(): Promise<FirestoreOrder[]> {
  try {
    const ordersCol = collection(db, ORDERS_COLLECTION);
    const snap = await getDocs(ordersCol);

    const orders: FirestoreOrder[] = [];
    snap.forEach((docSnap) => {
      orders.push({
        id: docSnap.id,
        ...(docSnap.data() as Omit<FirestoreOrder, 'id'>),
      });
    });

    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return orders;
  } catch (error) {
    console.warn('Error fetching all orders from Firestore:', error);
    return [];
  }
}

/**
 * Real-time listener for all orders (used in Admin panel).
 */
export function subscribeToOrders(
  callback: (orders: FirestoreOrder[]) => void,
  onError?: (err: Error) => void
): () => void {
  try {
    const ordersCol = collection(db, ORDERS_COLLECTION);
    const unsubscribe = safeOnSnapshotQuery(
      ordersCol,
      (snap) => {
        const orders: FirestoreOrder[] = [];
        snap.forEach((docSnap) => {
          orders.push({
            id: docSnap.id,
            ...(docSnap.data() as Omit<FirestoreOrder, 'id'>),
          });
        });
        orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callback(orders);
      },
      (error) => {
        console.warn('[ordersApi] Snapshot error:', error);
        if (onError) onError(error);
      }
    );
    return unsubscribe;
  } catch (error: any) {
    console.warn('Could not establish orders snapshot listener:', error);
    return () => {};
  }
}

/**
 * Update an order's status (admin action).
 */
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  const docRef = doc(db, ORDERS_COLLECTION, orderId);
  await updateDoc(docRef, { status });
}
