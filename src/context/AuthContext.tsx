import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  User,
  onAuthStateChanged,
  onIdTokenChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile as updateFirebaseProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, reconnectFirebase, subscribeFirebaseConnection, isFirebaseOnline } from '../lib/firebase';
import { UserProfile } from '../types/auth';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isOwner: boolean;
  loading: boolean;
  isOnline: boolean;
  isReconnecting: boolean;
  connectionError: string | null;
  reconnect: () => Promise<boolean>;
  login: (email: string, pass: string) => Promise<UserProfile | null>;
  register: (name: string, email: string, pass: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(isFirebaseOnline());
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const isReconnectingRef = useRef(false);

  // Subscribe to connection state
  useEffect(() => {
    const unsub = subscribeFirebaseConnection((online) => {
      setIsOnline(online);
      if (!online) {
        setConnectionError('اتصال به سرور قطع شده است');
      } else {
        setConnectionError(null);
      }
    });
    return unsub;
  }, []);

  // Fetch or construct profile from Firestore
  const fetchProfile = useCallback(async (firebaseUser: User | null): Promise<UserProfile | null> => {
    if (!firebaseUser) return null;
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        return userDocSnap.data() as UserProfile;
      } else {
        // Document doesn't exist yet, create initial customer profile
        const initialProfile: UserProfile = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Patron',
          email: firebaseUser.email || '',
          role: 'customer',
          createdAt: new Date().toISOString(),
        };
        try {
          await setDoc(userDocRef, initialProfile);
        } catch (e) {
          console.warn('Could not write initial user doc to Firestore:', e);
        }
        return initialProfile;
      }
    } catch (err) {
      console.warn('Failed to fetch user profile from Firestore:', err);
      // Fallback in-memory profile so user stays logged in
      return {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Patron',
        email: firebaseUser.email || '',
        role: 'customer',
        createdAt: new Date().toISOString(),
      };
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      const updated = await fetchProfile(user);
      setProfile(updated);
    }
  }, [user, fetchProfile]);

  // Manual & automatic reconnect handler
  const reconnect = useCallback(async (): Promise<boolean> => {
    if (isReconnectingRef.current) return true;
    isReconnectingRef.current = true;
    setIsReconnecting(true);
    setConnectionError(null);

    try {
      const res = await reconnectFirebase(true);
      if (res.success) {
        if (auth.currentUser) {
          setUser(auth.currentUser);
          const p = await fetchProfile(auth.currentUser);
          setProfile(p);
        }
        setIsOnline(true);
        setConnectionError(null);
        return true;
      } else {
        setConnectionError(res.error || 'خطا در برقراری مجدد اتصال');
        return false;
      }
    } catch (err: any) {
      setConnectionError(err?.message || 'خطا در اتصال مجدد');
      return false;
    } finally {
      isReconnectingRef.current = false;
      setIsReconnecting(false);
    }
  }, [fetchProfile]);

  // Auth State & Token Refresh Listeners
  useEffect(() => {
    let isMounted = true;

    // Listen to auth state transitions
    const unsubAuthState = onAuthStateChanged(auth, async (currentUser) => {
      if (!isMounted) return;
      setUser(currentUser);
      if (currentUser) {
        try {
          const userProfile = await fetchProfile(currentUser);
          if (isMounted) setProfile(userProfile);
        } catch {
          // Handled gracefully in fetchProfile
        }
      } else {
        if (isMounted) setProfile(null);
      }
      if (isMounted) setLoading(false);
    });

    // Listen to token refresh events (fires on token refresh, revocation, or auto-renewal)
    const unsubIdToken = onIdTokenChanged(auth, async (currentUser) => {
      if (!isMounted) return;
      if (currentUser) {
        setUser(currentUser);
      }
    });

    // Proactive Keep-Alive: Refresh token every 25 minutes while tab remains open
    // Firebase tokens expire after 60 minutes; this prevents token expiry completely
    const keepAliveTimer = setInterval(async () => {
      if (auth.currentUser && typeof document !== 'undefined' && !document.hidden && navigator.onLine) {
        try {
          await auth.currentUser.getIdToken(true);
          console.debug('[Auth] Proactive token keep-alive succeeded');
        } catch (e) {
          console.warn('[Auth] Proactive token keep-alive deferred:', e);
        }
      }
    }, 25 * 60 * 1000);

    // Listen for reconnection custom event
    const handleReconnectedEvent = async () => {
      if (auth.currentUser && isMounted) {
        try {
          const updated = await fetchProfile(auth.currentUser);
          if (isMounted) setProfile(updated);
        } catch {
          // Ignore
        }
      }
    };
    window.addEventListener('maison:firebase:reconnected', handleReconnectedEvent);

    return () => {
      isMounted = false;
      unsubAuthState();
      unsubIdToken();
      clearInterval(keepAliveTimer);
      window.removeEventListener('maison:firebase:reconnected', handleReconnectedEvent);
    };
  }, [fetchProfile]);

  const login = async (email: string, pass: string): Promise<UserProfile | null> => {
    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, pass);
      const userProfile = await fetchProfile(credential.user);
      setUser(credential.user);
      setProfile(userProfile);
      setConnectionError(null);
      return userProfile;
    } catch (err: any) {
      if (err?.code === 'auth/network-request-failed') {
        setConnectionError('خطای شبکه هنگام ورود. لطفاً اتصال اینترنت خود را بررسی کنید.');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, pass: string, phone?: string) => {
    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, pass);
      await updateFirebaseProfile(credential.user, { displayName: name });

      const newProfile: UserProfile = {
        uid: credential.user.uid,
        name,
        email,
        phone: phone || '',
        role: 'customer',
        createdAt: new Date().toISOString(),
      };

      try {
        await setDoc(doc(db, 'users', credential.user.uid), newProfile);
      } catch (err) {
        console.warn('Could not save user profile doc in Firestore:', err);
      }

      setUser(credential.user);
      setProfile(newProfile);
      setConnectionError(null);
    } catch (err: any) {
      if (err?.code === 'auth/network-request-failed') {
        setConnectionError('خطای شبکه هنگام ثبت‌نام. لطفاً اتصال اینترنت خود را بررسی کنید.');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, data);
    setProfile((prev) => (prev ? { ...prev, ...data } : null));
  };

  const isAdmin = profile?.role === 'admin';
  const isOwner = Boolean(profile?.isOwner);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        isOwner,
        loading,
        isOnline,
        isReconnecting,
        connectionError,
        reconnect,
        login,
        register,
        logout,
        updateProfileData,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

