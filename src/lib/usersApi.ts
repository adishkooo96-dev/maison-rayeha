import {
  collection,
  doc,
  getDocs,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile } from '../types/auth';

export const USERS_COLLECTION = 'users';

/**
 * Fetch all user profiles from the 'users' Firestore collection.
 * Uses a single getDocs call (no onSnapshot subscription).
 */
export async function getAllUsers(): Promise<UserProfile[]> {
  try {
    const colRef = collection(db, USERS_COLLECTION);
    const snap = await getDocs(colRef);
    const users: UserProfile[] = [];

    snap.forEach((docSnap) => {
      const data = docSnap.data();
      users.push({
        uid: docSnap.id,
        name: data.name || '',
        email: data.email || '',
        phone: data.phone,
        photoURL: data.photoURL,
        role: data.role === 'admin' ? 'admin' : 'customer',
        isOwner: Boolean(data.isOwner),
        createdAt: data.createdAt || '',
        defaultAddress: data.defaultAddress,
      });
    });

    // Sort by createdAt descending if available, else by name/email
    users.sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return (a.name || a.email).localeCompare(b.name || b.email);
    });

    return users;
  } catch (error) {
    console.error('Error fetching users from Firestore:', error);
    throw error;
  }
}

/**
 * Update a user's role between 'customer' and 'admin'.
 * Can only be performed by an authenticated admin/owner per firestore.rules.
 */
export async function updateUserRole(uid: string, newRole: 'customer' | 'admin'): Promise<void> {
  const docRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(docRef, {
    role: newRole,
  });
}

/**
 * Update a user's isOwner flag.
 * Can ONLY be performed by an authenticated Owner (isOwner == true) per firestore.rules.
 */
export async function updateUserOwnerStatus(uid: string, isOwner: boolean): Promise<void> {
  const docRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(docRef, {
    isOwner: Boolean(isOwner),
  });
}

