import React, { useState, useEffect } from 'react';
import type { Category } from '../../types';
import { api } from '../../services/api';
import { useCatalog } from '../../context/CatalogContext';
import { AVAILABLE_ICONS, CategoryIcon } from '../common/CategoryIcon';
import { X, Check, AlertCircle } from 'lucide-react';

interface CategoryModalProps {
  isOpen: boolean;
  categoryToEdit?: Category | null;
  onClose: () => void;
  onSuccess: () => void;
}

const BADGE_COLORS = [
  { name: 'emerald', label: 'Emerald Hijau', class: 'bg-emerald-600' },
  { name: 'amber', label: 'Amber Emas', class: 'bg-amber-600' },
  { name: 'teal', label: 'Teal Biru Laut', class: 'bg-teal-600' },
  { name: 'orange', label: 'Orange Terakota', class: 'bg-orange-600' },
  { name: 'indigo', label: 'Indigo Santri', class: 'bg-indigo-600' },
  { name: 'slate', label: 'Slate Netral', class: 'bg-slate-700' }
];

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  categoryToEdit,
  onClose,
  onSuccess
}) => {
  const { addToast } = useCatalog();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Package');
  const [badgeColor, setBadgeColor] = useState('emerald');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name || '');
      setDescription(categoryToEdit.description || '');
      setIcon(categoryToEdit.icon || 'Package');
      setBadgeColor(categoryToEdit.badge_color || 'emerald');
    } else {
      setName('');
      setDescription('');
      setIcon('Package');
      setBadgeColor('emerald');
    }
    setErrorMsg('');
  }, [categoryToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Nama kategori wajib diisi');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      if (categoryToEdit) {
        await api.updateCategory(categoryToEdit.id, {
          name: name.trim(),
          description: description.trim(),
          icon,
          badge_color: badgeColor
        });
        addToast({
          type: 'success',
          title: 'Kategori Diperbarui',
          message: `Kategori "${name}" berhasil diubah`
        });
      } else {
        await api.createCategory({
          name: name.trim(),
          description: description.trim(),
          icon,
          badge_color: badgeColor
        });
        addToast({
          type: 'success',
          title: 'Kategori Dibuat',
          message: `Kategori baru "${name}" telah berhasil dibuat`
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan kategori');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-5">
          <h3 className="font-extrabold text-slate-900 text-lg">
            {categoryToEdit ? 'Edit Kategori Produk' : 'Tambah Kategori Baru'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3.5 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Nama Kategori <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Busana Muslim Santri"
              className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Deskripsi Singkat
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Keterangan jenis produk yang masuk ke kategori ini..."
              className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-slate-900 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Pilih Ikon Kategori
            </label>
            <div className="grid grid-cols-6 gap-2">
              {AVAILABLE_ICONS.map((iconKey) => (
                <button
                  type="button"
                  key={iconKey}
                  onClick={() => setIcon(iconKey)}
                  className={`p-2.5 rounded-xl border flex items-center justify-center transition-all ${
                    icon === iconKey
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-md scale-105'
                      : 'bg-stone-50 text-slate-600 border-stone-200 hover:bg-stone-100'
                  }`}
                  title={iconKey}
                >
                  <CategoryIcon name={iconKey} className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Warna Tema Aksen
            </label>
            <div className="flex items-center gap-2">
              {BADGE_COLORS.map((color) => (
                <button
                  type="button"
                  key={color.name}
                  onClick={() => setBadgeColor(color.name)}
                  className={`w-7 h-7 rounded-full ${color.class} flex items-center justify-center transition-transform ${
                    badgeColor === color.name ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                  title={color.label}
                >
                  {badgeColor === color.name && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-300 text-slate-700 font-semibold text-xs hover:bg-stone-100"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-md transition-colors disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : categoryToEdit ? 'Simpan' : 'Buat Kategori'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
