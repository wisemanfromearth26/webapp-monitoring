import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA42qs6cf73Cu7VsERdK8HgmnP9Ttgfuq4",
  authDomain: "driver-sales-monitoring.firebaseapp.com",
  projectId: "driver-sales-monitoring",
  storageBucket: "driver-sales-monitoring.firebasestorage.app",
  messagingSenderId: "858732939883",
  appId: "1:858732939883:web:d2c6189e0a7559e0e07f2e",
  measurementId: "G-J0LNBS9GE2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Enable offline persistence
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('Browser does not support persistence');
    }
  });

export { db, auth };
