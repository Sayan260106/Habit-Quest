import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "habit-quest-as0526.firebaseapp.com",
  projectId: "habit-quest-as0526",
  storageBucket: "habit-quest-as0526.firebasestorage.app",
  messagingSenderId: "130776729034",
  appId: "1:130776729034:web:2e2b2d9be3abc3d1523b33",
  measurementId: "G-2MJFGBFNGV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();