import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: (process.env as any).FIREBASE_API_KEY,
  authDomain: (process.env as any).FIREBASE_AUTH_DOMAIN,
  projectId: (process.env as any).FIREBASE_PROJECT_ID,
  storageBucket: (process.env as any).FIREBASE_STORAGE_BUCKET,
  messagingSenderId: (process.env as any).FIREBASE_MESSAGING_SENDER_ID,
  appId: (process.env as any).FIREBASE_APP_ID,
};

// Singleton pattern for Firebase initialization to avoid duplicate registration errors
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// In the modular SDK, getAuth(app) ensures the auth module is linked to this specific app instance
export const auth = getAuth(app);

export default app;