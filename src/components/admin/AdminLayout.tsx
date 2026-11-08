import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCatalog } from '../../context/CatalogContext';
import {
  LayoutDashboard,
  Package,
  Layers,
  Settings as SettingsIcon,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Sparkles,
  User,
  ShieldAlert
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: 'dashboard' | 'products' | 'categories' | 'settings';
  onTabChange: (tab: 'dashboard' | 'products' | 'categories' | 'settings') => void;
  onNavigatePublic: (page: string, params?: any) => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  onNavigatePublic
}) => {
  const { user, logout } = useAuth();
  const { settings, addToast } = useCatalog();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    addToast({
      type: 'info',
      title: 'Telah Keluar',
      message: 'Anda telah berhasil keluar dari sesi administrator'
    });
    onNavigatePublic('home');
  };

  const navItems = [
    {
      id: 'dashboard' as const,
      label: 'Dashboard Ringkasan',
      icon: LayoutDashboard,
      desc: 'Statistik & aktivitas'
    },
    {
      id: 'products' as const,
      label: 'Manajemen Produk',
      icon: Package,
      desc: 'Katalog, stok & harga'
    },
    {
      id: 'categories' as const,
      label: 'Manajemen Kategori',
      icon: Layers,
      desc: 'Klasifikasi produk'
    },
    {
      id: 'settings' as const,
      label: 'Pengaturan & Identitas',
      icon: SettingsIcon,
      desc: 'Profil, kontak & akun'
    }
  ];

  return (
    <div className="min-h-screen bg-stone-100/90 flex flex-col md:flex-row text-slate-800">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-slate-950 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800 sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-amber-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm leading-tight">Admin Pondok</h1>
            <p className="text-[10px] text-emerald-400">Panel Manajemen</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigatePublic('home')}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
            title="Lihat Web"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar (Desktop & Mobile Drawer) */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-72 bg-slate-950 text-white flex flex-col justify-between border-r border-slate-800/80 transition-transform duration-300 ease-in-out shrink-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand & App Info */}
          <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-amber-300 border border-emerald-500/30 shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-black text-base tracking-tight text-white leading-tight">
                  {settings.app_name || 'Katalog Pondok'}
                </h2>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-900/80 text-emerald-300 uppercase tracking-wider inline-block mt-0.5">
                  Panel Admin
                </span>
              </div>
            </div>

            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Snippet */}
          <div className="p-4 mx-3 my-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="truncate flex-1">
              <div className="text-xs font-bold text-white truncate">{user?.name || 'Administrator'}</div>
              <div className="text-[11px] text-slate-400 truncate">@{user?.username || 'admin'}</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1.5 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-lg shadow-emerald-950/40'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                  <div>
                    <div>{item.label}</div>
                    <div className="text-[10px] font-normal opacity-70">{item.desc}</div>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-800/80 space-y-2">
          <button
            onClick={() => onNavigatePublic('home')}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-800 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
              <span>Lihat Halaman Publik</span>
            </span>
            <span className="text-[10px] text-slate-400">&rarr;</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-200 text-xs font-bold border border-rose-900/40 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
