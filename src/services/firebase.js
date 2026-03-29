import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
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
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };