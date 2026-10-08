import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { reconnectFirebase } from '../lib/firebase';
import { isFirestoreInternalAssertion } from '../lib/safeSnapshot';

interface NetworkContextType {
  isOnline: boolean;
  hasNetworkError: boolean;
  errorMessage: string | null;
  isReconnecting: boolean;
  retryConnection: () => Promise<boolean>;
  reportNetworkError: (msg?: string) => void;
  clearNetworkError: () => void;
}

const NetworkContext = createContext<NetworkContextType | null>(null);

function isLikelyNetworkError(err: any): boolean {
  if (!err) return false;
  if (err.isNetworkError) return true;
  const msg = String(err?.message || err?.reason || err || '').toLowerCase();
  const name = String(err?.name || '').toLowerCase();
  const code = String(err?.code || '').toLowerCase();

  return (
    msg.includes('failed to fetch') ||
    msg.includes('networkerror') ||
    msg.includes('network request failed') ||
    msg.includes('net::err') ||
    msg.includes('load failed') ||
    msg.includes('dynamically imported module') ||
    msg.includes('module script failed') ||
    msg.includes('unavailable') ||
    msg.includes('deadline exceeded') ||
    code.includes('auth/network-request-failed') ||
    code.includes('unavailable') ||
    name === 'chunkloaderror'
  );
}

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [hasNetworkError, setHasNetworkError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);

  const isReconnectingRef = useRef(false);

  const reportNetworkError = useCallback((msg?: string) => {
    setHasNetworkError(true);
    setErrorMessage(msg || 'خطا در برقراری ارتباط با هاست یا سرور');
  }, []);

  const clearNetworkError = useCallback(() => {
    setHasNetworkError(false);
    setErrorMessage(null);
  }, []);

  const retryConnection = useCallback(async (): Promise<boolean> => {
    if (isReconnectingRef.current) return isOnline;
    isReconnectingRef.current = true;
    setIsReconnecting(true);

    try {
      // 1. Verify online status
      const onlineNow = typeof navigator !== 'undefined' ? navigator.onLine : true;
      setIsOnline(onlineNow);

      if (!onlineNow) {
        setHasNetworkError(true);
        setErrorMessage('دستگاه شما در حال حاضر به اینترنت متصل نیست');
        return false;
      }

      // 2. Attempt Firebase & auth reconnect
      const firebaseResult = await reconnectFirebase(true);

      // 3. Ping local/host origin with cache-buster to verify host reachability
      try {
        await fetch(`/favicon.svg?_ping=${Date.now()}`, {
          method: 'HEAD',
          cache: 'no-store',
        });
      } catch {
        // If ping fails but online, could be CORS or offline
      }

      if (firebaseResult.success) {
        clearNetworkError();
        return true;
      } else {
        setHasNetworkError(true);
        setErrorMessage(firebaseResult.error || 'تلاش برای اتصال ناموفق بود. مجدداً امتحان کنید.');
        return false;
      }
    } catch (err: any) {
      setHasNetworkError(true);
      setErrorMessage(err?.message || 'خطا در تلاش مجدد برای اتصال');
      return false;
    } finally {
      isReconnectingRef.current = false;
      setIsReconnecting(false);
    }
  }, [clearNetworkError, isOnline]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-retry connection when browser comes back online
      retryConnection();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setHasNetworkError(true);
      setErrorMessage('ارتباط اینترنت قطع شده است');
    };

    // Catch-All for unhandled promise rejections (APIs, network, fetch, dynamic chunk import errors)
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Suppress known Firestore SDK assertion bugs so they do not crash or show network alerts
      if (isFirestoreInternalAssertion(event.reason)) {
        console.warn('[Maison Catch-All] Suppressed unhandled Firestore SDK assertion rejection:', event.reason);
        event.preventDefault();
        return;
      }

      if (isLikelyNetworkError(event.reason)) {
        console.warn('[Maison Catch-All] Caught unhandled network rejection:', event.reason);
        // Prevent white-screen crash
        event.preventDefault();
        setHasNetworkError(true);
        setErrorMessage('اختلال موقت در ارتباط با شبکه یا سرور. لطفاً اتصال را مجدداً بررسی کنید.');
      }
    };

    // Catch-All for global resource loading errors
    const handleGlobalError = (event: ErrorEvent) => {
      // Suppress known Firestore SDK assertion bugs
      if (isFirestoreInternalAssertion(event.error) || isFirestoreInternalAssertion(event.message)) {
        console.warn('[Maison Catch-All] Suppressed unhandled Firestore SDK assertion error:', event.message);
        event.preventDefault();
        return;
      }

      if (isLikelyNetworkError(event.error) || isLikelyNetworkError(event.message)) {
        console.warn('[Maison Catch-All] Caught global network error:', event.message);
        event.preventDefault();
        setHasNetworkError(true);
        setErrorMessage('خطای بارگذاری منابع به دلیل قطعی شبکه یا هاست.');
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleGlobalError);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleGlobalError);
    };
  }, [retryConnection]);

  return (
    <NetworkContext.Provider
      value={{
        isOnline,
        hasNetworkError,
        errorMessage,
        isReconnecting,
        retryConnection,
        reportNetworkError,
        clearNetworkError,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};
