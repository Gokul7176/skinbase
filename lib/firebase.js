// lib/firebase.js

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ✅ Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCzm7pTj67q_UAHFdY3siKS8QPmxvOL5AY",
  authDomain: "shoe-store-44d23.firebaseapp.com",
  projectId: "shoe-store-44d23",
  storageBucket: "shoe-store-44d23.appspot.com", // ✅ corrected suffix
  messagingSenderId: "663305950374",
  appId: "1:663305950374:web:5904cd91abc1f99b625067",
  measurementId: "G-CQ174Y02B0"
};

// ✅ Avoid re-initialization during hot reload
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// ✅ Initialize services
const db = getFirestore(app);
const auth = getAuth(app);

// ✅ Optional: enable analytics only if supported (browser)
let analytics;
if (typeof window !== "undefined") {
  isSupported().then((yes) => {
    if (yes) analytics = getAnalytics(app);
  });
}

// ✅ Export initialized services
export { db, auth, analytics };
