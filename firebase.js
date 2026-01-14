import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyALeW0IhEOULbKNB13PVbDyXrdVX3KH9kQ",
  authDomain: "habit-quest-f9a34.firebaseapp.com",
  projectId: "habit-quest-f9a34",
  storageBucket: "habit-quest-f9a34.firebasestorage.app",
  messagingSenderId: "701399130832",
  appId: "1:701399130832:web:8f3ea74982b6c9c9ca74d5",
  measurementId: "G-26Y40WGGP4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();