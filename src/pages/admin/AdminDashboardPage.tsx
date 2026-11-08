import React, { useState, useEffect } from 'react';
import type { DashboardData } from '../../types';
import { api } from '../../services/api';
import { formatRupiah, formatNumber, formatDateIndo } from '../../utils/formatters';
import {
  Package,
  Layers,
  CheckCircle,
  AlertTriangle,
  MessageCircle,
  Eye,
  Plus,
  Coins,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  Clock
} from 'lucide-react';

interface AdminDashboardPageProps {
  onNavigateTab: (tab: 'dashboard' | 'products' | 'categories' | 'settings') => void;
  onOpenAddProduct: () => void;
  onOpenAddCategory: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  onNavigateTab,
  onOpenAddProduct,
  onOpenAddCategory
}) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await api.getDashboard();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Gagal mengambil data dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
        <span className="text-xs font-semibold text-slate-500">Memuat data ringkasan dashboard...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-white rounded-2xl border border-rose-200 text-center space-y-3">
        <p className="text-sm text-rose-700 font-medium">{error || 'Data tidak dapat dimuat'}</p>
        <button
          onClick={fetchDashboard}
          className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-semibold"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  const { metrics, lowStockProducts, categoryDistribution, recentActivities } = data;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Ringkasan Statistik Katalog
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pantau perputaran produk, stok persediaan, dan minat pemesanan santri
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboard}
            className="p-2.5 rounded-xl border border-stone-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-stone-50 transition-colors shadow-2xs"
            title="Muat Ulang Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenAddProduct}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-900/15 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Produk
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900">
              {formatNumber(metrics.totalProducts)}
            </div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{metrics.totalAvailable} produk siap pesan</span>
            </div>
          </div>
        </div>

        {/* Total Categories */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Kategori Aktif
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900">
              {formatNumber(metrics.totalCategories)}
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">
              Klasifikasi etalase pondok
            </div>
          </div>
        </div>

        {/* Total Inquiries (WhatsApp Click) */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Klik Pesan WA
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900">
              {formatNumber(metrics.totalInquiries)}
            </div>
            <div className="text-[11px] text-teal-700 font-semibold mt-1">
              Peminat order via WhatsApp
            </div>
          </div>
        </div>

        {/* Catalog Asset Value */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Nilai Persediaan
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 truncate">
              {formatRupiah(metrics.catalogValue)}
            </div>
            <div className="text-[11px] text-indigo-700 font-medium mt-1">
              Estimasi nilai total stok
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alert Section */}
      {lowStockProducts && lowStockProducts.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 shadow-2xs">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-amber-900 text-sm">
                  Peringatan Stok Menipis ({lowStockProducts.length} Produk &le; 5 Unit)
                </h3>
                <p className="text-xs text-amber-800">
                  Segera koordinasikan dengan santri produsen atau perbarui persediaan
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('products')}
              className="text-xs font-bold text-amber-900 hover:text-amber-950 underline shrink-0"
            >
              Lihat di Produk &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {lowStockProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white p-3 rounded-xl border border-amber-200/80 flex items-center justify-between gap-3 text-xs"
              >
                <div className="truncate">
                  <div className="font-bold text-slate-900 truncate">{p.name}</div>
                  <div className="text-[11px] text-slate-400">{p.category_name}</div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                    Sisa {p.stock} {p.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Middle Grid: Category Distribution & Activity Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Category distribution */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Sebaran Kategori</h3>
            <button
              onClick={() => onNavigateTab('categories')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
            >
              Kelola &rarr;
            </button>
          </div>

          <div className="space-y-3 pt-2">
            {categoryDistribution.map((cat, idx) => {
              const percentage = metrics.totalProducts > 0
                ? Math.round((cat.count / metrics.totalProducts) * 100)
                : 0;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 truncate">{cat.name}</span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      {cat.count} produk ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, percentage)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-stone-100">
            <button
              onClick={onOpenAddCategory}
              className="w-full py-2.5 rounded-xl border border-dashed border-stone-300 text-slate-600 hover:text-emerald-700 hover:border-emerald-500 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Kategori Baru</span>
            </button>
          </div>
        </div>

        {/* Right: Activity Logs */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <h3 className="font-bold text-slate-900 text-base">Aktivitas Terkini</h3>
            </div>
            <span className="text-xs text-slate-400">Log operasional sistem</span>
          </div>

          <div className="space-y-3 pt-1">
            {recentActivities.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Belum ada aktivitas tercatat</p>
            ) : (
              recentActivities.slice(0, 6).map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-stone-50/80 border border-stone-100 text-xs"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-800 truncate">{log.detail}</span>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {formatDateIndo(log.timestamp)}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Oleh: <strong className="text-slate-700">{log.actor}</strong> &bull; Aksi:{' '}
                      <span className="font-mono text-[10px] bg-stone-200 px-1 py-0.2 rounded text-slate-700">
                        {log.action}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
