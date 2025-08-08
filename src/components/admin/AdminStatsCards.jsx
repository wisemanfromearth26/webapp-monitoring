import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, TrendingUp, Users, Package } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold" style={{ color }}>
            {value}
          </p>
        </div>
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}20`}}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      </div>
    </CardContent>
  </Card>
);

const AdminStatsCards = ({ stats }) => {
  const { settings } = useSettings();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Pendapatan Hari Ini"
        value={`Rp ${(stats.todayRevenue || 0).toLocaleString()}`}
        icon={DollarSign}
        color={settings.primaryColor}
      />
      <StatCard
        title="Transaksi Hari Ini"
        value={stats.todaySales || 0}
        icon={TrendingUp}
        color="#3b82f6"
      />
      <StatCard
        title="Driver Aktif"
        value={stats.activeDrivers || 0}
        icon={Users}
        color="#16a34a"
      />
      <StatCard
        title="Total Produk"
        value={stats.totalProducts || 0}
        icon={Package}
        color="#9333ea"
      />
    </div>
  );
};

export default AdminStatsCards;