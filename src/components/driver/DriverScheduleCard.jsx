import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, AlertCircle } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

const DriverScheduleCard = ({ driverSchedule }) => {
  const { settings } = useSettings();

  const formatDate = (dateString) => {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', options);
  };

  const isToday = (dateString) => {
    const today = new Date();
    const scheduleDate = new Date(dateString);
    today.setHours(0, 0, 0, 0);
    scheduleDate.setHours(0, 0, 0, 0);
    return today.getTime() === scheduleDate.getTime();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: settings.headingColor }}>
          <Calendar className="w-5 h-5" style={{ color: settings.primaryColor }} />
          Jadwal Tugas Anda (7 Hari)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {driverSchedule && driverSchedule.length > 0 ? (
          <div className="space-y-3">
            <div className="max-h-80 overflow-y-auto space-y-3 pr-2">
              {driverSchedule.map((assignment, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg flex justify-between items-center transition-colors ${
                    isToday(assignment.date)
                      ? 'brand-gradient text-white shadow-lg'
                      : 'bg-muted/50'
                  }`}
                >
                  <div className="font-semibold">{formatDate(assignment.date)}</div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">{assignment.locationName}</span>
                  </div>
                </div>
              ))}
            </div>
             <div className="mt-4 p-3 bg-yellow-100/80 dark:bg-yellow-900/40 border-l-4 border-yellow-400 text-yellow-800 dark:text-yellow-200 text-sm flex items-start gap-2 rounded-r-lg">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Catatan:</strong> Jadwal dapat berubah sewaktu-waktu. Selalu periksa kembali jadwal Anda secara berkala.
              </span>
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">
            Tidak ada jadwal yang tersedia untuk Anda dalam 7 hari ke depan.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default DriverScheduleCard;