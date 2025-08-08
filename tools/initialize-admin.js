import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA42qs6cf73Cu7VsERdK8HgmnP9Ttgfuq4",
  authDomain: "driver-sales-monitoring.firebaseapp.com",
  projectId: "driver-sales-monitoring",
  storageBucket: "driver-sales-monitoring.firebasestorage.app",
  messagingSenderId: "858732939883",
  appId: "1:858732939883:web:d2c6189e0a7559e0e07f2e",
  measurementId: "G-J0LNBS9GE2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const createAdminUser = async () => {
  try {
    // Create admin user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, 'admin@example.com', 'admin123');
    const { user } = userCredential;

    // Create admin document in Firestore
    await setDoc(doc(db, 'admins', user.uid), {
      email: 'admin@example.com',
      name: 'Admin',
      role: 'admin',
      createdAt: new Date().toISOString()
    });

    console.log('Admin user created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdminUser();
