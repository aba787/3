
// Firebase CDN Configuration
const firebaseConfig = {
  apiKey: "AIzaSyD58yPKXZrsDUoRhx3By1jYTFBmPnMuV7c",
  authDomain: "tgsire123.firebaseapp.com",
  projectId: "tgsire123",
  storageBucket: "tgsire123.firebasestorage.app",
  messagingSenderId: "686093721284",
  appId: "1:686093721284:web:cf310fb8042c8b59f43391",
  measurementId: "G-FJKMH9KLQB"
};

// Initialize Firebase (will be done after CDN loads)
let app, analytics, db, auth;

// Wait for Firebase CDN to load
window.addEventListener('DOMContentLoaded', () => {
  if (typeof firebase !== 'undefined') {
    app = firebase.initializeApp(firebaseConfig);
    
    // Initialize analytics only if available
    if (firebase.analytics && typeof firebase.analytics === 'function') {
      try {
        analytics = firebase.analytics(app);
        console.log('Firebase Analytics initialized');
      } catch (error) {
        console.log('Analytics not available:', error.message);
      }
    }
    
    db = firebase.firestore();
    auth = firebase.auth();
    
    console.log('Firebase initialized successfully');
    
    // Make available globally
    window.firebaseApp = app;
    window.firebaseAuth = auth;
    window.firebaseDb = db;
    if (analytics) {
      window.firebaseAnalytics = analytics;
    }
  } else {
    console.error('Firebase CDN failed to load');
  }
});
