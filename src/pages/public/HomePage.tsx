import React, { useState } from 'react';
import type { Product } from '../../types';
import { useCatalog } from '../../context/CatalogContext';
import { ProductCard } from '../../components/common/ProductCard';
import { CategoryIcon } from '../../components/common/CategoryIcon';
import {
  Search,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Heart,
  TrendingUp,
  CreditCard,
  MessageCircle,
  Package,
  Layers,
  Award,
  BookOpen
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string, params?: any) => void;
  featuredProducts: Product[];
  latestProducts: Product[];
  stats: { totalProducts: number; totalCategories: number; totalUnits: number };
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  featuredProducts,
  latestProducts,
  stats
}) => {
  const { settings, categories } = useCatalog();
  const [heroSearch, setHeroSearch] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      onNavigate('catalog', { q: heroSearch.trim() });
    } else {
      onNavigate('catalog');
    }
  };

  const popularKeywords = ['Kitab Kuning', 'Sarung Goyor', 'Madu Hutan', 'Kopi Robusta', 'Kaligrafi Jati'];

  return (
    <div className="space-y-16 sm:space-y-24 animate-in fade-in duration-300">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-radial-[at_top_right] from-emerald-800 via-emerald-900 to-slate-950 text-white shadow-2xl border border-emerald-700/30">
        {/* Subtle geometric pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-6 py-16 sm:py-24 text-center">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold mb-6 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Karya & Produk Mandiri Pesantren Terpadu</span>
          </div>

          {/* Hero Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-tight text-white mb-6">
            Belanja Produk Pilihan Karya Santri,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-emerald-200 to-teal-300">
              Berkah & Bermutu
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-emerald-100/90 leading-relaxed mb-8">
            Dukung kemandirian santri melalui etalase resmi pondok pesantren. Tersedia kitab fiqih,
            sarung tenun tradisional, madu alami thibbun nabawi, kopi lereng, hingga kaligrafi seni kayu jati.
          </p>

          {/* Hero Search Box */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto relative flex items-center bg-white rounded-2xl p-1.5 shadow-2xl border border-white/20 text-slate-800 mb-6"
          >
            <div className="pl-3.5 text-slate-400">
              <Search className="w-5 h-5 text-emerald-700" />
            </div>
            <input
              type="text"
              value={heroSearch}
              onChange={(e) => setHeroSearch(e.target.value)}
              placeholder="Cari produk santri: sarung goyor, madu murni, kitab pegon..."
              className="w-full px-3 py-2.5 text-sm sm:text-base bg-transparent focus:outline-hidden text-slate-900 placeholder-slate-400 font-medium"
            />
            <button
              type="submit"
              className="px-5 sm:px-7 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md transition-colors shrink-0"
            >
              Cari Produk
            </button>
          </form>

          {/* Quick Keywords Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-emerald-200/90 mb-10">
            <span className="font-semibold text-emerald-300">Pencarian Populer:</span>
            {popularKeywords.map((kw, i) => (
              <button
                key={i}
                onClick={() => onNavigate('catalog', { q: kw })}
                className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-800/80 border border-emerald-700/50 text-[11px] font-medium transition-colors"
              >
                {kw}
              </button>
            ))}
          </div>

          {/* Quick Counter Stats */}
          <div className="pt-8 border-t border-emerald-800/60 grid grid-cols-3 gap-4 max-w-xl mx-auto">
            <div>
              <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
                {stats.totalProducts}+
              </div>
              <div className="text-[11px] sm:text-xs text-emerald-200">Produk Tersedia</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
                {stats.totalCategories}
              </div>
              <div className="text-[11px] sm:text-xs text-emerald-200">Kategori Etalase</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
                100%
              </div>
              <div className="text-[11px] sm:text-xs text-emerald-200">Karya Santri Berdaya</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Showcase */}
      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Kategori Produk Santri
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Jelajahi karya terbaik berdasarkan ragam produk dan unit usaha pesantren
            </p>
          </div>
          <button
            onClick={() => onNavigate('categories')}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 group"
          >
            <span>Semua Kategori</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onNavigate('catalog', { category: cat.slug })}
              className="p-4 rounded-2xl bg-white border border-stone-200/90 hover:border-emerald-500/80 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 text-left flex flex-col justify-between group"
            >
              <div className="w-11 h-11 rounded-xl bg-stone-100 group-hover:bg-emerald-50 text-emerald-800 flex items-center justify-center mb-3 transition-colors">
                <CategoryIcon name={cat.icon} className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 group-hover:text-emerald-800 text-xs sm:text-sm line-clamp-1 transition-colors">
                  {cat.name}
                </h3>
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  {cat.product_count !== undefined ? `${cat.product_count} Produk` : 'Lihat etalase'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-end justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                <Sparkles className="w-5 h-5 fill-amber-500" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Produk Pilihan Santri (Unggulan)
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Produk karya mandiri paling diminati dengan standar mutu terbaik
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('catalog', { featured: true })}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 group"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onNavigate={onNavigate}
                layout="grid"
              />
            ))}
          </div>
        </section>
      )}

      {/* Social Enterprise Banner / Pesantren Values */}
      <section className="rounded-3xl bg-emerald-950 text-white p-8 sm:p-12 relative overflow-hidden border border-emerald-800/40">
        <div className="max-w-3xl">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
            Semangat Kemandirian Ekonomi Pesantren
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2 mb-4 leading-snug">
            Setiap Transaksi Mengalir Menjadi Infaq & Beasiswa Pendidikan Santri
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed mb-8">
            Katalog Pondok bukan sekadar toko online komersial, melainkan wadah pemberdayaan keterampilan wirausaha santri. Seluruh surplus hasil penjualan dikembalikan ke kas pondok guna membiayai fasilitas asrama, perpustakaan kitab, dan santri berprestasi yang kurang mampu.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-800/60 flex items-center justify-center text-amber-300 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white">100% Halal & Amanah</h4>
                <p className="text-[11px] text-emerald-200/70 mt-0.5">Muamalah syariah transparan</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-800/60 flex items-center justify-center text-amber-300 shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white">Mutu & Kualitas Terjaga</h4>
                <p className="text-[11px] text-emerald-200/70 mt-0.5">Dibuat langsung tangan santri</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-800/60 flex items-center justify-center text-amber-300 shrink-0">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white">Infaq & Berkah</h4>
                <p className="text-[11px] text-emerald-200/70 mt-0.5">Dukung beasiswa dhuafa</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Products */}
      {latestProducts && latestProducts.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Rilisan & Panen Terbaru
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Produk terbaru yang baru saja selesai diproduksi santri
              </p>
            </div>
            <button
              onClick={() => onNavigate('catalog', { sort: 'newest' })}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 group"
            >
              <span>Jelajahi Semua Produk</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onNavigate={onNavigate}
                layout="grid"
              />
            ))}
          </div>
        </section>
      )}

      {/* 4-Step Order Guide */}
      <section className="bg-white rounded-3xl p-8 sm:p-10 border border-stone-200 shadow-xs space-y-8">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
            Alur Pemesanan Mudah
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Cara Belanja di Katalog Pondok
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Pemesanan langsung terhubung ke pengurus melalui WhatsApp tanpa ribet
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center mx-auto">
              1
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Pilih Produk</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Pilih produk dan baca spesifikasi ukuran, bahan, atau khasiat yang tertera.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center mx-auto">
              2
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Klik Pesan WA</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Klik tombol pesan untuk membuka format chat resmi dengan rincian produk otomatis.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center mx-auto">
              3
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Konfirmasi & Transfer</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Admin menghitung ongkos kirim ke alamat Anda. Lakukan pembayaran ke rekening resmi pondok.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-black text-sm flex items-center justify-center mx-auto">
              4
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Paket Dikirim</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Pesanan Anda dikemas rapi dan dikirim dengan nomor resi terpercaya langsung ke tujuan.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
