import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile as updateFirebaseProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types/auth';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isOwner: boolean;
  loading: boolean;
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userProfile = await fetchProfile(currentUser);
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchProfile]);

  const login = async (email: string, pass: string): Promise<UserProfile | null> => {
    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, pass);
      const userProfile = await fetchProfile(credential.user);
      setUser(credential.user);
      setProfile(userProfile);
      return userProfile;
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
