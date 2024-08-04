import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC5oU-UbHgYtMHCfUBREl4kGwkmkAymaFA",
    authDomain: "moim-b9698.firebaseapp.com",
    databaseURL: "https://moim-b9698-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "moim-b9698",
    storageBucket: "moim-b9698.appspot.com",
    messagingSenderId: "1008846628319",
    appId: "1:1008846628319:web:17f72ac31b72f814bf106a",
    measurementId: "G-C59KFV7JHZ"
  };
  

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { db };
