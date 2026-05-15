/*
  Firebase setup for DivyaSeva
  1. Create a Firebase project
  2. Add a Web App
  3. Replace the values below
  4. Enable Authentication > Email/Password
  5. Enable Firestore Database
*/

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const isConfigured = firebaseConfig.apiKey && !firebaseConfig.apiKey.includes("YOUR_");
let app = null;
let auth = null;
let db = null;

if (isConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

window.DivyaFirebase = {
  ready: isConfigured,
  auth,
  db,
  async signUp(email, password) {
    if (!isConfigured) throw new Error("Firebase config is not added yet.");
    return createUserWithEmailAndPassword(auth, email, password);
  },
  async login(email, password) {
    if (!isConfigured) throw new Error("Firebase config is not added yet.");
    return signInWithEmailAndPassword(auth, email, password);
  },
  async logout() {
    if (!isConfigured) return;
    return signOut(auth);
  },
  onAuthChange(callback) {
    if (!isConfigured) return callback(null);
    return onAuthStateChanged(auth, callback);
  },
  async addBooking(data) {
    if (!isConfigured) throw new Error("Firebase config is not added yet.");
    return addDoc(collection(db, "bookings"), {
      ...data,
      createdAt: serverTimestamp()
    });
  },
  async addContact(data) {
    if (!isConfigured) throw new Error("Firebase config is not added yet.");
    return addDoc(collection(db, "contacts"), {
      ...data,
      createdAt: serverTimestamp()
    });
  }
};

window.dispatchEvent(new Event("divyafirebase-ready"));
