import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableNetwork, disableNetwork } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export const firebaseConfig = {
  apiKey: "AIzaSyD5n_zrNKnPEyhs9azwrLDK6f-vPj6Ytv8",
  authDomain: "maison-rayeha.firebaseapp.com",
  projectId: "maison-rayeha",
  storageBucket: "maison-rayeha.firebasestorage.app",
  messagingSenderId: "486563691907",
  appId: "1:486563691907:web:39f25b03030c450ea7cab6",
  measurementId: "G-8PH4D8TTVT"
};

// Initialize Firebase once
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Connection status & auto-reconnect registry
let isConnected = typeof navigator !== 'undefined' ? navigator.onLine : true;
const connectionListeners = new Set<(connected: boolean) => void>();

export function isFirebaseOnline(): boolean {
  return isConnected;
}

export function subscribeFirebaseConnection(callback: (connected: boolean) => void): () => void {
  connectionListeners.add(callback);
  callback(isConnected);
  return () => {
    connectionListeners.delete(callback);
  };
}

function setConnectionState(connected: boolean) {
  if (isConnected !== connected) {
    isConnected = connected;
    connectionListeners.forEach((cb) => {
      try {
        cb(connected);
      } catch (err) {
        console.error('Connection listener error:', err);
      }
    });
  }
}

/**
 * Re-establishes Firebase connection and forces auth token renewal if user is signed in.
 * Safe to call repeatedly; throttles rapid calls to avoid spamming the backend.
 */
let lastReconnectTime = 0;
let isReconnectingInProgress = false;

// Track whether Firestore network was explicitly disabled by us
let isFirestoreNetworkDisabled = false;

export async function reconnectFirebase(forceTokenRefresh: boolean = true): Promise<{ success: boolean; error?: string }> {
  const now = Date.now();
  if (isReconnectingInProgress) {
    return { success: isConnected };
  }
  // Allow rapid reconnect if previous was offline or > 3000ms ago
  if (now - lastReconnectTime < 3000 && isConnected) {
    return { success: true };
  }

  isReconnectingInProgress = true;
  lastReconnectTime = now;

  try {
    // 1. Re-enable Firestore network sync ONLY if it was explicitly disabled
    // Redundant enableNetwork() on an active client triggers Firestore internal assertion ca9/b815
    if (isFirestoreNetworkDisabled) {
      try {
        await enableNetwork(db);
        isFirestoreNetworkDisabled = false;
      } catch (fsErr) {
        console.warn('[Firebase] enableNetwork notice:', fsErr);
      }
    }

    // 2. Refresh Auth user and ID token if signed in
    if (auth.currentUser) {
      try {
        await auth.currentUser.reload();
        if (forceTokenRefresh) {
          await auth.currentUser.getIdToken(true);
        }
      } catch (authErr: any) {
        console.warn('[Firebase] Token refresh notice:', authErr);
        // If token was revoked or expired beyond refresh, notify
        if (authErr?.code === 'auth/user-token-expired' || authErr?.code === 'auth/user-not-found') {
          // Token expired and cannot be refreshed, user needs to re-authenticate
          console.warn('[Firebase] User session expired; requires re-authentication');
        }
      }
    }

    setConnectionState(true);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('maison:firebase:reconnected', { detail: { timestamp: now } }));
    }

    return { success: true };
  } catch (err: any) {
    console.error('[Firebase] Reconnection failed:', err);
    setConnectionState(false);
    return { success: false, error: err?.message || 'Reconnection failed' };
  } finally {
    isReconnectingInProgress = false;
  }
}

// Global browser listeners for automatic background auto-reconnect
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[Firebase] Browser returned online; auto-reconnecting...');
    reconnectFirebase(true);
  });

  window.addEventListener('offline', () => {
    console.warn('[Firebase] Browser went offline');
    setConnectionState(false);
    try {
      isFirestoreNetworkDisabled = true;
      disableNetwork(db).catch(() => {});
    } catch {
      // Ignore
    }
  });

  // When user returns to tab after hours of backgrounding / sleep
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      // Proactively refresh connection and token without disturbing active Firestore watch stream
      reconnectFirebase(false);
    }
  });

  // Handle window focus (e.g. mobile tab switch back)
  window.addEventListener('focus', () => {
    reconnectFirebase(false);
  });
}

