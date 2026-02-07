import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDfi4uRsMaJ_q9gkpA8vMfnq0Rc3saYr4Q",
  authDomain: "studio-9601698734-99e90.firebaseapp.com",
  projectId: "studio-9601698734-99e90",
  storageBucket: "studio-9601698734-99e90.firebasestorage.app",
  messagingSenderId: "638757531639",
  appId: "1:638757531639:web:cee8f654892db9edab48f2",
};

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Auth
const auth = getAuth(app);

// Explicitly define the database ID provided by the user
// This prevents the SDK from defaulting to '(default)'
const databaseId = "ops-marketplace-db";

/**
 * Initialize Firestore with the specific named database.
 */
const db = getFirestore(app, databaseId);

console.log("Firestore Initialized for database:", databaseId);

export { auth, db };