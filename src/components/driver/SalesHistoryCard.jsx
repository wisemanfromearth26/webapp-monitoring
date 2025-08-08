import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History } from 'lucide-react';

const SalesHistoryCard = ({ todaySales }) => {
  return (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5 text-[#9bbf43]" />
          Riwayat Hari Ini
        </CardTitle>
      </CardHeader>
      <CardContent>
        {todaySales.length === 0 ? (
          <p className="text-center text-slate-500 py-4">Belum ada penjualan hari ini</p>
        ) : (
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {todaySales.map((sale) => (
              <div key={sale.id} className="bg-slate-50 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-slate-500">
                    {new Date(sale.timestamp).toLocaleTimeString('id-ID')}
                  </span>
                  <span className="font-semibold text-[#9bbf43]">
                    Rp {sale.total.toLocaleString()}
                  </span>
                </div>
                <div className="space-y-1">
                  {sale.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span>{item.name}</span>
                      <span>{item.quantity}x</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SalesHistoryCard;