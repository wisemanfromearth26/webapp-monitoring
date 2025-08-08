import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (username, password) => {
    // Admin user remains hardcoded for initial access
    const adminUser = { id: 1, username: 'admin', password: 'admin123', role: 'admin', name: 'Admin Utama' };
    
    // Check for admin login
    if (username === adminUser.username && password === adminUser.password) {
      const userWithoutPassword = { ...adminUser };
      delete userWithoutPassword.password;
      setUser(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      return { success: true, user: userWithoutPassword };
    }

    // Check for driver login from localStorage
    const drivers = JSON.parse(localStorage.getItem('drivers')) || [];
    const foundDriver = drivers.find(d => d.username === username && d.password === password);
    
    if (foundDriver) {
      const driverUser = {
        id: foundDriver.id,
        username: foundDriver.username,
        role: 'driver',
        name: foundDriver.name,
        location: foundDriver.location,
        type: foundDriver.type
      };
      setUser(driverUser);
      localStorage.setItem('currentUser', JSON.stringify(driverUser));
      return { success: true, user: driverUser };
    }
    
    return { success: false, error: 'Username atau password salah' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };
  
  const verifyPassword = (password) => {
    const adminUser = { id: 1, username: 'admin', password: 'admin123', role: 'admin', name: 'Admin Utama' };
    if (user && user.role === 'admin' && password === adminUser.password) {
      return true;
    }
    return false;
  };

  const value = {
    user,
    login,
    logout,
    loading,
    verifyPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};