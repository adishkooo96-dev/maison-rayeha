import {
  onSnapshot as firestoreOnSnapshot,
  DocumentReference,
  Query,
  DocumentSnapshot,
  QuerySnapshot,
  FirestoreError,
} from 'firebase/firestore';

/**
 * Checks whether an error is a fatal internal assertion failure from Firestore
 * (such as SDK bug ca9 / b815 with unexpected target state / watch stream aggregator).
 */
export function isFirestoreInternalAssertion(err: any): boolean {
  if (!err) return false;
  const msg = String(err?.message || err?.tl || err || '').toLowerCase();
  return (
    msg.includes('internal assertion failed') ||
    msg.includes('unexpected state (id: ca9)') ||
    msg.includes('unexpected state (id: b815)') ||
    msg.includes('watchchangeaggregator') ||
    msg.includes('targetid')
  );
}

/**
 * Safe wrapper around Firestore's onSnapshot for DocumentReference.
 * Automatically catches and swallows internal SDK assertion crashes (ca9 / b815)
 * so they don't break the application runtime or cause unhandled exceptions.
 */
export function safeOnSnapshotDoc<T = any>(
  docRef: DocumentReference<T>,
  onNext: (snapshot: DocumentSnapshot<T>) => void,
  onError?: (error: FirestoreError | Error) => void
): () => void {
  try {
    const unsubscribe = firestoreOnSnapshot(
      docRef,
      (snapshot) => {
        try {
          onNext(snapshot);
        } catch (innerErr) {
          console.error('[safeOnSnapshotDoc] Listener callback error:', innerErr);
        }
      },
      (error) => {
        if (isFirestoreInternalAssertion(error)) {
          console.warn('[safeOnSnapshotDoc] Suppressed internal Firestore assertion:', error.message);
          return;
        }
        if (onError) {
          onError(error);
        } else {
          console.warn('[safeOnSnapshotDoc] Snapshot error:', error);
        }
      }
    );

    return () => {
      try {
        unsubscribe();
      } catch (err) {
        if (!isFirestoreInternalAssertion(err)) {
          console.warn('[safeOnSnapshotDoc] Unsubscribe warning:', err);
        }
      }
    };
  } catch (err: any) {
    if (isFirestoreInternalAssertion(err)) {
      console.warn('[safeOnSnapshotDoc] Suppressed sync internal assertion:', err);
    } else if (onError) {
      onError(err);
    }
    return () => {};
  }
}

/**
 * Safe wrapper around Firestore's onSnapshot for Queries / Collections.
 * Automatically catches and swallows internal SDK assertion crashes (ca9 / b815).
 */
export function safeOnSnapshotQuery<T = any>(
  queryRef: Query<T>,
  onNext: (snapshot: QuerySnapshot<T>) => void,
  onError?: (error: FirestoreError | Error) => void
): () => void {
  try {
    const unsubscribe = firestoreOnSnapshot(
      queryRef,
      (snapshot) => {
        try {
          onNext(snapshot);
        } catch (innerErr) {
          console.error('[safeOnSnapshotQuery] Listener callback error:', innerErr);
        }
      },
      (error) => {
        if (isFirestoreInternalAssertion(error)) {
          console.warn('[safeOnSnapshotQuery] Suppressed internal Firestore assertion:', error.message);
          return;
        }
        if (onError) {
          onError(error);
        } else {
          console.warn('[safeOnSnapshotQuery] Snapshot error:', error);
        }
      }
    );

    return () => {
      try {
        unsubscribe();
      } catch (err) {
        if (!isFirestoreInternalAssertion(err)) {
          console.warn('[safeOnSnapshotQuery] Unsubscribe warning:', err);
        }
      }
    };
  } catch (err: any) {
    if (isFirestoreInternalAssertion(err)) {
      console.warn('[safeOnSnapshotQuery] Suppressed sync internal assertion:', err);
    } else if (onError) {
      onError(err);
    }
    return () => {};
  }
}
