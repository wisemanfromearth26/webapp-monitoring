import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

const AdminDriverPerformance = ({ data }) => {
  const { settings } = useSettings();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-bold">
          <Users className="w-5 h-5" style={{ color: settings.primaryColor }} />
          Performa Driver Teratas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data && data.length > 0 ? (
            data.map((driver, index) => (
              <div key={driver.name} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm" style={{ backgroundColor: settings.primaryColor }}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{driver.name}</p>
                    <p className="text-sm text-muted-foreground">{driver.sales} transaksi</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold" style={{ color: settings.primaryColor }}>
                    Rp {driver.revenue.toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">Belum ada data performa driver.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminDriverPerformance;