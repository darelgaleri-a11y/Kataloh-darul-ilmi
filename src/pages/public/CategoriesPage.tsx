import React from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { CategoryIcon } from '../../components/common/CategoryIcon';
import { ArrowRight, Layers, Package } from 'lucide-react';

interface CategoriesPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({ onNavigate }) => {
  const { categories } = useCatalog();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
          <button onClick={() => onNavigate('home')} className="hover:text-emerald-700">
            Beranda
          </button>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Kategori</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Kategori Produk & Unit Usaha Santri
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Pilih klasifikasi produk untuk melihat seluruh etalase barang karya santri pondok
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            onClick={() => onNavigate('catalog', { category: cat.slug })}
            className="group bg-white p-6 rounded-3xl border border-stone-200/90 hover:border-emerald-500 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-800 group-hover:bg-emerald-700 group-hover:text-white flex items-center justify-center mb-5 transition-colors duration-200 border border-emerald-100">
                <CategoryIcon name={cat.icon} className="w-7 h-7" />
              </div>

              <h2 className="text-lg font-black text-slate-900 group-hover:text-emerald-800 transition-colors leading-snug">
                {cat.name}
              </h2>

              <p className="text-xs text-slate-500 leading-relaxed mt-2 line-clamp-3">
                {cat.description || 'Kumpulan produk terbaik dalam kategori ini.'}
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-slate-400" />
                <span>{cat.product_count !== undefined ? `${cat.product_count} Produk` : 'Etalase'}</span>
              </span>

              <span className="font-bold text-emerald-700 group-hover:text-emerald-900 flex items-center gap-1">
                <span>Buka Etalase</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
