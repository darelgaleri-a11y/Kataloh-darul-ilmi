import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Settings, Category, ToastMessage } from '../types';
import { api } from '../services/api';

interface CatalogContextType {
  settings: Settings;
  categories: Category[];
  isLoading: boolean;
  toasts: ToastMessage[];
  addToast: (msg: { type: 'success' | 'error' | 'info'; title?: string; message: string }) => void;
  removeToast: (id: string) => void;
  refreshData: () => Promise<void>;
  updateSettingsState: (newSettings: Partial<Settings>) => void;
}

const defaultSettings: Settings = {
  app_name: 'Katalog Pondok',
  tagline: 'Etalase Karya Mandiri & Produk Unggulan Santri Pesantren',
  description: 'Aplikasi katalog produk karya santri dan unit usaha pondok pesantren.',
  whatsapp_number: '6281234567890',
  email: 'katalog@pesantrenpondok.id',
  address: 'Kompleks Pesantren Terpadu, Jl. KH. Hasyim Asy\'ari No. 45, Jawa Timur',
  open_hours: 'Setiap Hari 08.00 - 21.00 WIB',
  bank_info: 'BSI (Bank Syariah Indonesia) No. Rek: 7188-2938-19 a.n. Koperasi Usaha Pondok Pesantren',
  announcement: 'Dapatkan diskon spesial Rilisan Karya Santri untuk setiap pembelian!',
  pondok_name: 'Pondok Pesantren Darul Barakah'
};

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

export const CatalogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((msg: { type: 'success' | 'error' | 'info'; title?: string; message: string }) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastMessage = { id, ...msg };
    setToasts((prev) => [...prev, newToast]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const refreshData = useCallback(async () => {
    try {
      const res = await api.getInitialData();
      if (res.settings) {
        setSettings((prev) => ({ ...prev, ...res.settings }));
      }
      if (res.categories) {
        setCategories(res.categories);
      }
    } catch (err) {
      console.error('Failed to load initial catalog data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSettingsState = (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return (
    <CatalogContext.Provider
      value={{
        settings,
        categories,
        isLoading,
        toasts,
        addToast,
        removeToast,
        refreshData,
        updateSettingsState
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
};

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error('useCatalog must be used within a CatalogProvider');
  }
  return context;
}
