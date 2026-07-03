import {
  collection,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
  Query,
  DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Build a collection reference for a user's data
 * Structure: users/{uid}/{collectionName}
 */
export function userCollectionRef(userId: string, collectionName: string) {
  return collection(db, `users/${userId}/${collectionName}`);
}

/**
 * Add a new item to a user's collection
 */
export async function addItem(
  userId: string,
  collectionName: string,
  data: any
) {
  if (!userId) throw new Error('User ID is required');
  try {
    const ref = userCollectionRef(userId, collectionName);
    const docRef = await addDoc(ref, {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    console.error(`Error adding to ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Delete an item from a user's collection
 */
export async function deleteItem(
  userId: string,
  collectionName: string,
  itemId: string
) {
  if (!userId) throw new Error('User ID is required');
  try {
    const docRef = doc(db, `users/${userId}/${collectionName}/${itemId}`);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting from ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Update an item in a user's collection
 */
export async function updateItem(
  userId: string,
  collectionName: string,
  itemId: string,
  data: any
) {
  if (!userId) throw new Error('User ID is required');
  try {
    const docRef = doc(db, `users/${userId}/${collectionName}/${itemId}`);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`Error updating ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Listen for real-time updates from a user's collection
 * Returns an unsubscribe function to stop listening
 */
export function listenToItems(
  userId: string,
  collectionName: string,
  onUpdate: (items: any[]) => void,
  onError?: (error: any) => void
): Unsubscribe {
  if (!userId) {
    onError?.(new Error('User ID is required'));
    return () => {};
  }

  try {
    const ref = userCollectionRef(userId, collectionName);
    const q = query(ref, orderBy('createdAt', 'desc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        onUpdate(items);
      },
      (error) => {
        console.error(`Error listening to ${collectionName}:`, error);
        onError?.(error);
      }
    );
  } catch (error) {
    console.error(`Error setting up listener for ${collectionName}:`, error);
    onError?.(error);
    return () => {};
  }
}

/**
 * Migrate data from localStorage to Firestore
 * Useful for one-time data transfer when user first signs in
 */
export async function migrateLocalStorageToFirestore(
  userId: string,
  localStorageKey: string,
  collectionName: string
): Promise<{ success: boolean; migratedCount: number; error?: string }> {
  try {
    const localData = localStorage.getItem(localStorageKey);
    if (!localData) {
      return { success: true, migratedCount: 0 };
    }

    const items = JSON.parse(localData);
    if (!Array.isArray(items) || items.length === 0) {
      return { success: true, migratedCount: 0 };
    }

    let migratedCount = 0;
    for (const item of items) {
      try {
        // Remove client-side id if present; Firestore will assign its own
        const { id, ...dataToSave } = item;
        await addItem(userId, collectionName, dataToSave);
        migratedCount++;
      } catch (err) {
        console.warn(`Failed to migrate item:`, err);
      }
    }

    // Clear localStorage after successful migration
    localStorage.removeItem(localStorageKey);

    return { success: true, migratedCount };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      migratedCount: 0,
      error: message,
    };
  }
}

/**
 * Batch migrate all Writer's Forge collections
 */
export async function migrateAllCollections(userId: string) {
  const collections = [
    { key: 'wf_characters', name: 'characters' },
    { key: 'wf_scenes', name: 'scenes' },
    { key: 'wf_timeline', name: 'timeline' },
    { key: 'wf_outline', name: 'outline' },
  ];

  const results = await Promise.all(
    collections.map(({ key, name }) =>
      migrateLocalStorageToFirestore(userId, key, name)
    )
  );

  return results;
}
