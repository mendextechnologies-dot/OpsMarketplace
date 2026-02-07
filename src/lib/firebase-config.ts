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

// Explicitly define the database ID
const databaseId = "ops-marketplace-db";

/**
 * Initialize Firestore with the specific named database.
 */
const db = getFirestore(app, databaseId);

// For debugging in the browser console
if (typeof window !== "undefined") {
  console.log("🔥 Firebase initialized with Database ID:", databaseId);
  console.log("🔥 Project ID:", firebaseConfig.projectId);
}

export { auth, db };