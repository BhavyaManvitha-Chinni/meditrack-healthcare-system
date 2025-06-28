import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBknBhYzFCiekySTn-4F1BdGuvQOR3XRmQ",
  authDomain: "lstproject-63649.firebaseapp.com",
  projectId: "lstproject-63649",
  storageBucket: "lstproject-63649.firebasestorage.app",
  messagingSenderId: "940019457163",
  appId: "1:940019457163:web:062f47e8bc5a9f2a68888e",
  measurementId: "G-TDEZ5XXNK4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app;