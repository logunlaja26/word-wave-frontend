import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { FIREBASE_API_KEY } from "../apikey.js";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: "word-wave-app.firebaseapp.com",
  projectId: "word-wave-app",
  storageBucket: "word-wave-app.appspot.com",
  messagingSenderId: "362869482472",
  appId: "1:362869482472:web:63d07fa6a2b9c3c243ba5d",
  measurementId: "G-8EZT8KQD0T",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

//Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

//Authentication
const auth = getAuth(app);

export { app, auth, db };
