import React from 'react';
import type { Product } from '../../types';
import { formatRupiah, generateWhatsAppMessage, buildWhatsAppUrl } from '../../utils/formatters';
import { useCatalog } from '../../context/CatalogContext';
import { api } from '../../services/api';
import { MessageCircle, Eye, Sparkles, Building2, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onNavigate: (page: string, params?: any) => void;
  layout?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onNavigate,
  layout = 'grid'
}) => {
  const { settings, addToast } = useCatalog();

  const discountPercentage =
    product.original_price && product.original_price > product.price
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : 0;

  const handleWhatsAppOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Record inquiry click
    api.recordInquiry(product.id).catch(() => {});

    const msg = generateWhatsAppMessage(
      product.name,
      product.price,
      product.slug,
      settings.app_name || 'Katalog Pondok'
    );
    const waUrl = buildWhatsAppUrl(settings.whatsapp_number, msg);
    window.open(waUrl, '_blank');
    addToast({
      type: 'info',
      title: 'Menghubungkan ke WhatsApp',
      message: `Membuka template pemesanan untuk "${product.name}"`
    });
  };

  const getStatusBadge = () => {
    if (product.status === 'out_of_stock' || product.stock <= 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-stone-800 text-stone-200">
          <AlertTriangle className="w-3 h-3 text-rose-400" />
          Stok Habis
        </span>
      );
    }
    if (product.status === 'preorder') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200">
          <Clock className="w-3 h-3 text-amber-600" />
          Pre-Order
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        Tersedia
      </span>
    );
  };

  if (layout === 'list') {
    return (
      <div
        onClick={() => onNavigate('product-detail', { slug: product.slug })}
        className="group bg-white rounded-2xl border border-stone-200/90 hover:border-emerald-500/60 shadow-xs hover:shadow-lg transition-all duration-200 overflow-hidden cursor-pointer flex flex-col sm:flex-row"
      >
        {/* Thumbnail */}
        <div className="relative w-full sm:w-56 h-48 sm:h-auto shrink-0 bg-stone-100 overflow-hidden">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80';
            }}
          />
          {discountPercentage > 0 && (
            <span className="absolute top-3 left-3 bg-rose-600 text-white text-[11px] font-extrabold px-2 py-0.5 rounded-md shadow-xs">
              Hemat {discountPercentage}%
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-stone-100 text-stone-700">
                {product.category_name || 'Katalog Pondok'}
              </span>
              {getStatusBadge()}
              {product.is_featured === 1 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Pilihan Santri
                </span>
              )}
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1 mb-1">
              {product.name}
            </h3>

            {product.short_desc && (
              <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                {product.short_desc}
              </p>
            )}

            {product.unit_usaha && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Unit: {product.unit_usaha}</span>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-black text-emerald-800">
                  {formatRupiah(product.price)}
                </span>
                <span className="text-xs text-slate-400 font-medium">/{product.unit || 'pcs'}</span>
              </div>
              {product.original_price && product.original_price > product.price && (
                <span className="text-xs text-slate-400 line-through">
                  {formatRupiah(product.original_price)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleWhatsAppOrder}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Pesan via WA</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate('product-detail', { slug: product.slug });
                }}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-stone-100 border border-stone-200 transition-colors"
                title="Lihat Detail Produk"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view (default)
  return (
    <div
      onClick={() => onNavigate('product-detail', { slug: product.slug })}
      className="group bg-white rounded-2xl border border-stone-200/90 hover:border-emerald-500/60 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden cursor-pointer flex flex-col h-full"
    >
      {/* Product Image */}
      <div className="relative aspect-4/3 w-full bg-stone-100 overflow-hidden">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between gap-1 pointer-events-none">
          <div className="flex flex-col gap-1">
            {discountPercentage > 0 && (
              <span className="bg-rose-600 text-white text-[11px] font-black px-2 py-0.5 rounded-md shadow-xs">
                -{discountPercentage}%
              </span>
            )}
            {product.is_featured === 1 && (
              <span className="inline-flex items-center gap-1 bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                <Sparkles className="w-2.5 h-2.5 fill-slate-950" />
                Unggulan
              </span>
            )}
          </div>
          <div>{getStatusBadge()}</div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Unit */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px] truncate max-w-[150px]">
              {product.category_name || 'Katalog'}
            </span>
            <span className="text-[11px] text-slate-400">
              Stok: <strong className="text-slate-700">{product.stock}</strong>
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 text-sm leading-snug mb-1">
            {product.name}
          </h3>

          {/* Unit Usaha */}
          {product.unit_usaha && (
            <p className="text-[11px] text-slate-400 truncate mb-3">
              Oleh {product.unit_usaha}
            </p>
          )}
        </div>

        {/* Price & Action */}
        <div className="pt-3 border-t border-stone-100 flex items-end justify-between gap-2 mt-2">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-base sm:text-lg font-black text-slate-950">
                {formatRupiah(product.price)}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">/{product.unit || 'pcs'}</span>
            </div>
            {product.original_price && product.original_price > product.price && (
              <span className="text-[11px] text-slate-400 line-through block">
                {formatRupiah(product.original_price)}
              </span>
            )}
          </div>

          <button
            onClick={handleWhatsAppOrder}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors shrink-0"
            title="Pesan via WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pesan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
