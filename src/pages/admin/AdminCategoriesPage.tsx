import React, { useState } from 'react';
import type { Category } from '../../types';
import { api } from '../../services/api';
import { useCatalog } from '../../context/CatalogContext';
import { CategoryIcon } from '../../components/common/CategoryIcon';
import { CategoryModal } from '../../components/admin/CategoryModal';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { Plus, Edit2, Trash2, Layers, AlertCircle, RefreshCw, Package } from 'lucide-react';

interface AdminCategoriesPageProps {
  onOpenProductsForCategory: (catId: number) => void;
}

export const AdminCategoriesPage: React.FC<AdminCategoriesPageProps> = ({
  onOpenProductsForCategory
}) => {
  const { categories, refreshData, addToast } = useCatalog();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenAdd = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setSelectedCategory(cat);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteCandidate) return;
    setIsDeleting(true);
    try {
      await api.deleteCategory(deleteCandidate.id);
      addToast({
        type: 'success',
        title: 'Kategori Dihapus',
        message: `Kategori "${deleteCandidate.name}" berhasil dihapus`
      });
      await refreshData();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Tidak Dapat Menghapus Kategori',
        message: err.message || 'Terjadi kesalahan'
      });
    } finally {
      setIsDeleting(false);
      setDeleteCandidate(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Manajemen Kategori Produk
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Atur kelompok etalase untuk memudahkan santri dan pembeli menelusuri katalog
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refreshData()}
            className="p-2.5 rounded-xl border border-stone-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-stone-50 transition-colors shadow-2xs"
            title="Muat Ulang"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-900/15 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kategori Baru</span>
          </button>
        </div>
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-emerald-800">
                  <CategoryIcon name={cat.icon} className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                    title="Edit Kategori"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteCandidate(cat)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Hapus Kategori"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="font-extrabold text-base text-slate-900 leading-snug">{cat.name}</h3>
              <div className="text-[11px] text-slate-400 font-mono mb-2">/{cat.slug}</div>

              {cat.description ? (
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                  {cat.description}
                </p>
              ) : (
                <p className="text-xs text-slate-400 italic mb-4">Tidak ada deskripsi</p>
              )}
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-slate-400" />
                <span>{cat.product_count ?? 0} Produk Terdaftar</span>
              </span>

              <button
                onClick={() => onOpenProductsForCategory(cat.id)}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:underline"
              >
                Lihat Produk &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Category Modal (Create / Edit) */}
      <CategoryModal
        isOpen={isModalOpen}
        categoryToEdit={selectedCategory}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          refreshData();
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteCandidate}
        title="Hapus Kategori?"
        message={`Apakah Anda yakin ingin menghapus kategori "${deleteCandidate?.name}"? Pastikan tidak ada produk yang masih terhubung ke kategori ini.`}
        confirmLabel={isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
        cancelLabel="Batal"
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteCandidate(null)}
      />
    </div>
  );
};
