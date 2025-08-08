import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { BarChart3, Package } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

const AdminCharts = ({ salesData, productsData }) => {
  const { settings } = useSettings();
  const COLORS = [settings.primaryColor, settings.secondaryColor, '#84cc16', '#65a30d', '#4d7c0f'];

  return (
    <>
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <BarChart3 className="w-5 h-5" style={{ color: settings.primaryColor }} />
            Penjualan 7 Hari Terakhir
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'revenue' ? `Rp ${value.toLocaleString()}` : value,
                  name === 'revenue' ? 'Pendapatan' : 'Transaksi'
                ]}
              />
              <Bar dataKey="revenue" fill={settings.primaryColor} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <Package className="w-5 h-5" style={{ color: settings.primaryColor }} />
            Produk Terlaris
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={productsData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="quantity"
              >
                {productsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, 'Terjual']} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  );
};

export default AdminCharts;