import React, { useState, useEffect } from 'react';
import type { Product, Category } from '../../types';
import { api } from '../../services/api';
import { formatRupiah, formatNumber } from '../../utils/formatters';
import { useCatalog } from '../../context/CatalogContext';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Package
} from 'lucide-react';

interface AdminProductsPageProps {
  categories: Category[];
  onOpenAddModal: () => void;
  onOpenEditModal: (product: Product) => void;
  onNavigatePublicProduct: (slug: string) => void;
}

export const AdminProductsPage: React.FC<AdminProductsPageProps> = ({
  categories,
  onOpenAddModal,
  onOpenEditModal,
  onNavigatePublicProduct
}) => {
  const { addToast } = useCatalog();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Delete dialog state
  const [deleteCandidate, setDeleteCandidate] = useState<Product | null>(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAdminProducts();
      setProducts(data);
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Gagal Memuat Produk',
        message: err.message || 'Tidak dapat mengambil data produk'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleToggleFeatured = async (product: Product) => {
    const newFeatured = product.is_featured === 1 ? 0 : 1;
    try {
      await api.updateProduct(product.id, { is_featured: newFeatured });
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, is_featured: newFeatured } : p))
      );
      addToast({
        type: 'success',
        title: 'Status Unggulan Diubah',
        message: `"${product.name}" ${newFeatured === 1 ? 'dijadikan' : 'dihapus dari'} produk unggulan`
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        message: 'Gagal mengubah status unggulan'
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteCandidate) return;
    try {
      await api.deleteProduct(deleteCandidate.id);
      setProducts((prev) => prev.filter((p) => p.id !== deleteCandidate.id));
      addToast({
        type: 'success',
        title: 'Produk Dihapus',
        message: `Produk "${deleteCandidate.name}" telah dihapus permanen`
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Gagal Menghapus',
        message: err.message || 'Terjadi kesalahan sistem'
      });
    } finally {
      setDeleteCandidate(null);
    }
  };

  // Filtered products client-side
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchTerm ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.unit_usaha && p.unit_usaha.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.slug.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat = !selectedCat || String(p.category_id) === selectedCat;
    const matchesStatus = !selectedStatus || p.status === selectedStatus;

    return matchesSearch && matchesCat && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Manajemen Produk Katalog
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Kelola data barang, harga, stok, foto, dan status ketersediaan karya santri
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchProducts}
            className="p-2.5 rounded-xl border border-stone-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-stone-50 transition-colors shadow-2xs"
            title="Muat Ulang"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-900/15 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk Baru</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-col md:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama produk, SKU/slug, atau unit santri..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white text-slate-900"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
        </div>

        {/* Category Filter */}
        <div className="w-full md:w-52">
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-slate-900"
          >
            <option value="">Semua Kategori ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-44">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-slate-900"
          >
            <option value="">Semua Status</option>
            <option value="available">Tersedia</option>
            <option value="preorder">Pre-Order</option>
            <option value="out_of_stock">Stok Habis</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
            <span>Memuat tabel produk...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="font-bold text-slate-800 text-sm">Tidak Ada Produk yang Cocok</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
              Silakan ubah kata kunci pencarian atau bersihkan filter di atas.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCat('');
                setSelectedStatus('');
              }}
              className="px-3.5 py-1.5 rounded-xl border border-stone-300 text-xs font-semibold text-slate-600 hover:bg-stone-50"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Produk</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Harga & Diskon</th>
                  <th className="py-3 px-4">Stok & Status</th>
                  <th className="py-3 px-4 text-center">Unggulan</th>
                  <th className="py-3 px-4 text-center">Aktivitas</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs">
                {filteredProducts.map((p) => {
                  const hasDiscount = p.original_price && p.original_price > p.price;
                  return (
                    <tr key={p.id} className="hover:bg-stone-50/80 transition-colors">
                      {/* Product Thumbnail + Title */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden shrink-0">
                            <img
                              src={p.image_url}
                              alt={p.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80';
                              }}
                            />
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <div className="font-bold text-slate-900 truncate">{p.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono truncate">
                              /{p.slug}
                            </div>
                            {p.unit_usaha && (
                              <div className="text-[10px] text-emerald-700 font-medium">
                                {p.unit_usaha}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold bg-stone-100 text-stone-700">
                          {p.category_name || 'Umum'}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-bold text-slate-900">{formatRupiah(p.price)}</div>
                          {hasDiscount && (
                            <div className="text-[10px] text-rose-600 line-through">
                              {formatRupiah(p.original_price)}
                            </div>
                          )}
                          <div className="text-[10px] text-slate-400">per {p.unit || 'pcs'}</div>
                        </div>
                      </td>

                      {/* Stock & Status */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="font-semibold text-slate-700">
                            {p.stock} <span className="text-[10px] text-slate-400">{p.unit}</span>
                          </div>
                          <div>
                            {p.status === 'available' && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                Tersedia
                              </span>
                            )}
                            {p.status === 'preorder' && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                                <Clock className="w-2.5 h-2.5 text-amber-600" />
                                Pre-Order
                              </span>
                            )}
                            {p.status === 'out_of_stock' && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-200 text-stone-700">
                                <AlertTriangle className="w-2.5 h-2.5 text-rose-500" />
                                Habis
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Featured Toggle */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleFeatured(p)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            p.is_featured === 1
                              ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                              : 'text-stone-300 hover:text-amber-500 hover:bg-stone-100'
                          }`}
                          title={
                            p.is_featured === 1
                              ? 'Produk Unggulan (Klik untuk batalkan)'
                              : 'Klik untuk jadikan produk unggulan di beranda'
                          }
                        >
                          <Sparkles
                            className={`w-4 h-4 ${p.is_featured === 1 ? 'fill-amber-500' : ''}`}
                          />
                        </button>
                      </td>

                      {/* Views & Inquiries */}
                      <td className="py-3 px-4 text-center">
                        <div className="text-[11px] text-slate-500">
                          <div>
                            <strong>{formatNumber(p.views || 0)}</strong> tayangan
                          </div>
                          <div className="text-emerald-700 font-semibold">
                            {formatNumber(p.inquiry_count || 0)} chat WA
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onNavigatePublicProduct(p.slug)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-stone-100 transition-colors"
                            title="Buka Halaman Publik"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onOpenEditModal(p)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                            title="Edit Data Produk"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteCandidate(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Hapus Produk"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Summary */}
        <div className="px-4 py-3 bg-stone-50 border-t border-stone-200 text-xs text-slate-500 flex items-center justify-between">
          <span>
            Menampilkan <strong>{filteredProducts.length}</strong> dari{' '}
            <strong>{products.length}</strong> total produk
          </span>
          <span className="text-[11px] text-slate-400">Pembaruan data langsung tersimpan</span>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deleteCandidate}
        title="Hapus Produk dari Katalog?"
        message={`Apakah Anda yakin ingin menghapus produk "${deleteCandidate?.name}"? Tindakan ini bersifat permanen dan data produk tidak dapat dikembalikan.`}
        confirmLabel="Ya, Hapus Sekarang"
        cancelLabel="Batal"
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteCandidate(null)}
      />
    </div>
  );
};
