import { doc, setDoc, getDocs, collection } from 'firebase/firestore';
import { db } from './firebase';
import { products } from '../data/products';

export async function seedFirestoreProducts(forceOverwrite = false): Promise<{ count: number; message: string }> {
  try {
    const productsCol = collection(db, 'products');
    const existingSnap = await getDocs(productsCol);

    if (!forceOverwrite && !existingSnap.empty) {
      return {
        count: existingSnap.size,
        message: `Firestore already contains ${existingSnap.size} products. Skipped seed.`,
      };
    }

    let seededCount = 0;
    for (const prod of products) {
      const docRef = doc(db, 'products', prod.id);
      await setDoc(docRef, prod, { merge: true });
      seededCount++;
    }

    return {
      count: seededCount,
      message: `Successfully seeded ${seededCount} products into Firestore collection 'products'.`,
    };
  } catch (error: any) {
    console.error('Error seeding Firestore products:', error);
    throw new Error(error.message || 'Failed to seed products to Firestore');
  }
}
