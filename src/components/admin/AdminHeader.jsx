import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';

const AdminHeader = ({ user, onLogout }) => {
  const { settings } = useSettings();

  return (
    <div className="bg-card shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            {settings.logo ? (
              <img src={settings.logo} alt="App Logo" className="h-10 w-auto object-contain" />
            ) : (
              <div className="w-10 h-10 brand-gradient rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">{user.name.charAt(0)}</span>
              </div>
            )}
          </div>
          <Button
            onClick={onLogout}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;