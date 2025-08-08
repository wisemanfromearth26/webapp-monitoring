import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarCheck } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

const AdminBusiestDays = ({ data }) => {
  const { settings } = useSettings();
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-bold">
          <CalendarCheck className="w-5 h-5" style={{ color: settings.primaryColor }} />
          Hari Paling Ramai
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data && data.length > 0 ? (
            data.map((day, index) => (
              <div key={day.date} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium flex items-center gap-1">
                      {formatDate(day.date)}
                    </p>
                    <p className="text-sm text-muted-foreground">{day.sales} transaksi</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-purple-600 dark:text-purple-400">
                    Rp {day.revenue.toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">Belum ada data penjualan.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminBusiestDays;