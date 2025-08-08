import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { AuthProvider } from '@/contexts/AuthContext';
import { DataProvider } from '@/contexts/DataContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import LoginPage from '@/pages/LoginPage';
import DriverDashboard from '@/pages/DriverDashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
      <AuthProvider>
        <DataProvider>
          <SettingsProvider>
            <Router>
              <div className="min-h-screen">
                <Helmet>
                  <title>Driver Sales Monitoring - Sistem Monitoring Penjualan & Driver</title>
                  <meta name="description" content="Aplikasi monitoring penjualan dan kehadiran driver dengan dashboard real-time dan statistik lengkap" />
                </Helmet>
                
                <Routes>
                  <Route path="/" element={<LoginPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route 
                    path="/driver" 
                    element={
                      <ProtectedRoute requiredRole="driver">
                        <DriverDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin" 
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminDashboard />
                      </ProtectedRoute>
                    } 
                  />
                </Routes>
                <Toaster />
              </div>
            </Router>
          </SettingsProvider>
        </DataProvider>
      </AuthProvider>
  );
}

export default App;