import React, { useState, useEffect } from 'react';
import type { Settings } from '../../types';
import { api } from '../../services/api';
import { useCatalog } from '../../context/CatalogContext';
import {
  Save,
  Building,
  Phone,
  CreditCard,
  KeyRound,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Info
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { settings, updateSettingsState, addToast } = useCatalog();

  const [formData, setFormData] = useState<Settings>({ ...settings });
  const [isSaving, setIsSaving] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passError, setPassError] = useState('');

  useEffect(() => {
    setFormData({ ...settings });
  }, [settings]);

  const handleInputChange = (field: keyof Settings, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateSettings(formData);
      updateSettingsState(formData);
      addToast({
        type: 'success',
        title: 'Pengaturan Disimpan',
        message: 'Informasi identitas dan kontak katalog pondok berhasil diperbarui'
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Gagal Menyimpan',
        message: err.message || 'Terjadi kesalahan sistem'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');

    if (newPassword.length < 6) {
      setPassError('Password baru minimal 6 karakter');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError('Konfirmasi password tidak cocok');
      return;
    }

    setIsChangingPass(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      addToast({
        type: 'success',
        title: 'Kata Sandi Diperbarui',
        message: 'Password akun admin berhasil diubah'
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPassError(err.message || 'Gagal mengubah password');
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl">
      {/* Top Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Pengaturan Aplikasi & Identitas Pondok
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Sesuaikan profil pesantren, nomor kontak pemesanan WhatsApp, dan rekening pembayaran
        </p>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Card 1: Profil Pondok & Identitas */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-stone-100">
            <Building className="w-5 h-5 text-emerald-700" />
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Identitas Katalog & Pesantren
              </h3>
              <p className="text-xs text-slate-400">
                Nama institusi, tagline, dan deskripsi profil aplikasi
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nama Aplikasi / Katalog
              </label>
              <input
                type="text"
                required
                value={formData.app_name || ''}
                onChange={(e) => handleInputChange('app_name', e.target.value)}
                placeholder="Katalog Pondok"
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nama Yayasan / Pondok Pesantren
              </label>
              <input
                type="text"
                required
                value={formData.pondok_name || ''}
                onChange={(e) => handleInputChange('pondok_name', e.target.value)}
                placeholder="Pondok Pesantren Darul Barakah"
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-slate-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Slogan / Tagline
              </label>
              <input
                type="text"
                value={formData.tagline || ''}
                onChange={(e) => handleInputChange('tagline', e.target.value)}
                placeholder="Etalase Karya Mandiri & Produk Unggulan Santri Pesantren"
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-slate-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Pita Pengumuman Atas (Warta Beranda)
              </label>
              <input
                type="text"
                value={formData.announcement || ''}
                onChange={(e) => handleInputChange('announcement', e.target.value)}
                placeholder="Dapatkan diskon spesial..."
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-slate-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Deskripsi Singkat Tentang Katalog Pondok
              </label>
              <textarea
                rows={3}
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-slate-900 leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Kontak & Operasional */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-stone-100">
            <Phone className="w-5 h-5 text-emerald-700" />
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Kontak Pemesanan & Alamat
              </h3>
              <p className="text-xs text-slate-400">
                Nomor WhatsApp untuk pesanan langsung pembeli dan alamat pengiriman
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nomor WhatsApp Admin (Dengan Kode Negara, Contoh: 6281234567890)
              </label>
              <input
                type="text"
                required
                value={formData.whatsapp_number || ''}
                onChange={(e) => handleInputChange('whatsapp_number', e.target.value)}
                placeholder="6281234567890"
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 font-mono text-slate-900"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Tombol "Pesan via WA" di setiap produk akan terhubung langsung ke nomor ini
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Email Resmi Pesantren
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="katalog@pesantren.id"
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-slate-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Alamat Lengkap Komplek Pondok
              </label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Jl. KH Hasyim Asy'ari..."
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Jam Layanan Operasional
              </label>
              <input
                type="text"
                value={formData.open_hours || ''}
                onChange={(e) => handleInputChange('open_hours', e.target.value)}
                placeholder="Setiap Hari 08.00 - 21.00 WIB"
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Rekening Pembayaran */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-5">
          <div className="flex items-center gap-2.5 pb-4 border-b border-stone-100">
            <CreditCard className="w-5 h-5 text-emerald-700" />
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Rekening Pembayaran & Infaq
              </h3>
              <p className="text-xs text-slate-400">
                Informasi rekening bank resmi koperasi pondok yang ditampilkan ke pembeli
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Detail Rekening Bank (Nama Bank, No Rekening, dan Atas Nama)
            </label>
            <input
              type="text"
              value={formData.bank_info || ''}
              onChange={(e) => handleInputChange('bank_info', e.target.value)}
              placeholder="BSI (Bank Syariah Indonesia) No. Rek: 7188-2938-19 a.n. Koperasi Pondok"
              className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-slate-900"
            />
          </div>
        </div>

        {/* Save Settings Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-900/15 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Menyimpan...' : 'Simpan Seluruh Pengaturan'}</span>
          </button>
        </div>
      </form>

      {/* Card 4: Change Password Section */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-5">
        <div className="flex items-center gap-2.5 pb-4 border-b border-stone-100">
          <KeyRound className="w-5 h-5 text-emerald-700" />
          <div>
            <h3 className="font-extrabold text-base text-slate-900">
              Keamanan Akun Administrator
            </h3>
            <p className="text-xs text-slate-400">
              Ubah kata sandi untuk melindungi akses panel administrator
            </p>
          </div>
        </div>

        {passError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{passError}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Password Saat Ini <span className="text-rose-600">*</span>
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Masukkan password saat ini"
              className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Password Baru <span className="text-rose-600">*</span>
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
              className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Konfirmasi Password Baru <span className="text-rose-600">*</span>
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi password baru"
              className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-slate-900"
            />
          </div>

          <button
            type="submit"
            disabled={isChangingPass}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{isChangingPass ? 'Memproses...' : 'Perbarui Password Admin'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
