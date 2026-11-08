import React from 'react';
import { useCatalog } from '../../context/CatalogContext';
import {
  Sparkles,
  ShieldCheck,
  HeartHandshake,
  Award,
  MapPin,
  Phone,
  Mail,
  Clock,
  CreditCard,
  Building2,
  BookOpen
} from 'lucide-react';
import { buildWhatsAppUrl } from '../../utils/formatters';

interface AboutPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const { settings } = useCatalog();

  const handleConsultation = () => {
    const text = `Assalamu'alaikum Admin ${settings.app_name || 'Katalog Pondok'}, saya ingin bersilaturahmi dan bertanya mengenai unit usaha pondok pesantren.`;
    window.open(buildWhatsAppUrl(settings.whatsapp_number, text), '_blank');
  };

  return (
    <div className="space-y-12 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Profil & Landasan Kemandirian</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Tentang {settings.app_name || 'Katalog Pondok'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed">
          {settings.tagline || 'Pusat Karya Mandiri & Produk Unggulan Santri Pesantren'}
        </p>
      </div>

      {/* Main Mission Card */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-stone-200/90 shadow-2xs space-y-6">
        <h2 className="text-xl font-black text-slate-900">
          Landasan & Tujuan Katalog Pondok
        </h2>
        <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-4">
          <p>
            {settings.description ||
              'Katalog Pondok merupakan platform digital terpadu yang menampilkan seluruh ragam produk berkualitas tinggi hasil binaan para santri, asatidz, dan unit usaha pondok pesantren.'}
          </p>
          <p>
            Di era modern ini, pesantren tidak hanya menjadi benteng tafaqquh fiddin (pendalaman ilmu agama), namun juga motor penggerak ekonomi umat berbasis kemandirian, etos kerja, dan muamalah syariah yang bersih dan berkah.
          </p>
          <p>
            Melalui aplikasi katalog ini, masyarakat, alumni, wali santri, dan khalayak umum dapat dengan mudah menemukan produk-produk unggulan santri mulai dari kitab fiqih makna pegon, sarung tenun goyor tradisional, madu hutan liar murni, kopi sangrai lereng pesantren, busana muslim, hingga karya seni kaligrafi ukir kayu jati.
          </p>
        </div>

        <div className="pt-6 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <h3 className="font-bold text-slate-900 text-xs">Muamalah Syariah</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Jual beli yang jujur, transparan, halal, serta bebas dari unsur gharar.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
            <HeartHandshake className="w-5 h-5 text-emerald-700" />
            <h3 className="font-bold text-slate-900 text-xs">Pemberdayaan Santri</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Santri dibekali keterampilan vokasi bernilai guna tinggi sebelum terjun ke masyarakat.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
            <Award className="w-5 h-5 text-emerald-700" />
            <h3 className="font-bold text-slate-900 text-xs">Infaq Berkelanjutan</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Seluruh keuntungan dialokasikan untuk operasional beasiswa santri berprestasi.
            </p>
          </div>
        </div>
      </div>

      {/* Contact & Location Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-2xs space-y-4">
          <h2 className="font-black text-slate-900 text-base">Alamat & Jam Pelayanan</h2>
          <div className="space-y-3 text-xs text-slate-600">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>{settings.address}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{settings.open_hours}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{settings.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>WhatsApp: +{settings.whatsapp_number}</span>
            </div>
          </div>

          <button
            onClick={handleConsultation}
            className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors"
          >
            Hubungi Pengurus via WA
          </button>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="font-black text-slate-900 text-base">Rekening Koperasi & Pembayaran</h2>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Rekening resmi lembaga yang terverifikasi untuk pembayaran transaksi maupun infaq pengembangan pesantren.
            </p>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 font-mono text-xs font-bold break-words">
              {settings.bank_info}
            </div>
          </div>

          <div className="text-[11px] text-slate-400">
            *Pastikan mencantumkan nomor resi/nama pemesan saat mengirim bukti transfer ke WhatsApp admin.
          </div>
        </div>
      </div>
    </div>
  );
};
