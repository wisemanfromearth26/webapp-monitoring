import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useSettings } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
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

const ProductManagement = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useData();
  const { settings } = useSettings();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    fee: '',
    image: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.fee) {
      toast({
        title: "Error",
        description: "Nama, harga, dan fee produk harus diisi",
        variant: "destructive",
      });
      return;
    }

    const productData = {
      name: formData.name,
      price: parseInt(formData.price),
      fee: parseInt(formData.fee),
      image: formData.image || 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300'
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
      toast({
        title: "Produk Diperbarui!",
        description: `${productData.name} berhasil diperbarui`,
      });
    } else {
      addProduct(productData);
      toast({
        title: "Produk Ditambahkan!",
        description: `${productData.name} berhasil ditambahkan`,
      });
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price ? product.price.toString() : '0',
      fee: product.fee ? product.fee.toString() : '0',
      image: product.image
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (product) => {
    deleteProduct(product.id);
    toast({
      title: "Produk Dihapus!",
      description: `${product.name} berhasil dihapus`,
    });
  };

  const resetForm = () => {
    setFormData({ name: '', price: '', fee: '', image: '' });
    setEditingProduct(null);
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
        <div className="flex justify-between items-center flex-wrap gap-4">
          <h2 className="text-2xl font-bold">Manajemen Produk</h2>
          <DialogTrigger asChild>
            <Button className="brand-gradient text-white">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Produk
            </Button>
          </DialogTrigger>
        </div>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Produk</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Masukkan nama produk"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Harga (Rp)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="e.g. 5000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fee">Fee per Item (Rp)</Label>
                <Input
                  id="fee"
                  type="number"
                  value={formData.fee}
                  onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                  placeholder="e.g. 1000"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">URL Gambar (Opsional)</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1 brand-gradient text-white">
                {editingProduct ? 'Perbarui' : 'Tambah'} Produk
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
          {products.map((product) => (
            <Card key={product.id}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="font-bold text-lg" style={{ color: settings.primaryColor }}>
                      Rp {(product.price || 0).toLocaleString()}
                    </p>
                    <p className="text-sm font-medium flex items-center gap-1" style={{ color: settings.secondaryColor }}>
                      Fee: Rp {(product.fee || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(product)}
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
                          <AlertDialogTitle>Yakin ingin menghapus {product.name}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tindakan ini akan menghapus produk dari daftar. Aksi ini tidak dapat dibatalkan.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(product)} className="bg-red-600 hover:bg-red-700 text-white">
                            Ya, Hapus Produk
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

        {products.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Belum Ada Produk</h3>
              <p className="text-muted-foreground mb-4">Tambahkan produk pertama untuk memulai</p>
              <DialogTrigger asChild>
                <Button className="brand-gradient text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Produk Pertama
                </Button>
              </DialogTrigger>
            </CardContent>
          </Card>
        )}
      </div>
    </Dialog>
  );
};

export default ProductManagement;