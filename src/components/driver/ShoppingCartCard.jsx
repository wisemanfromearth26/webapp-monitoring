import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Plus, Minus, Save, Trash2 } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

const ShoppingCartCard = ({ cart, updateQuantity, saveSales, getCartTotal }) => {
  const { settings } = useSettings();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" style={{ color: settings.primaryColor }} />
            Keranjang Belanja
          </div>
          {cart.length > 0 && (
            <span
              style={{ backgroundColor: settings.primaryColor }}
              className="text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full"
            >
              {cart.reduce((acc, item) => acc + item.quantity, 0)}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {cart.length === 0 ? (
          <div className="text-center text-muted-foreground py-8 flex flex-col items-center gap-2">
            <ShoppingCart className="w-10 h-10" />
            <p>Keranjang Anda kosong</p>
            <p className="text-xs">Pilih produk untuk memulai</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 max-h-[22rem] overflow-y-auto pr-2">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-muted/50 rounded-lg p-3"
                >
                  <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-md mr-3" />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.name}</h4>
                    <p className="text-xs text-muted-foreground">Rp {item.price.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.id, -1)}
                      className="h-8 w-8 p-0"
                    >
                      {item.quantity > 1 ? <Minus className="w-3 h-3" /> : <Trash2 className="w-3 h-3 text-red-500" />}
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.id, 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total:</span>
                <span className="font-bold text-xl" style={{ color: settings.primaryColor }}>
                  Rp {getCartTotal().toLocaleString()}
                </span>
              </div>
              <Button
                onClick={saveSales}
                className="w-full brand-gradient text-white h-12 text-base font-bold"
              >
                <Save className="w-5 h-5 mr-2" />
                Simpan Penjualan
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ShoppingCartCard;