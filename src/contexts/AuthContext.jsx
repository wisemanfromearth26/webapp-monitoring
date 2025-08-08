import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null); // 'admin' atau 'driver'
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Cek apakah user adalah admin
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        if (adminDoc.exists()) {
          setCurrentUser(user);
          setUserRole('admin');
          setUserDetails(adminDoc.data());
        } else {
          // Jika bukan admin, logout
          await signOut(auth);
          setCurrentUser(null);
          setUserRole(null);
          setUserDetails(null);
        }
      } else {
        // Jika tidak ada user yang login via Firebase Auth
        // tetap pertahankan driver session jika ada
        if (userRole !== 'driver') {
          setCurrentUser(null);
          setUserRole(null);
          setUserDetails(null);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [userRole]);

  // Fungsi untuk login admin
  const adminLogin = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Verifikasi bahwa user adalah admin
      const adminDoc = await getDoc(doc(db, 'admins', userCredential.user.uid));
      if (!adminDoc.exists()) {
        await signOut(auth);
        throw new Error('Unauthorized access');
      }
      setUserRole('admin');
      setUserDetails(adminDoc.data());
      return userCredential;
    } catch (error) {
      console.error('Admin login error:', error);
      throw error;
    }
  };

  // Fungsi untuk login driver
  const driverLogin = async (phone, password) => {
    try {
      // Cari driver berdasarkan nomor telepon
      const driversRef = collection(db, 'drivers');
      const q = query(driversRef, where('phone', '==', phone));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('Driver not found');
      }

      const driverDoc = querySnapshot.docs[0];
      const driverData = driverDoc.data();

      // Verifikasi password
      if (driverData.password !== password) {
        throw new Error('Invalid password');
      }

      // Set user role dan details
      setUserRole('driver');
      setUserDetails({ id: driverDoc.id, ...driverData });
      setCurrentUser({ id: driverDoc.id, ...driverData });
      return driverData;
    } catch (error) {
      console.error('Driver login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (userRole === 'admin') {
        await signOut(auth);
      }
      setCurrentUser(null);
      setUserRole(null);
      setUserDetails(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value = {
    currentUser,
    userRole,
    userDetails,
    adminLogin,
    driverLogin,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};