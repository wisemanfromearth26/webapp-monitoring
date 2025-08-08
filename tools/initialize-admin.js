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
    console.log('Checking Firebase configuration...');
    
    // Create admin user in Firebase Auth
    console.log('Creating admin user...');
    const userCredential = await createUserWithEmailAndPassword(auth, 'admin@example.com', 'admin123');
    const { user } = userCredential;
    console.log('Admin user created in Authentication');

    // Create admin document in Firestore
    console.log('Creating admin document in Firestore...');
    await setDoc(doc(db, 'admins', user.uid), {
      email: 'admin@example.com',
      name: 'Admin',
      role: 'admin',
      createdAt: new Date().toISOString()
    });

    console.log('Success! Admin user created with:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    process.exit(0);
  } catch (error) {
    if (error.code === 'auth/configuration-not-found') {
      console.error('\nError: Firebase Authentication is not configured.');
      console.error('\nPlease follow these steps:');
      console.error('1. Go to Firebase Console');
      console.error('2. Select your project');
      console.error('3. Click "Authentication" in the left sidebar');
      console.error('4. Click "Get Started"');
      console.error('5. In the "Sign-in method" tab:');
      console.error('   - Click "Email/Password"');
      console.error('   - Enable it');
      console.error('   - Click "Save"');
      console.error('\nThen try running this command again.');
    } else if (error.code === 'auth/email-already-in-use') {
      console.log('\nAdmin user already exists!');
      console.log('You can use these credentials to login:');
      console.log('Email: admin@example.com');
      console.log('Password: admin123');
      process.exit(0);
    } else {
      console.error('Error creating admin:', error);
    }
    process.exit(1);
  }
};

createAdminUser();
