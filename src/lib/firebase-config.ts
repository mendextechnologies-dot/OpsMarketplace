import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDfi4uRsMaJ_q9gkpA8vMfnq0Rc3saYr4Q",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "studio-9601698734-99e90.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-9601698734-99e90",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "studio-9601698734-99e90.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "638757531639",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:638757531639:web:cee8f654892db9edab48f2",
};

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Auth
const auth = getAuth(app);

// Explicitly define the database ID provided by the user
const databaseId = "ops-marketplace-db";

/**
 * Initialize Firestore with the specific named database.
 * We hardcode the ID here to ensure the SDK never defaults to '(default)'.
 */
const db = getFirestore(app, databaseId);

console.log("Firestore Initialized for database:", databaseId);

export { auth, db };
