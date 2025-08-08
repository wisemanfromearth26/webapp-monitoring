import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, DollarSign } from 'lucide-react';

const TodaySummaryCard = ({ totalSalesToday, transactionsToday, todayFee, showRevenue }) => {
  return (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#9bbf43]" />
          Ringkasan Hari Ini
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600">Total Penjualan</span>
          <span className="font-semibold text-[#9bbf43]">
            Rp {totalSalesToday.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600">Transaksi</span>
          <span className="font-semibold">{transactionsToday}</span>
        </div>
        {showRevenue && (
          <div className="flex justify-between items-center border-t pt-4">
            <span className="text-sm text-slate-600 flex items-center gap-1">
              <DollarSign className="w-4 h-4"/>
              Estimasi Pendapatan
            </span>
            <span className="font-bold text-green-600 text-lg">
              Rp {todayFee.toLocaleString()}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TodaySummaryCard;