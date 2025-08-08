import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Play, Square } from 'lucide-react';

const ShiftStatusCard = ({ location, currentShift, startShift, endShift }) => {
  return (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#9bbf43]" />
          Status Shift
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-slate-500" />
          <span className="text-sm text-slate-600">{location}</span>
        </div>
        
        {currentShift ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">Shift Aktif</span>
            </div>
            <p className="text-xs text-slate-500">
              Dimulai: {new Date(currentShift.timestamp).toLocaleTimeString('id-ID')}
            </p>
            <Button
              onClick={endShift}
              className="w-full bg-red-500 hover:bg-red-600 text-white"
            >
              <Square className="w-4 h-4 mr-2" />
              Selesai Shift
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
              <span className="text-sm font-medium text-slate-600">Shift Belum Dimulai</span>
            </div>
            <Button
              onClick={startShift}
              className="w-full brand-gradient text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              Mulai Shift
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShiftStatusCard;