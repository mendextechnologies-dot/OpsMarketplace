import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Auth
const auth = getAuth(app);

/**
 * Initialize Firestore with the specific named database.
 * We use the environment variable to ensure we don't fall back to '(default)'.
 */
const databaseId = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID || "ops-marketplace-db";

// For debugging: log the database being used to the console
if (typeof window !== "undefined") {
  console.log("🔥 Initializing Firestore with Database ID:", databaseId);
}

const db = getFirestore(app, databaseId);

export { auth, db };
