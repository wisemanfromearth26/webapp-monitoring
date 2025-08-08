import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Eye, EyeOff, LogIn, Users, BarChart3, MapPin } from 'lucide-react';

const LoginPage = () => {
  const { user, login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/driver'} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = login(username, password);
      if (result.success) {
        toast({
          title: "Login Berhasil!",
          description: `Selamat datang, ${result.user.name}!`,
        });
      } else {
        toast({
          title: "Login Gagal",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat login",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = (role) => {
    if (role === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('budi_s');
      setPassword('driver123');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <Helmet>
        <title>Login - Driver Sales Monitoring</title>
        <meta name="description" content="Login ke sistem monitoring penjualan dan driver" />
      </Helmet>

      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 brand-gradient rounded-full opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-[#698023] to-[#9bbf43] rounded-full opacity-15 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-[#9bbf43] rounded-full opacity-10 animate-pulse-slow"></div>
      </div>

      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left Side - Branding */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center lg:text-left space-y-8"
        >
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-6xl font-bold gradient-text">
              Driver Sales
            </h1>
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-700">
              Monitoring
            </h2>
            <p className="text-lg text-slate-600 max-w-md mx-auto lg:mx-0">
              Sistem monitoring penjualan dan kehadiran driver dengan dashboard real-time dan statistik lengkap
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="glass-effect rounded-xl p-4 text-center"
            >
              <Users className="w-8 h-8 text-[#9bbf43] mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">Multi Driver</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="glass-effect rounded-xl p-4 text-center"
            >
              <BarChart3 className="w-8 h-8 text-[#9bbf43] mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">Real-time Stats</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="glass-effect rounded-xl p-4 text-center"
            >
              <MapPin className="w-8 h-8 text-[#9bbf43] mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">Location Track</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side - Login Form */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-md mx-auto"
        >
          <Card className="glass-effect p-8 shadow-2xl border-0">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-slate-800">Masuk ke Akun</h3>
                <p className="text-slate-600">Silakan masuk untuk melanjutkan</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username"
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan password"
                      required
                      className="h-12 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 brand-gradient text-white font-semibold hover:opacity-90 transition-opacity"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Memproses...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <LogIn className="w-5 h-5" />
                      Masuk
                    </div>
                  )}
                </Button>
              </form>

              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-slate-500">Demo Login</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => demoLogin('admin')}
                    className="h-10 text-sm"
                  >
                    Admin Demo
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => demoLogin('driver')}
                    className="h-10 text-sm"
                  >
                    Driver Demo
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;