import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useData } from '@/contexts/DataContext';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

const defaultSettings = {
  theme: 'light',
  logo: '/vite.svg',
  favicon: '/vite.svg',
  primaryColor: '#9bbf43',
  secondaryColor: '#698023',
  fontColor: '#0f172a',
  headingColor: '#0f172a',
  mutedFontColor: '#64748b',
  isAutoResetEnabled: false,
  autoResetTime: '00:00',
};

const hexToHslString = (hex, defaultHsl) => {
  if (!hex || !/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    return defaultHsl; 
  }

  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex[1] + hex[2], 16);
    g = parseInt(hex[3] + hex[4], 16);
    b = parseInt(hex[5] + hex[6], 16);
  }
  
  r /= 255;
  g /= 255;
  b /= 255;
  
  const cmin = Math.min(r, g, b);
  const cmax = Math.max(r, g, b);
  const delta = cmax - cmin;
  let h = 0, s = 0, l = 0;

  if (delta === 0) {
    h = 0;
  } else if (cmax === r) {
    h = ((g - b) / delta) % 6;
  } else if (cmax === g) {
    h = (b - r) / delta + 2;
  } else {
    h = (r - g) / delta + 4;
  }

  h = Math.round(h * 60);
  if (h < 0) h += 360;

  l = (cmax + cmin) / 2;
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return `${h} ${s}% ${l}%`;
};

export const SettingsProvider = ({ children }) => {
  const dataContext = useData();
  const [settings, setSettings] = useState(() => {
    try {
      const storedSettings = localStorage.getItem('appSettings');
      const parsedSettings = storedSettings ? JSON.parse(storedSettings) : {};
      return { ...defaultSettings, ...parsedSettings };
    } catch (error) {
      console.error("Failed to load settings from localStorage", error);
      return defaultSettings;
    }
  });

  const applySettings = useCallback((settingsToApply) => {
    const root = document.documentElement;
    
    // Theme
    root.classList.remove('light', 'dark');
    root.classList.add(settingsToApply.theme);

    // Colors
    root.style.setProperty('--primary', hexToHslString(settingsToApply.primaryColor, '81 48% 51%'));
    root.style.setProperty('--ring', hexToHslString(settingsToApply.primaryColor, '81 48% 51%'));
    root.style.setProperty('--secondary', hexToHslString(settingsToApply.secondaryColor, '81 57% 32%'));
    root.style.setProperty('--foreground', hexToHslString(settingsToApply.fontColor, '222 47% 11%'));
    root.style.setProperty('--card-foreground', hexToHslString(settingsToApply.fontColor, '222 47% 11%'));
    root.style.setProperty('--heading-foreground', hexToHslString(settingsToApply.headingColor, '222 47% 11%'));
    root.style.setProperty('--muted-foreground', hexToHslString(settingsToApply.mutedFontColor, '226 47% 45%'));
    
    // Favicon
    if (settingsToApply.favicon) {
      const faviconElement = document.getElementById('favicon');
      if (faviconElement) {
        faviconElement.href = settingsToApply.favicon;
      }
    }
  }, []);

  useEffect(() => {
    applySettings(settings);
  }, [settings, applySettings]);
  
  useEffect(() => {
    if (settings.isAutoResetEnabled && dataContext && dataContext.resetTodayData) {
        const checkTime = () => {
            const now = new Date();
            const [hours, minutes] = settings.autoResetTime.split(':');
            if (now.getHours() === parseInt(hours) && now.getMinutes() === parseInt(minutes)) {
                console.log('Performing automatic daily reset...');
                dataContext.resetTodayData();
            }
        };

        const intervalId = setInterval(checkTime, 60000); // Check every minute
        return () => clearInterval(intervalId);
    }
  }, [settings.isAutoResetEnabled, settings.autoResetTime, dataContext]);

  const updateSettings = (newSettings) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    try {
      localStorage.setItem('appSettings', JSON.stringify(updatedSettings));
    } catch (error) {
      console.error("Failed to save settings to localStorage", error);
    }
  };
  
  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('appSettings');
  };

  const toggleTheme = () => {
    const newTheme = settings.theme === 'light' ? 'dark' : 'light';
    updateSettings({ theme: newTheme });
  };

  const value = { settings, updateSettings, toggleTheme, resetSettings };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};