import React, { useState, useRef } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Image as ImageIcon, Palette, Save, Type, Sun, Moon, AlertTriangle, Clock, RotateCcw } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
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


const SettingsManagement = () => {
  const { settings, updateSettings, toggleTheme, resetSettings } = useSettings();
  const { factoryReset } = useData();
  const { user, verifyPassword } = useAuth();
  
  const [logoPreview, setLogoPreview] = useState(settings.logo);
  const [faviconPreview, setFaviconPreview] = useState(settings.favicon);
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(settings.secondaryColor);
  const [fontColor, setFontColor] = useState(settings.fontColor);
  const [headingColor, setHeadingColor] = useState(settings.headingColor);
  const [mutedFontColor, setMutedFontColor] = useState(settings.mutedFontColor);
  const [autoResetTime, setAutoResetTime] = useState(settings.autoResetTime || '00:00');
  const [isAutoResetEnabled, setIsAutoResetEnabled] = useState(settings.isAutoResetEnabled || false);

  const [password, setPassword] = useState('');
  
  const logoInputRef = useRef(null);
  const faviconInputRef = useRef(null);

  const handleFileChange = (e, setPreview, type) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          title: "File terlalu besar",
          description: `Ukuran ${type} tidak boleh melebihi 2MB.`,
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    updateSettings({
      logo: logoPreview,
      favicon: faviconPreview,
      primaryColor,
      secondaryColor,
      fontColor,
      headingColor,
      mutedFontColor,
      isAutoResetEnabled,
      autoResetTime
    });
    toast({
      title: "Pengaturan Disimpan!",
      description: "Tampilan aplikasi telah diperbarui.",
    });
  };

  const handleFactoryReset = () => {
    if (!verifyPassword(password)) {
      toast({
        title: "Password Salah",
        description: "Silakan masukkan password admin yang benar untuk melanjutkan.",
        variant: "destructive",
      });
      return;
    }
    
    factoryReset();
    resetSettings();

    toast({
      title: "Reset Berhasil!",
      description: "Aplikasi telah dikembalikan ke pengaturan awal. Anda akan diarahkan ke halaman login.",
    });

    // Timeout to allow toast to show before redirecting
    setTimeout(() => {
        window.location.href = '/login';
    }, 2000);
  };


  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Pengaturan Aplikasi</CardTitle>
            <CardDescription className="text-muted-foreground">
              Sesuaikan tampilan, fungsionalitas, dan reset aplikasi.
            </CardDescription>
          </div>
          <Button onClick={toggleTheme} variant="outline" size="icon">
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-8 divide-y divide-border">
        <div className="pt-8 space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2"><ImageIcon className="w-5 h-5" /> Logo & Favicon</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="logo-upload">Logo Aplikasi</Label>
              <div className="flex items-center gap-4">
                <img src={logoPreview} alt="Logo Preview" className="w-24 h-24 object-contain rounded-md border p-2 bg-slate-50 dark:bg-slate-900" />
                <Button variant="outline" onClick={() => logoInputRef.current.click()}>Ubah Logo</Button>
                <Input 
                  id="logo-upload"
                  ref={logoInputRef}
                  type="file" 
                  className="hidden"
                  accept="image/png, image/jpeg, image/svg+xml"
                  onChange={(e) => handleFileChange(e, setLogoPreview, 'logo')}
                />
              </div>
              <p className="text-xs text-muted-foreground">Rekomendasi: SVG atau PNG transparan. Maks 2MB.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="favicon-upload">Favicon</Label>
               <div className="flex items-center gap-4">
                <img src={faviconPreview} alt="Favicon Preview" className="w-12 h-12 object-contain rounded-md border p-2 bg-slate-50 dark:bg-slate-900" />
                <Button variant="outline" onClick={() => faviconInputRef.current.click()}>Ubah Favicon</Button>
                <Input 
                  id="favicon-upload"
                  ref={faviconInputRef}
                  type="file" 
                  className="hidden"
                  accept="image/png, image/x-icon, image/svg+xml"
                  onChange={(e) => handleFileChange(e, setFaviconPreview, 'favicon')}
                />
              </div>
              <p className="text-xs text-muted-foreground">Rekomendasi: 32x32 atau 64x64 px. Maks 2MB.</p>
            </div>
          </div>
        </div>

        <div className="pt-8 space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2"><Palette className="w-5 h-5" /> Skema Warna</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="primary-color">Warna Primer</Label>
              <div className="flex items-center gap-2">
                <Input id="primary-color" type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-12 h-10 p-1"/>
                <Input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="flex-1"/>
              </div>
              <p className="text-xs text-muted-foreground">Warna utama untuk tombol, tautan, dan elemen aktif.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondary-color">Warna Sekunder</Label>
              <div className="flex items-center gap-2">
                <Input id="secondary-color" type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="w-12 h-10 p-1" />
                <Input type="text" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="flex-1" />
              </div>
              <p className="text-xs text-muted-foreground">Warna pendukung untuk beberapa komponen.</p>
            </div>
          </div>
        </div>

        <div className="pt-8 space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2"><Type className="w-5 h-5" /> Warna Font</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="heading-color">Warna Judul</Label>
              <div className="flex items-center gap-2">
                <Input id="heading-color" type="color" value={headingColor} onChange={(e) => setHeadingColor(e.target.value)} className="w-12 h-10 p-1" />
                <Input type="text" value={headingColor} onChange={(e) => setHeadingColor(e.target.value)} className="flex-1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="font-color">Warna Teks Utama</Label>
              <div className="flex items-center gap-2">
                <Input id="font-color" type="color" value={fontColor} onChange={(e) => setFontColor(e.target.value)} className="w-12 h-10 p-1" />
                <Input type="text" value={fontColor} onChange={(e) => setFontColor(e.target.value)} className="flex-1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="muted-font-color">Warna Teks Redup</Label>
              <div className="flex items-center gap-2">
                <Input id="muted-font-color" type="color" value={mutedFontColor} onChange={(e) => setMutedFontColor(e.target.value)} className="w-12 h-10 p-1" />
                <Input type="text" value={mutedFontColor} onChange={(e) => setMutedFontColor(e.target.value)} className="flex-1" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-8 space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2"><Clock className="w-5 h-5" /> Reset Otomatis</h3>
           <div className="flex items-center justify-between p-4 border rounded-lg">
             <div>
                <Label htmlFor="auto-reset-switch" className="font-medium">Aktifkan Reset Data Harian Otomatis</Label>
                <p className="text-xs text-muted-foreground">Data pendapatan dan presensi harian akan direset setiap hari pada waktu yang ditentukan.</p>
             </div>
             <Switch
                id="auto-reset-switch"
                checked={isAutoResetEnabled}
                onCheckedChange={setIsAutoResetEnabled}
              />
           </div>
           {isAutoResetEnabled && (
            <div className="space-y-2">
                <Label htmlFor="auto-reset-time">Waktu Reset (24 Jam)</Label>
                <Input
                    id="auto-reset-time"
                    type="time"
                    value={autoResetTime}
                    onChange={(e) => setAutoResetTime(e.target.value)}
                    className="w-40"
                />
            </div>
           )}
        </div>

        <div className="flex justify-end pt-8">
          <Button onClick={handleSave} className="brand-gradient text-white">
            <Save className="w-4 h-4 mr-2" />
            Simpan Semua Perubahan
          </Button>
        </div>

        <div className="pt-8 space-y-4">
          <h3 className="text-lg font-medium flex items-center gap-2 text-destructive"><AlertTriangle className="w-5 h-5" /> Zona Berbahaya</h3>
          <div className="border border-destructive/50 bg-destructive/5 p-4 rounded-lg flex items-center justify-between">
            <div>
              <p className="font-medium">Reset Pabrik</p>
              <p className="text-sm text-muted-foreground">Tindakan ini akan menghapus semua data (produk, driver, penjualan, dll.) dan mengembalikan semua pengaturan ke default. Tindakan ini tidak dapat dibatalkan.</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive"><RotateCcw className="w-4 h-4 mr-2" /> Reset</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Anda benar-benar yakin?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Untuk mengonfirmasi, masukkan password admin Anda. Semua data akan dihapus secara permanen.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-2">
                  <Label htmlFor="password-confirm" className="sr-only">Password</Label>
                  <Input 
                    id="password-confirm"
                    type="password"
                    placeholder="Masukkan password admin"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setPassword('')}>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleFactoryReset} disabled={!password}>
                    Ya, Reset Sekarang
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SettingsManagement;