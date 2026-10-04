import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
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
