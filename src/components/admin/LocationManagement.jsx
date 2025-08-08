import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Plus, Edit, Trash2, MapPin, Building } from 'lucide-react';
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

const LocationManagement = () => {
  const { locations, addLocation, updateLocation, deleteLocation } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    address: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.address) {
      toast({
        title: "Error",
        description: "Nama dan alamat lokasi harus diisi",
        variant: "destructive",
      });
      return;
    }

    const locationData = {
      name: formData.name,
      address: formData.address
    };

    if (editingLocation) {
      updateLocation(editingLocation.id, locationData);
      toast({
        title: "Lokasi Diperbarui!",
        description: `${locationData.name} berhasil diperbarui`,
      });
    } else {
      addLocation(locationData);
      toast({
        title: "Lokasi Ditambahkan!",
        description: `${locationData.name} berhasil ditambahkan`,
      });
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (location) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      address: location.address
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (location) => {
    deleteLocation(location.id);
    toast({
      title: "Lokasi Dihapus!",
      description: `${location.name} berhasil dihapus`,
    });
  };

  const resetForm = () => {
    setFormData({ name: '', address: '' });
    setEditingLocation(null);
  };
  
  const handleDialogOpenChange = (open) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };


  return (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Manajemen Lokasi</h2>
          <DialogTrigger asChild>
            <Button className="brand-gradient text-white">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Lokasi
            </Button>
          </DialogTrigger>
        </div>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingLocation ? 'Edit Lokasi' : 'Tambah Lokasi Baru'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lokasi</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Masukkan nama lokasi"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Alamat</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Masukkan alamat lengkap"
                required
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1 brand-gradient text-white">
                {editingLocation ? 'Perbarui' : 'Tambah'} Lokasi
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
          {locations.map((location) => (
            <Card key={location.id}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{location.name}</h3>
                      <p className="text-sm text-muted-foreground">Lokasi Operasional</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Building className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{location.address}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(location)}
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
                          <AlertDialogTitle>Yakin ingin menghapus {location.name}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Menghapus lokasi ini dapat memengaruhi jadwal dan data driver yang sudah ada. Aksi ini tidak dapat dibatalkan.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(location)} className="bg-red-600 hover:bg-red-700 text-white">
                            Ya, Hapus Lokasi
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

        {locations.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Belum Ada Lokasi</h3>
              <p className="text-muted-foreground mb-4">Tambahkan lokasi pertama untuk memulai</p>
              <DialogTrigger asChild>
                <Button className="brand-gradient text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Lokasi Pertama
                </Button>
              </DialogTrigger>
            </CardContent>
          </Card>
        )}
      </div>
    </Dialog>
  );
};

export default LocationManagement;