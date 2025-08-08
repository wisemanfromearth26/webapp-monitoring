import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { db } from '@/firebase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminStatsCards from '@/components/admin/AdminStatsCards';
import AdminCharts from '@/components/admin/AdminCharts';
import AdminDriverPerformance from '@/components/admin/AdminDriverPerformance';
import AdminTopLocations from '@/components/admin/AdminTopLocations';
import ProductManagement from '@/components/admin/ProductManagement';
import DriverManagement from '@/components/admin/DriverManagement';
import LocationManagement from '@/components/admin/LocationManagement';
import DriverSchedule from '@/components/admin/DriverSchedule';
import ReportGenerator from '@/components/admin/ReportGenerator';
import AdminPeakHours from '@/components/admin/AdminPeakHours';
import PayrollManagement from '@/components/admin/PayrollManagement';
import AdminBusiestDays from '@/components/admin/AdminBusiestDays';
import SettingsManagement from '@/components/admin/SettingsManagement';


const AdminDashboard = () => {
  const { currentUser, userRole, userDetails, logout } = useAuth();
  const { products, drivers, locations, sales, attendance, schedule } = useData();
  const [stats, setStats] = useState({});
  const [chartData, setChartData] = useState({});

  // Redirect jika bukan admin
  if (userRole !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    calculateStats();
  }, [sales, attendance, drivers, products, locations]);

  const calculateStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todaySales = sales.filter(sale => sale.date === today);
    const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);

    const todayAttendance = attendance.filter(att => att.date === today);
    const startedShifts = todayAttendance.filter(att => att.type === 'start');
    const endedShifts = todayAttendance.filter(att => att.type === 'end');
    const activeDrivers = startedShifts.filter(start => 
      !endedShifts.some(end => end.driverId === start.driverId && new Date(end.timestamp) > new Date(start.timestamp))
    ).length;

    const productSales = {};
    sales.forEach(sale => {
      sale.items.forEach(item => {
        if (!productSales[item.name]) {
          productSales[item.name] = { quantity: 0, revenue: 0 };
        }
        productSales[item.name].quantity += item.quantity;
        productSales[item.name].revenue += item.price * item.quantity;
      });
    });

    const driverPerformance = {};
    sales.forEach(sale => {
      if (!driverPerformance[sale.driverId]) {
        driverPerformance[sale.driverId] = { sales: 0, revenue: 0, fee: 0 };
      }
      driverPerformance[sale.driverId].sales += 1;
      driverPerformance[sale.driverId].revenue += sale.total;
      driverPerformance[sale.driverId].fee += sale.items.reduce((sum, item) => sum + (item.fee * item.quantity), 0);
    });
    
    const locationPerformance = {};
    sales.forEach(sale => {
      if (!locationPerformance[sale.location]) {
        locationPerformance[sale.location] = { sales: 0, revenue: 0 };
      }
      locationPerformance[sale.location].sales += 1;
      locationPerformance[sale.location].revenue += sale.total;
    });

    const peakHoursPerformance = () => {
        if (sales.length === 0) return [];
        const hourCounts = sales.reduce((acc, sale) => {
            const hour = new Date(sale.timestamp).getHours();
            if (!acc[hour]) {
                acc[hour] = { hour: `${hour.toString().padStart(2, '0')}:00`, sales: 0, revenue: 0 };
            }
            acc[hour].sales += 1;
            acc[hour].revenue += sale.total;
            return acc;
        }, {});
        return Object.values(hourCounts).sort((a,b) => b.sales - a.sales).slice(0,5);
    };

    const busiestDaysPerformance = () => {
        if (sales.length === 0) return [];
        const dayCounts = sales.reduce((acc, sale) => {
            const date = sale.date;
            if (!acc[date]) {
                acc[date] = { date, sales: 0, revenue: 0 };
            }
            acc[date].sales += 1;
            acc[date].revenue += sale.total;
            return acc;
        }, {});
        return Object.values(dayCounts).sort((a,b) => b.revenue - a.revenue).slice(0,5);
    };

    const currentStats = {
      todayRevenue,
      todaySales: todaySales.length,
      activeDrivers,
      totalDrivers: drivers.filter(d => d.isActive).length,
      totalProducts: products.length,
      totalLocations: locations.length,
      productSales,
      driverPerformance,
      locationPerformance,
      peakHoursPerformance: peakHoursPerformance(),
      busiestDaysPerformance: busiestDaysPerformance(),
    };
    setStats(currentStats);
    updateChartData(currentStats);
  };

  const updateChartData = (currentStats) => {
    setChartData({
      salesChartData: getSalesChartData(),
      topProductsData: getTopProductsData(currentStats),
      driverPerformanceData: getDriverPerformanceData(currentStats),
      topLocationsData: getTopLocationsData(currentStats),
    });
  };

  const getSalesChartData = () => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const daySales = sales.filter(sale => sale.date === dateStr);
      const revenue = daySales.reduce((sum, sale) => sum + sale.total, 0);
      last7Days.push({
        date: date.toLocaleDateString('id-ID', { weekday: 'short' }),
        revenue: revenue,
        transactions: daySales.length
      });
    }
    return last7Days;
  };

  const getTopProductsData = (currentStats) => {
    return Object.entries(currentStats.productSales || {})
      .sort((a, b) => b[1].quantity - a[1].quantity)
      .slice(0, 5)
      .map(([name, data]) => ({ name, quantity: data.quantity }));
  };
  
  const getDriverPerformanceData = (currentStats) => {
    const allDrivers = drivers; // Include inactive drivers for historical data
    return Object.entries(currentStats.driverPerformance || {})
      .map(([driverId, data]) => {
        const driver = allDrivers.find(d => d.id === driverId);
        return {
          name: driver ? driver.name : `Driver (ID: ${driverId})`,
          ...data
        };
      })
      .filter(d => d.revenue > 0)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  const getTopLocationsData = (currentStats) => {
    return Object.entries(currentStats.locationPerformance || {})
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 5)
      .map(([name, data]) => ({ name, ...data }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Admin Dashboard - Driver Sales Monitoring</title>
        <meta name="description" content="Dashboard admin untuk monitoring penjualan dan manajemen driver" />
      </Helmet>

      <AdminHeader user={userDetails} onLogout={logout} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <div className="overflow-x-auto pb-2">
            <TabsList className="grid w-full sm:grid-cols-8">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="schedule">Jadwal</TabsTrigger>
                <TabsTrigger value="products">Produk</TabsTrigger>
                <TabsTrigger value="drivers">Driver</TabsTrigger>
                <TabsTrigger value="locations">Lokasi</TabsTrigger>
                <TabsTrigger value="payroll">Gaji</TabsTrigger>
                <TabsTrigger value="reports">Laporan</TabsTrigger>
                <TabsTrigger value="settings">Pengaturan</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard" className="space-y-6">
            <AdminStatsCards stats={stats} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AdminCharts 
                salesData={chartData.salesChartData || []} 
                productsData={chartData.topProductsData || []} 
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
              <AdminDriverPerformance data={chartData.driverPerformanceData || []} />
              <AdminTopLocations data={chartData.topLocationsData || []} />
              <AdminPeakHours data={stats.peakHoursPerformance} />
              <AdminBusiestDays data={stats.busiestDaysPerformance} />
            </div>

          </TabsContent>

          <TabsContent value="schedule">
            <DriverSchedule />
          </TabsContent>

          <TabsContent value="products">
            <ProductManagement />
          </TabsContent>

          <TabsContent value="drivers">
            <DriverManagement />
          </TabsContent>

          <TabsContent value="locations">
            <LocationManagement />
          </TabsContent>

          <TabsContent value="payroll">
            <PayrollManagement 
              drivers={drivers}
              sales={sales}
            />
          </TabsContent>

          <TabsContent value="reports">
            <ReportGenerator 
              sales={sales}
              attendance={attendance}
              drivers={drivers}
              locations={locations}
              products={products}
              schedule={schedule}
              stats={stats}
              chartData={chartData}
            />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;