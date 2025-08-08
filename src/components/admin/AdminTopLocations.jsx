import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Trophy } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

const AdminTopLocations = ({ data }) => {
  const { settings } = useSettings();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-bold">
          <Trophy className="w-5 h-5" style={{ color: settings.primaryColor }} />
          Lokasi Paling Ramai
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data && data.length > 0 ? (
            data.map((location, index) => (
              <div key={location.name} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      {location.name}
                    </p>
                    <p className="text-sm text-muted-foreground">{location.sales} transaksi</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-amber-600 dark:text-amber-400">
                    Rp {location.revenue.toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">Belum ada data penjualan per lokasi.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminTopLocations;