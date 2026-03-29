import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCiH2CAxQEHtESBk2rTgtqwQwz0OcxEHuw",
  authDomain: "qa-career-hub.firebaseapp.com",
  projectId: "qa-career-hub",
  storageBucket: "qa-career-hub.firebasestorage.app",
  messagingSenderId: "746487530143",
  appId: "1:746487530143:web:0a5353fa8665e12b1698aa",
  measurementId: "G-MKRBCQG979"
};

const app = initializeApp(firebaseConfig);

let analytics = null;
import("firebase/analytics").then(({ getAnalytics, isSupported }) => {
  isSupported().then(yes => {
    if (yes) analytics = getAnalytics(app);
  });
}).catch(err => console.error("Firebase Analytics failed to load:", err));

const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };