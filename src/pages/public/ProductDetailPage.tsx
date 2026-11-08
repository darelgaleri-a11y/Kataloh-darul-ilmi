import React, { useState, useEffect } from 'react';
import type { Product } from '../../types';
import { api } from '../../services/api';
import { useCatalog } from '../../context/CatalogContext';
import { ProductCard } from '../../components/common/ProductCard';
import {
  formatRupiah,
  generateWhatsAppMessage,
  buildWhatsAppUrl,
  formatNumber
} from '../../utils/formatters';
import {
  MessageCircle,
  Share2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Truck,
  CreditCard,
  RefreshCw,
  Eye,
  Copy,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ProductDetailPageProps {
  slug: string;
  onNavigate: (page: string, params?: any) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ slug, onNavigate }) => {
  const { settings, addToast } = useCatalog();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'order'>('desc');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const res = await api.getProductDetail(slug);
        if (!isCancelled) {
          setProduct(res.product);
          setRelatedProducts(res.relatedProducts);
        }
      } catch (err) {
        console.error('Failed to load product detail:', err);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    fetchDetail();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      isCancelled = true;
    };
  }, [slug]);

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
        <span className="text-xs font-semibold text-slate-500">Memuat rincian produk...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-20 text-center max-w-md mx-auto">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900">Produk Tidak Ditemukan</h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          Produk yang Anda cari mungkin telah dinonaktifkan atau tautan salah.
        </p>
        <button
          onClick={() => onNavigate('catalog')}
          className="px-5 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs"
        >
          Kembali ke Katalog
        </button>
      </div>
    );
  }

  const discountPercentage =
    product.original_price && product.original_price > product.price
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : 0;

  // Parse specifications
  let parsedSpecs: Record<string, string> = {};
  try {
    if (product.specs) {
      parsedSpecs = typeof product.specs === 'string' ? JSON.parse(product.specs) : product.specs;
    }
  } catch {}

  const handleOrderWhatsApp = () => {
    // Record inquiry
    api.recordInquiry(product.id).catch(() => {});

    // Confetti celebration
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 }
      });
    } catch {}

    const text = generateWhatsAppMessage(
      product.name,
      product.price,
      product.slug,
      settings.app_name || 'Katalog Pondok'
    );
    window.open(buildWhatsAppUrl(settings.whatsapp_number, text), '_blank');

    addToast({
      type: 'info',
      title: 'Menghubungkan ke WhatsApp',
      message: 'Format pemesanan produk telah disiapkan untuk dikirim ke admin'
    });
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      addToast({
        type: 'success',
        title: 'Tautan Disalin',
        message: 'Tautan produk berhasil disalin ke papan klip'
      });
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <button
          onClick={() => onNavigate('home')}
          className="hover:text-emerald-700 transition-colors"
        >
          Beranda
        </button>
        <span>/</span>
        <button
          onClick={() => onNavigate('catalog')}
          className="hover:text-emerald-700 transition-colors"
        >
          Katalog
        </button>
        <span>/</span>
        <button
          onClick={() => onNavigate('catalog', { category: product.category_slug })}
          className="hover:text-emerald-700 transition-colors truncate max-w-[150px]"
        >
          {product.category_name}
        </button>
        <span>/</span>
        <span className="text-slate-800 font-semibold truncate max-w-[200px]">{product.name}</span>
      </div>

      {/* Product Main Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left: Product Image & Gallery (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative aspect-square w-full rounded-3xl bg-stone-100 overflow-hidden border border-stone-200/90 shadow-md">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80';
              }}
            />

            {/* Badges on Image */}
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none">
              {discountPercentage > 0 && (
                <span className="bg-rose-600 text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-sm">
                  Diskon {discountPercentage}%
                </span>
              )}
              {product.is_featured === 1 && (
                <span className="inline-flex items-center gap-1 bg-amber-500 text-slate-950 text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                  Pilihan Unggulan Santri
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Product Details & Actions (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            {/* Category & Status */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                {product.category_name}
              </span>

              {product.status === 'available' && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-stone-100 text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Stok Siap Kirim ({product.stock} {product.unit})
                </span>
              )}
              {product.status === 'preorder' && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Sistem Pre-Order
                </span>
              )}
              {product.status === 'out_of_stock' && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  Stok Sedang Habis
                </span>
              )}
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Unit Usaha Tag */}
            {product.unit_usaha && (
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Karya / Produksi: <strong className="text-slate-800">{product.unit_usaha}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Price Box */}
          <div className="p-5 rounded-2xl bg-stone-100/80 border border-stone-200/90 flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <span className="text-xs text-slate-500 font-medium block mb-1">
                Harga Resmi Pondok:
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-black text-slate-950 font-sans">
                  {formatRupiah(product.price)}
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  / {product.unit || 'pcs'}
                </span>
              </div>
              {product.original_price && product.original_price > product.price && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-400 line-through">
                    {formatRupiah(product.original_price)}
                  </span>
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                    Hemat {formatRupiah(product.original_price - product.price)}
                  </span>
                </div>
              )}
            </div>

            <div className="text-right text-xs text-slate-500">
              <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Produk Asli Santri</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                {product.views} kali dilihat &bull; {product.inquiry_count} konsultasi
              </span>
            </div>
          </div>

          {/* Short Description Quote */}
          {product.short_desc && (
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic border-l-3 border-emerald-600 pl-3">
              "{product.short_desc}"
            </p>
          )}

          {/* CTA Order Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleOrderWhatsApp}
              className="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm shadow-xl shadow-emerald-950/20 hover:scale-[1.01] transition-all flex items-center justify-center gap-2.5 group"
            >
              <MessageCircle className="w-5 h-5 fill-white group-hover:rotate-12 transition-transform" />
              <span>Pesan Sekarang via WhatsApp</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="w-full sm:w-auto py-4 px-4 rounded-2xl border border-stone-300 bg-white hover:bg-stone-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
              title="Salin Tautan Produk"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Tersalin</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-slate-500" />
                  <span>Bagikan</span>
                </>
              )}
            </button>
          </div>

          {/* Direct Guarantee Badges */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-stone-100 text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Kirim Seluruh Nusantara</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Rekening Resmi Pondok</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Infaq & Berkah Santri</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section: Deskripsi, Spesifikasi, Cara Pesan */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-2xs overflow-hidden">
        {/* Tab Header */}
        <div className="flex border-b border-stone-200 bg-stone-50/70 overflow-x-auto">
          <button
            onClick={() => setActiveTab('desc')}
            className={`px-6 py-4 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'desc'
                ? 'border-emerald-700 text-emerald-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Deskripsi Lengkap
          </button>

          <button
            onClick={() => setActiveTab('specs')}
            className={`px-6 py-4 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'specs'
                ? 'border-emerald-700 text-emerald-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Spesifikasi & Informasi Tambahan
          </button>

          <button
            onClick={() => setActiveTab('order')}
            className={`px-6 py-4 text-xs sm:text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'order'
                ? 'border-emerald-700 text-emerald-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Panduan Order & Rekening
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 sm:p-8">
          {activeTab === 'desc' && (
            <div className="space-y-4 max-w-3xl">
              <h3 className="font-bold text-slate-900 text-base">Uraian Produk Santri</h3>
              <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {product.description}
              </div>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="space-y-4 max-w-2xl">
              <h3 className="font-bold text-slate-900 text-base">Rincian Teknis & Mutu</h3>
              {Object.keys(parsedSpecs).length > 0 ? (
                <div className="rounded-xl border border-stone-200 overflow-hidden">
                  <table className="w-full text-xs">
                    <tbody>
                      {Object.entries(parsedSpecs).map(([key, val], idx) => (
                        <tr
                          key={idx}
                          className={idx % 2 === 0 ? 'bg-stone-50/70' : 'bg-white'}
                        >
                          <td className="py-2.5 px-4 font-bold text-slate-700 w-1/3 border-b border-stone-100">
                            {key}
                          </td>
                          <td className="py-2.5 px-4 text-slate-800 border-b border-stone-100">
                            {val}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  Belum ada catatan spesifikasi khusus untuk produk ini.
                </p>
              )}
            </div>
          )}

          {activeTab === 'order' && (
            <div className="space-y-5 max-w-2xl text-xs text-slate-700">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                <h4 className="font-bold text-emerald-900 text-sm flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-700" />
                  <span>Rekening Resmi Koperasi / Yayasan Pondok</span>
                </h4>
                <p className="text-emerald-950 font-mono text-xs font-bold">{settings.bank_info}</p>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Harap hanya mentransfer ke rekening resmi pondok di atas setelah menerima konfirmasi ketersediaan dan rincian ongkos kirim dari Admin WhatsApp kami.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900">Alur Pengiriman:</h4>
                <ol className="list-decimal pl-4 space-y-1 text-slate-600">
                  <li>Kirim pesan WhatsApp melalui tombol pemesanan di halaman ini.</li>
                  <li>Admin mencatat alamat lengkap penerima dan memverifikasi ongkos kirim.</li>
                  <li>Lakukan transfer pembayaran dan kirimkan bukti transfer ke WhatsApp admin.</li>
                  <li>Paket dikirimkan pada hari yang sama atau maksimal H+1 hari kerja.</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="space-y-6 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Produk Sejenis Lainnya
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Karya santri lainnya dari kategori "{product.category_name}"
              </p>
            </div>
            <button
              onClick={() => onNavigate('catalog', { category: product.category_slug })}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-900"
            >
              Lihat Kategori Ini &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} onNavigate={onNavigate} layout="grid" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
