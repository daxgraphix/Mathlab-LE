import { initializeApp, getApps, FirebaseApp, getApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef"
};

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let isInitialized = false;
let initError: string | null = null;

export const initializeFirebase = (): { app: FirebaseApp; auth: Auth; db: Firestore } => {
  if (isInitialized && app) {
    return { app, auth: auth!, db: db! };
  }

  try {
    if (!getApps().length) {
      console.log('Initializing Firebase with config:', firebaseConfig);
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
    
    auth = getAuth(app);
    db = getFirestore(app);
    isInitialized = true;
    
    console.log('✅ Firebase initialized successfully');
    console.log('Auth:', auth ? 'Ready' : 'Not ready');
    console.log('Firestore DB:', db ? 'Ready' : 'Not ready');
  } catch (error: any) {
    console.error('❌ Firebase initialization failed:', error.message);
    initError = error.message;
    isInitialized = true;
  }
  
  return { app: app!, auth: auth!, db: db! };
};

export const getFirebaseAuth = (): Auth | null => {
  if (!auth) {
    try {
      const { auth: firebaseAuth } = initializeFirebase();
      auth = firebaseAuth;
    } catch (e) {
      return null;
    }
  }
  return auth;
};

export const getFirebaseDb = (): Firestore | null => {
  if (!db) {
    try {
      const { db: firebaseDb } = initializeFirebase();
      db = firebaseDb;
    } catch (e) {
      return null;
    }
  }
  return db;
};

export const isFirebaseConfigured = (): boolean => {
  return firebaseConfig.apiKey !== "demo-api-key" && 
         firebaseConfig.authDomain !== "demo-project.firebaseapp.com";
};

export const getFirebaseInitError = (): string | null => {
  return initError;
};

export { app, auth, db };
export default firebaseConfig;