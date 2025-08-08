import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Calendar, Users, MapPin, RotateCcw, Shuffle, AlertTriangle, CalendarX2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const DriverSchedule = () => {
  const { drivers, locations, schedule, generateSchedule, resetSchedule } = useData();
  const [interval, setInterval] = useState(1);
  const [customInterval, setCustomInterval] = useState(5);
  const [isCustom, setIsCustom] = useState(false);
  const [excludedDays, setExcludedDays] = useState([]);

  const dedicatedDrivers = drivers.filter(driver => driver.type === 'Dedicated' && driver.isActive);
  const daysOfWeek = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  const toggleExcludedDay = (dayIndex) => {
    setExcludedDays(prev =>
      prev.includes(dayIndex)
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex]
    );
  };

  const handleGenerate = () => {
    const rotationInterval = isCustom ? parseInt(customInterval, 10) : parseInt(interval, 10);
    if (isNaN(rotationInterval) || rotationInterval < 1) {
      toast({
        title: "Interval tidak valid",
        description: "Harap masukkan angka yang valid untuk interval rotasi.",
        variant: "destructive",
      });
      return;
    }
    generateSchedule(rotationInterval, excludedDays);
    toast({
      title: "Jadwal Dibuat!",
      description: `Jadwal baru untuk 30 hari ke depan telah berhasil dibuat.`,
    });
  };

  const handleReset = () => {
    resetSchedule();
    toast({
      title: "Jadwal Direset!",
      description: "Jadwal telah berhasil dihapus.",
    });
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const renderSchedule = () => {
    if (!schedule) {
      return (
        <Card className="mt-6">
          <CardContent className="text-center py-12">
            <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">Belum Ada Jadwal</h3>
            <p className="text-slate-500">Buat jadwal penempatan driver untuk 30 hari ke depan.</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4 mt-6">
        {schedule.map((day, index) => (
          <motion.div
            key={day.date}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{formatDate(day.date)}</CardTitle>
              </CardHeader>
              <CardContent>
                {day.assignments.length > 0 ? (
                  <ul className="space-y-2">
                    {day.assignments.map((assignment, idx) => (
                      <li key={idx} className="flex items-center justify-between p-2 rounded-md bg-slate-50">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-[#698023]" />
                          <span className="font-medium">{assignment.driverName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          <span>{assignment.locationName}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500 flex items-center gap-2">
                    <CalendarX2 className="w-4 h-4" />
                    Tidak ada driver yang dijadwalkan (hari libur/dikecualikan).
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    );
  };

  const canGenerate = dedicatedDrivers.length > 0 && locations.length > 0;

  return (
    <div className="space-y-6">
      <Card className="card-hover">
        <CardHeader>
          <CardTitle>Pengaturan Jadwal Driver</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!canGenerate && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
              <div>
                <p className="font-semibold text-yellow-800">Data Tidak Lengkap</p>
                <p className="text-sm text-yellow-700">Harap tambahkan data driver (tipe Dedicated) dan lokasi terlebih dahulu sebelum membuat jadwal.</p>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Interval Rotasi Acak (per hari kerja)</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map(val => (
                    <Button key={val} variant={!isCustom && interval === val ? 'default' : 'outline'} onClick={() => { setInterval(val); setIsCustom(false); }} className={!isCustom && interval === val ? 'brand-gradient text-white' : ''}>
                      {val} Hari
                    </Button>
                  ))}
                  <Button variant={isCustom ? 'default' : 'outline'} onClick={() => setIsCustom(true)} className={isCustom ? 'brand-gradient text-white' : ''}>
                    Custom
                  </Button>
                </div>
                {isCustom && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-2">
                    <Input
                      type="number"
                      value={customInterval}
                      onChange={(e) => setCustomInterval(e.target.value)}
                      placeholder="Contoh: 7"
                      min="1"
                    />
                  </motion.div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Pengecualian Hari (Opsional)</Label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map((day, index) => (
                    <Button
                      key={index}
                      variant={excludedDays.includes(index) ? 'destructive' : 'outline'}
                      onClick={() => toggleExcludedDay(index)}
                      size="sm"
                    >
                      {day}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-end h-full gap-2">
              <Button onClick={handleGenerate} disabled={!canGenerate} className="w-full brand-gradient text-white">
                <Shuffle className="w-4 h-4 mr-2" />
                Buat Jadwal
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={!schedule} className="w-full">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset Jadwal
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Anda yakin ingin mereset jadwal?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tindakan ini akan menghapus semua jadwal yang sudah dibuat. Aksi ini tidak dapat dibatalkan.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleReset} className="bg-red-600 hover:bg-red-700 text-white">
                      Ya, Reset Jadwal
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
      {renderSchedule()}
    </div>
  );
};

export default DriverSchedule;