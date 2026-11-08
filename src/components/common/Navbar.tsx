import React, { useState } from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  Menu,
  X,
  ShieldCheck,
  PhoneCall,
  Sparkles,
  ShoppingBag,
  Layers,
  HelpCircle,
  LogIn
} from 'lucide-react';
import { buildWhatsAppUrl } from '../../utils/formatters';

interface NavbarProps {
  onNavigate: (page: string, params?: any) => void;
  currentPage: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage }) => {
  const { settings } = useCatalog();
  const { isAuthenticated, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navSearch, setNavSearch] = useState('');
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (navSearch.trim()) {
      onNavigate('catalog', { q: navSearch.trim() });
      setMobileMenuOpen(false);
    }
  };

  const openWhatsAppGeneral = () => {
    const text = `Assalamu'alaikum Admin ${settings.app_name || 'Katalog Pondok'}, saya ingin berkonsultasi mengenai produk-produk karya santri.`;
    window.open(buildWhatsAppUrl(settings.whatsapp_number, text), '_blank');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
      {/* Top Announcement Bar */}
      {showAnnouncement && settings.announcement && (
        <div className="bg-emerald-900 text-emerald-100 text-xs py-1.5 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 truncate">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
              <span className="font-medium text-emerald-300 shrink-0">Warta Pondok:</span>
              <span className="truncate">{settings.announcement}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="hidden md:inline text-emerald-300/80">Jam Layanan: {settings.open_hours}</span>
              <button
                onClick={() => setShowAnnouncement(false)}
                className="text-emerald-300 hover:text-white p-0.5 rounded transition-colors"
                title="Sembunyikan"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4">
          {/* Brand Logo & Title */}
          <div
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 cursor-pointer select-none group shrink-0"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-950 flex items-center justify-center text-amber-300 shadow-md shadow-emerald-900/15 group-hover:scale-105 transition-transform duration-200 border border-emerald-600/40">
              <Sparkles className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-emerald-800 transition-colors">
                  {settings.app_name || 'Katalog Pondok'}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                  Santri
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate max-w-[200px] sm:max-w-xs">
                {settings.pondok_name || 'Pusat Karya & Usaha Mandiri Pesantren'}
              </p>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden lg:flex items-center relative flex-1 max-w-md mx-4"
          >
            <input
              type="text"
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              placeholder="Cari kitab, sarung goyor, madu, kopi santri..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-stone-100/80 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <button
              type="submit"
              className="absolute right-1.5 px-2.5 py-1 text-xs font-semibold bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors"
            >
              Cari
            </button>
          </form>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => onNavigate('home')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                currentPage === 'home'
                  ? 'text-emerald-800 bg-emerald-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-stone-100'
              }`}
            >
              Beranda
            </button>

            <button
              onClick={() => onNavigate('catalog')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                currentPage === 'catalog'
                  ? 'text-emerald-800 bg-emerald-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-stone-100'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              Katalog Produk
            </button>

            <button
              onClick={() => onNavigate('categories')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                currentPage === 'categories'
                  ? 'text-emerald-800 bg-emerald-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-stone-100'
              }`}
            >
              <Layers className="w-4 h-4" />
              Kategori
            </button>

            <button
              onClick={() => onNavigate('about')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                currentPage === 'about'
                  ? 'text-emerald-800 bg-emerald-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-stone-100'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              Panduan & Profil
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* WhatsApp Direct Help */}
            <button
              onClick={openWhatsAppGeneral}
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors"
              title="Konsultasi Pesanan via WhatsApp"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
              <span>Hubungi Kami</span>
            </button>

            {/* Admin Portal Button */}
            {isAuthenticated ? (
              <button
                onClick={() => onNavigate('admin-dashboard')}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 shadow-xs transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Panel Admin</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('admin-login')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-stone-100 border border-stone-200 transition-all"
                title="Masuk sebagai Administrator"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            )}

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-stone-100 focus:outline-hidden"
              aria-label="Buka Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 pt-3 pb-6 space-y-4 shadow-xl animate-in slide-in-from-top-2">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              placeholder="Cari produk santri..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-stone-100 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-slate-800"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
          </form>

          <nav className="flex flex-col space-y-1">
            <button
              onClick={() => {
                onNavigate('home');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold text-left ${
                currentPage === 'home' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700 hover:bg-stone-100'
              }`}
            >
              <span>Beranda</span>
            </button>

            <button
              onClick={() => {
                onNavigate('catalog');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold text-left ${
                currentPage === 'catalog' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                <span>Katalog Produk</span>
              </div>
            </button>

            <button
              onClick={() => {
                onNavigate('categories');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold text-left ${
                currentPage === 'categories' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <span>Kategori Produk</span>
              </div>
            </button>

            <button
              onClick={() => {
                onNavigate('about');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold text-left ${
                currentPage === 'about' ? 'bg-emerald-50 text-emerald-800' : 'text-slate-700 hover:bg-stone-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                <span>Panduan & Profil Pondok</span>
              </div>
            </button>
          </nav>

          <div className="pt-2 border-t border-stone-100 flex flex-col gap-2">
            <button
              onClick={() => {
                openWhatsAppGeneral();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm shadow-xs hover:bg-emerald-700"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Hubungi CS WhatsApp</span>
            </button>

            {isAuthenticated ? (
              <button
                onClick={() => {
                  onNavigate('admin-dashboard');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-sm"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Dashboard Administrator ({user?.name || 'Admin'})</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onNavigate('admin-login');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-stone-300 text-slate-700 font-semibold text-sm hover:bg-stone-50"
              >
                <LogIn className="w-4 h-4" />
                <span>Login Pengelola / Admin</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
