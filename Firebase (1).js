// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD58yPKXZrsDUoRhx3By1jYTFBmPnMuV7c",
  authDomain: "tgsire123.firebaseapp.com",
  projectId: "tgsire123",
  storageBucket: "tgsire123.firebasestorage.app",
  messagingSenderId: "686093721284",
  appId: "1:686093721284:web:cf310fb8042c8b59f43391",
  measurementId: "G-FJKMH9KLQB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, analytics, db, auth };
