// ============================================================
// PRIMILM — Firebase configuration
// ============================================================
// 1. Go to https://console.firebase.google.com
// 2. Create a new project called "Primilm" (or reuse an existing one)
// 3. In Project Settings > General > Your apps, add a "Web app"
// 4. Copy the config object Firebase gives you and paste the values below
// 5. Enable these in the Firebase Console before testing:
//    - Authentication > Sign-in method > Email/Password (ON)
//    - Authentication > Sign-in method > Email link (passwordless sign-in) (ON)
//    - Authentication > Sign-in method > Google (ON)
//    - Firestore Database > Create database (start in production mode)
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDvtRO_Ux3cMAub_ISw5Q_DUnOVlx2VXUE",
  authDomain: "primilmweb.firebaseapp.com",
  projectId: "primilmweb",
  storageBucket: "primilmweb.firebasestorage.app",
  messagingSenderId: "1014248241160",
  appId: "1:1014248241160:web:47548fe7d7f1b63547b9bd"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
