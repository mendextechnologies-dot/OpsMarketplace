
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDfi4uRsMaJ_q9gkpA8vMfnq0Rc3saYr4Q",
  authDomain: "studio-9601698734-99e90.firebaseapp.com",
  projectId: "studio-9601698734-99e90",
  storageBucket: "studio-9601698734-99e90.firebasestorage.app",
  messagingSenderId: "638757531639",
  appId: "1:638757531639:web:cee8f654892db9edab48f2"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
