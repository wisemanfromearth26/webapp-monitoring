import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { toast } from '@/components/ui/use-toast';

import DriverHeader from '@/components/driver/DriverHeader';
import ShiftStatusCard from '@/components/driver/ShiftStatusCard';
import TodaySummaryCard from '@/components/driver/TodaySummaryCard';
import ProductSelectionGrid from '@/components/driver/ProductSelectionGrid';
import ShoppingCartCard from '@/components/driver/ShoppingCartCard';
import SalesHistoryCard from '@/components/driver/SalesHistoryCard';
import DriverScheduleCard from '@/components/driver/DriverScheduleCard';

const DriverDashboard = () => {
  const { user, logout } = useAuth();
  const { products, sales, attendance, addSale, addAttendance, schedule } = useData();
  const [currentShift, setCurrentShift] = useState(null);
  const [cart, setCart] = useState([]);
  const [todaySales, setTodaySales] = useState([]);
  const [todayLocation, setTodayLocation] = useState(user.location);
  const [driverSchedule, setDriverSchedule] = useState([]);
  const [showRevenue] = useState(false); // Set to false to hide revenue

  useEffect(() => {
    const today = new Date();
    // Pastikan menggunakan zona waktu lokal
    const todayISO = today.getFullYear() + '-' + 
      String(today.getMonth() + 1).padStart(2, '0') + '-' + 
      String(today.getDate()).padStart(2, '0');
    
    setTodaySales(sales.filter(sale => sale.date === todayISO && sale.driverId === user.id));
    
    const activeShift = attendance.find(att => 
      att.driverId === user.id && 
      att.date === todayISO && 
      att.type === 'start' && 
      !attendance.some(endAtt => 
        endAtt.driverId === user.id && 
        endAtt.date === todayISO && 
        endAtt.type === 'end' && 
        new Date(endAtt.timestamp) > new Date(att.timestamp)
      )
    );
    setCurrentShift(activeShift);

    if (user.type === 'Dedicated' && schedule) {
      const allAssignments = [];
      let locationForToday = 'Tidak ada jadwal';
      
      console.log('Checking schedule for:', todayISO);
      console.log('User ID:', user.id);
      console.log('User Type:', user.type);
      console.log('Schedule:', schedule);
      
      const sevenDaysFromNow = new Date(today);
      sevenDaysFromNow.setDate(today.getDate() + 7);

      schedule.forEach(day => {
        const dayDate = new Date(day.date);
        dayDate.setHours(0,0,0,0);

        if (dayDate >= today && dayDate < sevenDaysFromNow) {
            const assignment = day.assignments.find(a => a.driverId === user.id);
            if (assignment) {
              allAssignments.push({ date: day.date, ...assignment });
            }
        }
        if (day.date === todayISO) {
          console.log('Found schedule for today:', day);
          const todayAssignment = day.assignments.find(a => a.driverId === user.id);
          console.log('Today assignment:', todayAssignment);
          if (todayAssignment) {
            locationForToday = todayAssignment.locationName;
            console.log('Setting location to:', locationForToday);
          }
        }
      });
      
      setTodayLocation(locationForToday);
      setDriverSchedule(allAssignments);

    } else {
      setTodayLocation(user.location);
    }
  }, [sales, attendance, user, schedule]);

  const startShift = () => {
    if (todayLocation === 'Tidak ada jadwal') {
      toast({
        title: "Tidak Bisa Memulai Shift",
        description: "Anda tidak memiliki jadwal untuk hari ini.",
        variant: "destructive",
      });
      return;
    }
    const attendanceRecord = {
      driverId: user.id,
      driverName: user.name,
      location: todayLocation,
      type: 'start'
    };
    
    const newAttendance = addAttendance(attendanceRecord);
    setCurrentShift(newAttendance);
    
    toast({
      title: "Shift Dimulai!",
      description: `Selamat bekerja, ${user.name}!`,
    });
  };

  const endShift = () => {
    const attendanceRecord = {
      driverId: user.id,
      driverName: user.name,
      location: todayLocation,
      type: 'end'
    };
    
    addAttendance(attendanceRecord);
    setCurrentShift(null);
    
    toast({
      title: "Shift Selesai!",
      description: "Terima kasih atas kerja keras hari ini!",
    });
  };

  const updateQuantity = (productId, change) => {
    setCart(currentCart => {
      const existingItem = currentCart.find(item => item.id === productId);
      if (existingItem) {
        const newQuantity = existingItem.quantity + change;
        if (newQuantity > 0) {
          return currentCart.map(item =>
            item.id === productId ? { ...item, quantity: newQuantity } : item
          );
        } else {
          return currentCart.filter(item => item.id !== productId);
        }
      } else if (change > 0) {
        const product = products.find(p => p.id === productId);
        return [...currentCart, { ...product, quantity: 1 }];
      }
      return currentCart;
    });
  };

  const saveSales = () => {
    if (cart.length === 0) {
      toast({
        title: "Keranjang Kosong",
        description: "Tambahkan produk terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    if (!currentShift) {
      toast({
        title: "Shift Belum Dimulai",
        description: "Mulai shift terlebih dahulu sebelum input penjualan",
        variant: "destructive",
      });
      return;
    }

    const saleRecord = {
      driverId: user.id,
      driverName: user.name,
      location: todayLocation,
      items: cart,
      total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };

    addSale(saleRecord);
    setCart([]);
    
    toast({
      title: "Penjualan Tersimpan!",
      description: `Total: Rp ${saleRecord.total.toLocaleString()}`,
    });
  };

  const getTodayFee = () => {
    return todaySales.reduce((totalFee, sale) => {
      return totalFee + sale.items.reduce((itemFee, item) => {
        return itemFee + (item.fee * item.quantity);
      }, 0);
    }, 0);
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Dashboard Driver - {user.name}</title>
        <meta name="description" content="Dashboard driver untuk presensi dan input penjualan" />
      </Helmet>

      <DriverHeader user={user} onLogout={logout} location={todayLocation} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content: Product Selection and Cart */}
          <div className="lg:col-span-2 space-y-8">
            <ProductSelectionGrid 
              products={products} 
              cart={cart}
              updateQuantity={updateQuantity} 
            />
            <ShoppingCartCard 
              cart={cart} 
              updateQuantity={updateQuantity} 
              saveSales={saveSales} 
              getCartTotal={getCartTotal} 
            />
          </div>
          
          {/* Sidebar: Status and History */}
          <div className="space-y-8">
            <ShiftStatusCard 
              location={todayLocation} 
              currentShift={currentShift} 
              startShift={startShift} 
              endShift={endShift} 
            />
            <TodaySummaryCard 
              totalSalesToday={todaySales.reduce((sum, sale) => sum + sale.total, 0)} 
              transactionsToday={todaySales.length}
              todayFee={getTodayFee()}
              showRevenue={showRevenue}
            />
            <SalesHistoryCard todaySales={todaySales} />
            {user.type === 'Dedicated' && (
              <>
                <DriverScheduleCard driverSchedule={driverSchedule} />
                <p className="text-xs text-center text-muted-foreground px-4">
                  Jadwal dapat berubah sewaktu-waktu sesuai dengan kebijakan manajemen.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;