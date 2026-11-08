import React from 'react';
import { useCatalog } from '../../context/CatalogContext';
import {
  Sparkles,
  MapPin,
  Phone,
  Mail,
  Clock,
  CreditCard,
  MessageCircle,
  ShieldCheck,
  Heart
} from 'lucide-react';
import { buildWhatsAppUrl } from '../../utils/formatters';

interface FooterProps {
  onNavigate: (page: string, params?: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { settings, categories } = useCatalog();

  const handleWhatsAppFloating = () => {
    const text = `Assalamu'alaikum Admin ${settings.app_name || 'Katalog Pondok'}, saya ingin bertanya seputar produk karya santri.`;
    window.open(buildWhatsAppUrl(settings.whatsapp_number, text), '_blank');
  };

  return (
    <>
      <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 pt-16 pb-12 mt-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12">
            {/* Col 1: Identity */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-900 flex items-center justify-center text-amber-300 border border-emerald-500/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-white tracking-tight">
                    {settings.app_name || 'Katalog Pondok'}
                  </h3>
                  <p className="text-xs text-emerald-400 font-medium">
                    {settings.pondok_name || 'Pondok Pesantren'}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                {settings.description ||
                  'Platform katalog dan etalase digital resmi karya santri dan unit usaha binaan pondok pesantren. Mendorong kemandirian ekonomi pesantren yang berkah dan profesional.'}
              </p>

              <div className="pt-2 text-xs text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% Produk Halal, Berkah, & Berdaya</span>
              </div>
            </div>

            {/* Col 2: Kategori Populer */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Kategori Produk
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                {categories.slice(0, 6).map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => onNavigate('catalog', { category: cat.slug })}
                      className="hover:text-emerald-400 transition-colors flex items-center justify-between w-full text-left"
                    >
                      <span>{cat.name}</span>
                      {cat.product_count !== undefined && (
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                          {cat.product_count}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3: Layanan & Kontak */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Kontak & Pelayanan
              </h4>
              <div className="space-y-2.5 text-xs text-slate-400">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{settings.address}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>WA: +{settings.whatsapp_number}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{settings.email}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{settings.open_hours}</span>
                </div>
              </div>
            </div>

            {/* Col 4: Pembayaran & Dukungan */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Rekening Koperasi & Usaha
              </h4>
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-semibold">
                  <CreditCard className="w-4 h-4" />
                  <span>Rekening Resmi Pondok</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed break-words font-mono">
                  {settings.bank_info}
                </p>
                <p className="text-[10px] text-slate-400">
                  Seluruh hasil usaha dialokasikan untuk operasional beasiswa dan kemandirian santri.
                </p>
              </div>

              <button
                onClick={() => onNavigate('admin-login')}
                className="text-xs text-slate-400 hover:text-emerald-400 transition-colors inline-block pt-1"
              >
                &rarr; Portal Pengelola / Administrator
              </button>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="pt-8 mt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>
              &copy; {new Date().getFullYear()} {settings.app_name || 'Katalog Pondok'}. Seluruh Hak Cipta Dilindungi.
            </p>
            <div className="flex items-center gap-1 text-slate-400">
              <span>Diberdayakan dengan semangat berdikari santri</span>
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            </div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp CTA */}
      <button
        onClick={handleWhatsAppFloating}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-950/30 hover:scale-105 transition-all duration-200 group focus:outline-hidden"
        title="Tanya Admin via WhatsApp"
      >
        <MessageCircle className="w-5 h-5 fill-white group-hover:rotate-12 transition-transform" />
        <span className="text-xs font-bold hidden sm:inline">Tanya Produk via WA</span>
      </button>
    </>
  );
};
