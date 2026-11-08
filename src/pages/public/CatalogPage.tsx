import React, { useState, useEffect } from 'react';
import type { Product, Category } from '../../types';
import { api } from '../../services/api';
import { useCatalog } from '../../context/CatalogContext';
import { ProductCard } from '../../components/common/ProductCard';
import {
  Search,
  Filter,
  Grid,
  List,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ShoppingBag,
  SlidersHorizontal,
  ArrowUpDown
} from 'lucide-react';

interface CatalogPageProps {
  onNavigate: (page: string, params?: any) => void;
  initialQuery?: string;
  initialCategory?: string;
  initialFeatured?: boolean;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({
  onNavigate,
  initialQuery = '',
  initialCategory = '',
  initialFeatured = false
}) => {
  const { categories } = useCatalog();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [debouncedSearch, setDebouncedSearch] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [isFeaturedOnly, setIsFeaturedOnly] = useState(initialFeatured);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch products whenever filters or pagination change
  useEffect(() => {
    let isCancelled = false;

    const fetchFilteredProducts = async () => {
      setIsLoading(true);
      try {
        const res = await api.getProducts({
          q: debouncedSearch.trim() || undefined,
          category: selectedCategory || undefined,
          status: selectedStatus || undefined,
          sort: selectedSort,
          featured: isFeaturedOnly ? true : undefined,
          page: currentPage,
          limit: 12
        });

        if (!isCancelled) {
          setProducts(res.products);
          setTotalCount(res.pagination.total);
          setTotalPages(res.pagination.totalPages);
        }
      } catch (err) {
        console.error('Error fetching catalog products:', err);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    fetchFilteredProducts();

    return () => {
      isCancelled = true;
    };
  }, [debouncedSearch, selectedCategory, selectedStatus, selectedSort, isFeaturedOnly, currentPage]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setSelectedCategory('');
    setSelectedStatus('');
    setSelectedSort('newest');
    setIsFeaturedOnly(false);
    setCurrentPage(1);
  };

  const hasActiveFilters =
    debouncedSearch || selectedCategory || selectedStatus || selectedSort !== 'newest' || isFeaturedOnly;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Page Title & Breadcrumb */}
      <div>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
          <button onClick={() => onNavigate('home')} className="hover:text-emerald-700">
            Beranda
          </button>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Katalog Produk</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Katalog Lengkap Produk Santri
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Menampilkan {totalCount} produk karya mandiri dan hasil olahan santri
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari produk: kitab, sarung, madu, kopi..."
              className="w-full pl-9 pr-9 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white text-slate-900 placeholder-slate-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-slate-900"
            >
              <option value="">Semua Kategori ({categories.length})</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name} {c.product_count !== undefined ? `(${c.product_count})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="md:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-slate-900"
            >
              <option value="">Semua Ketersediaan</option>
              <option value="available">Tersedia (Ready)</option>
              <option value="preorder">Pre-Order</option>
              <option value="out_of_stock">Stok Habis</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="md:col-span-2">
            <select
              value={selectedSort}
              onChange={(e) => {
                setSelectedSort(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-slate-900"
            >
              <option value="newest">Terbaru</option>
              <option value="popular">Paling Populer</option>
              <option value="price_asc">Harga Terendah</option>
              <option value="price_desc">Harga Tertinggi</option>
              <option value="name_asc">Nama A-Z</option>
            </select>
          </div>
        </div>

        {/* Secondary Category Pills bar & View switcher */}
        <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
          {/* Quick Category Chips */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => {
                setSelectedCategory('');
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                !selectedCategory
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
              }`}
            >
              Semua
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedCategory(selectedCategory === c.slug ? '' : c.slug);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                  selectedCategory === c.slug
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-stone-100 text-slate-600 hover:bg-stone-200'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Featured Toggle and View switchers */}
          <div className="flex items-center gap-3 shrink-0">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 select-none">
              <input
                type="checkbox"
                checked={isFeaturedOnly}
                onChange={(e) => {
                  setIsFeaturedOnly(e.target.checked);
                  setCurrentPage(1);
                }}
                className="w-3.5 h-3.5 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <span>Unggulan Saja</span>
            </label>

            {/* View Layout Toggle */}
            <div className="hidden sm:flex items-center border border-stone-200 rounded-lg p-0.5 bg-stone-50">
              <button
                onClick={() => setViewLayout('grid')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewLayout === 'grid' ? 'bg-white shadow-2xs text-emerald-800' : 'text-slate-400'
                }`}
                title="Tampilan Grid"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewLayout('list')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewLayout === 'list' ? 'bg-white shadow-2xs text-emerald-800' : 'text-slate-400'
                }`}
                title="Tampilan Baris"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Filter Aktif:</span>
            {debouncedSearch && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-100 text-slate-700 border border-stone-200">
                Pencarian: "{debouncedSearch}"
                <X
                  className="w-3 h-3 cursor-pointer hover:text-rose-600"
                  onClick={() => setSearchTerm('')}
                />
              </span>
            )}
            {selectedCategory && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-100 text-slate-700 border border-stone-200">
                Kategori: {categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-rose-600"
                  onClick={() => setSelectedCategory('')}
                />
              </span>
            )}
            {selectedStatus && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-100 text-slate-700 border border-stone-200">
                Status: {selectedStatus}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-rose-600"
                  onClick={() => setSelectedStatus('')}
                />
              </span>
            )}
            {isFeaturedOnly && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
                Unggulan Saja
                <X
                  className="w-3 h-3 cursor-pointer hover:text-rose-600"
                  onClick={() => setIsFeaturedOnly(false)}
                />
              </span>
            )}
            <button
              onClick={handleResetFilters}
              className="text-xs text-rose-600 hover:text-rose-800 underline font-semibold ml-1"
            >
              Reset Semua Filter
            </button>
          </div>
        )}
      </div>

      {/* Product List/Grid Viewport */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Memuat produk katalog...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-2xs max-w-lg mx-auto">
          <ShoppingBag className="w-14 h-14 text-stone-300 mx-auto mb-4" />
          <h3 className="font-bold text-slate-900 text-lg">Tidak Ada Produk yang Ditemukan</h3>
          <p className="text-xs text-slate-500 mt-1 mb-6 leading-relaxed">
            Tidak ada produk yang cocok dengan kriteria pencarian Anda. Silakan coba kata kunci lain atau bersihkan filter.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-colors"
          >
            Bersihkan Seluruh Filter
          </button>
        </div>
      ) : (
        <div
          className={
            viewLayout === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }
        >
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onNavigate={onNavigate}
              layout={viewLayout}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && !isLoading && (
        <div className="pt-6 flex items-center justify-center gap-2">
          <button
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-2 rounded-xl border border-stone-200 bg-white text-slate-700 hover:bg-stone-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Halaman Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1 text-xs font-semibold">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                onClick={() => setCurrentPage(pg)}
                className={`w-9 h-9 rounded-xl transition-colors ${
                  currentPage === pg
                    ? 'bg-emerald-700 text-white font-bold shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                {pg}
              </button>
            ))}
          </div>

          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-2 rounded-xl border border-stone-200 bg-white text-slate-700 hover:bg-stone-50 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Halaman Selanjutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
