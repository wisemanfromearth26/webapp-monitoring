import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

const AdminPeakHours = ({ data }) => {
  const { settings } = useSettings();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-bold">
          <Clock className="w-5 h-5" style={{ color: settings.primaryColor }} />
          Jam Paling Ramai
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data && data.length > 0 ? (
            data.map((hour, index) => (
              <div key={hour.hour} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium flex items-center gap-1">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      {hour.hour}
                    </p>
                    <p className="text-sm text-muted-foreground">{hour.sales} transaksi</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-orange-600 dark:text-orange-400">
                    Rp {hour.revenue.toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">Belum ada data penjualan per jam.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminPeakHours;