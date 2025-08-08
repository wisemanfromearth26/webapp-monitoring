import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

const ProductSelectionGrid = ({ products, cart, updateQuantity }) => {
  const { settings } = useSettings();
  const getQuantityInCart = (productId) => {
    const item = cart.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" style={{ color: settings.primaryColor }} />
          Pilih Produk
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => {
            const quantity = getQuantityInCart(product.id);
            return (
              <div
                key={product.id}
                className="bg-card rounded-lg border-2 hover:shadow-md transition-all flex flex-col relative overflow-hidden"
                style={{ borderColor: quantity > 0 ? settings.primaryColor : 'hsl(var(--border))' }}
              >
                {quantity > 0 && (
                  <div
                    style={{ backgroundColor: settings.primaryColor }}
                    className="absolute top-2 right-2 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full z-10"
                  >
                    {quantity}
                  </div>
                )}
                
                <div className="relative w-full pt-[100%]">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="absolute top-0 left-0 w-full h-full object-cover"
                  />
                </div>

                <div className="p-3 flex flex-col flex-grow justify-between">
                  <h3 className="font-medium text-sm mb-1 flex-grow">{product.name}</h3>
                  <p className="font-semibold text-sm mb-2" style={{color: settings.secondaryColor}}>
                    Rp {product.price.toLocaleString()}
                  </p>
                  
                  {quantity === 0 ? (
                    <Button
                      onClick={(e) => { e.stopPropagation(); updateQuantity(product.id, 1); }}
                      className="w-full brand-gradient text-white h-9"
                    >
                      <Plus className="w-4 h-4 mr-1" /> Tambah
                    </Button>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={(e) => { e.stopPropagation(); updateQuantity(product.id, -1); }}
                        className="h-9 w-9"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="text-lg font-bold w-10 text-center">{quantity}</span>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={(e) => { e.stopPropagation(); updateQuantity(product.id, 1); }}
                        className="h-9 w-9"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductSelectionGrid;