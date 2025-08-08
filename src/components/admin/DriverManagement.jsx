import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Plus, Edit, Trash2, Users, MapPin, Phone, User } from 'lucide-react';
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
import { useSettings } from '@/contexts/SettingsContext';


const DriverManagement = () => {
  const { drivers, locations, addDriver, updateDriver, deleteDriver } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    phone: '',
    type: 'Dedicated',
    location: ''
  });
  const { settings } = useSettings();

  const activeDrivers = drivers.filter(d => d.isActive);

  useEffect(() => {
    if (formData.type === 'Dedicated') {
      setFormData(prev => ({ ...prev, location: '' }));
    }
  }, [formData.type]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.username || (formData.type === 'Mitra' && !formData.location)) {
      toast({
        title: "Error",
        description: "Harap isi semua kolom yang diperlukan.",
        variant: "destructive",
      });
      return;
    }
    
    if (!editingDriver && !formData.password) {
        toast({
            title: "Error",
            description: "Password wajib diisi untuk driver baru.",
            variant: "destructive",
        });
        return;
    }

    const driverData = {
      name: formData.name,
      username: formData.username,
      phone: formData.phone,
      type: formData.type,
      location: formData.type === 'Dedicated' ? '' : formData.location,
    };
    
    if (!editingDriver || (editingDriver && formData.password)) {
        driverData.password = formData.password;
    }
    
    if (editingDriver) {
      updateDriver(editingDriver.id, driverData);
      toast({
        title: "Driver Diperbarui!",
        description: `${driverData.name} berhasil diperbarui`,
      });
    } else {
      addDriver(driverData);
      toast({
        title: "Driver Ditambahkan!",
        description: `${driverData.name} berhasil ditambahkan`,
      });
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (driver) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      username: driver.username,
      password: '',
      phone: driver.phone || '',
      type: driver.type || 'Dedicated',
      location: driver.location || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (driver) => {
    deleteDriver(driver.id);
    toast({
      title: "Driver Dihapus!",
      description: `${driver.name} telah dinonaktifkan. Data historisnya tetap tersimpan.`,
    });
  };

  const resetForm = () => {
    setFormData({ name: '', username: '', password: '', phone: '', type: 'Dedicated', location: '' });
    setEditingDriver(null);
  };

  const handleDialogOpenChange = (open) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };
  
  const handleTypeChange = (e) => {
    const type = e.target.value;
    setFormData({ ...formData, type, location: type === 'Dedicated' ? '' : formData.location });
  };


  return (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Manajemen Driver</h2>
          <DialogTrigger asChild>
              <Button className="brand-gradient text-white">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Driver
              </Button>
            </DialogTrigger>
        </div>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDriver ? 'Edit Driver' : 'Tambah Driver Baru'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Tipe Driver</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={handleTypeChange}
                  className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
                  required
                >
                  <option value="Dedicated">Dedicated</option>
                  <option value="Mitra">Mitra</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="e.g. budi_s"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={editingDriver ? 'Isi untuk mengubah' : 'Masukkan password'}
                  required={!editingDriver}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label htmlFor="phone">Nomor Telepon</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="081234567890"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className={formData.type === 'Dedicated' ? 'text-muted-foreground' : ''}>
                  Lokasi Tugas
                </Label>
                <select
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
                  required={formData.type === 'Mitra'}
                  disabled={formData.type === 'Dedicated'}
                >
                  <option value="">{formData.type === 'Dedicated' ? 'Sesuai Jadwal' : 'Pilih lokasi'}</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.name}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1 brand-gradient text-white">
                {editingDriver ? 'Perbarui' : 'Tambah'} Driver
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Batal
                </Button>
              </DialogClose>
            </div>
          </form>
        </DialogContent>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeDrivers.map((driver) => (
            <Card key={driver.id}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 brand-gradient rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {driver.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{driver.name}</h3>
                      <p className={`text-sm font-semibold ${driver.type === 'Dedicated' ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'}`}>
                        {driver.type || 'Dedicated'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span>{driver.username}</span>
                    </div>
                    {driver.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <span>{driver.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{driver.type === 'Mitra' ? driver.location : 'Sesuai Jadwal'}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(driver)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="destructive-outline"
                          className="flex-1"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Hapus
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Yakin ingin menghapus {driver.name}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tindakan ini akan menonaktifkan driver. Data penjualan dan presensi yang terkait akan tetap tersimpan. Aksi ini tidak dapat dibatalkan.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(driver)} className="bg-red-600 hover:bg-red-700 text-white">
                            Ya, Nonaktifkan Driver
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {activeDrivers.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Belum Ada Driver Aktif</h3>
              <p className="text-muted-foreground mb-4">Tambahkan driver pertama untuk memulai</p>
              <DialogTrigger asChild>
                <Button className="brand-gradient text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Driver Pertama
                </Button>
              </DialogTrigger>
            </CardContent>
          </Card>
        )}
      </div>
    </Dialog>
  );
};

export default DriverManagement;