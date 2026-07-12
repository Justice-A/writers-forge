import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";

const fallbackFirebaseConfig = {
  apiKey: "AIzaSyDjsm8OqQ0z23oVP3J8rL2TX_jdrP19X20",
  authDomain: "writers-forge-14384.firebaseapp.com",
  projectId: "writers-forge-14384",
  storageBucket: "writers-forge-14384.firebasestorage.app",
  messagingSenderId: "951490206501",
  appId: "1:951490206501:web:287680497f647cbac218cc",
  measurementId: "G-QPJR605CGK",
};

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || fallbackFirebaseConfig.apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || fallbackFirebaseConfig.authDomain,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || fallbackFirebaseConfig.projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || fallbackFirebaseConfig.storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || fallbackFirebaseConfig.messagingSenderId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || fallbackFirebaseConfig.appId,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || fallbackFirebaseConfig.measurementId,
};

const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
);

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let analytics: Analytics | null = null;
let isFirebaseConfigured = false;

if (hasFirebaseConfig) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    isFirebaseConfigured = true;
  } catch (error) {
    console.warn("Firebase initialization skipped:", error);
  }
}

if (typeof window !== "undefined" && app && isFirebaseConfigured) {
  isSupported().then((yes) => {
    if (yes) analytics = getAnalytics(app!);
  });
}

export { app, db, auth, analytics, isFirebaseConfigured };
