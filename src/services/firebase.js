// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyCNiMULW4wzODQ90gbIImFUJePAnJ0we54",
//   authDomain: "mediaflow-827d9.firebaseapp.com",
//   projectId: "mediaflow-827d9",
//   storageBucket: "mediaflow-827d9.firebasestorage.app",
//   messagingSenderId: "422737066342",
//   appId: "1:422737066342:web:3aba0de114b1c6dabd70a7",
//   measurementId: "G-K7PX16Y7KX"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

// src/services/firebase.js


import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCNiMULW4wzODQ90gbIImFUJePAnJ0we54",
  authDomain: "mediaflow-827d9.firebaseapp.com",
  projectId: "mediaflow-827d9",
  storageBucket: "mediaflow-827d9.firebasestorage.app",
  messagingSenderId: "422737066342",
  appId: "1:422737066342:web:3aba0de114b1c6dabd70a7",
  measurementId: "G-K7PX16Y7KX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export Auth, DB, and Storage for the app to use
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);