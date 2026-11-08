import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCatalog } from '../../context/CatalogContext';
import {
  Sparkles,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  KeyRound
} from 'lucide-react';

interface AdminLoginPageProps {
  onNavigatePublic: (page: string) => void;
  onLoginSuccess: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onNavigatePublic,
  onLoginSuccess
}) => {
  const { login } = useAuth();
  const { settings, addToast } = useCatalog();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMsg('Username dan password wajib diisi');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      await login(username.trim(), password);
      addToast({
        type: 'success',
        title: 'Berhasil Masuk',
        message: 'Selamat datang di Panel Administrator Katalog Pondok'
      });
      onLoginSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Username atau password tidak cocok');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseDemo = () => {
    setUsername('admin');
    setPassword('adminpondok123');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      {/* Back to Public Home Button */}
      <div className="absolute top-6 left-6">
        <button
          onClick={() => onNavigatePublic('home')}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white text-slate-700 hover:text-slate-900 border border-stone-200 text-xs font-semibold shadow-2xs hover:bg-stone-50 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Beranda</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Header */}
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-700 to-emerald-950 flex items-center justify-center text-amber-300 shadow-xl shadow-emerald-950/20 border border-emerald-600/40">
            <Sparkles className="w-7 h-7" />
          </div>
        </div>

        <h2 className="mt-4 text-center text-2xl font-black tracking-tight text-slate-900">
          Masuk Administrator
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500 max-w">
          {settings.pondok_name || 'Katalog Pondok Pesantren'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-stone-200/50 rounded-2xl border border-stone-200">
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-slate-900"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                  className="w-full pl-9 pr-10 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-slate-900"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-950/20 transition-all disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span>{isLoading ? 'Memverifikasi...' : 'Masuk ke Dashboard'}</span>
              </button>
            </div>
          </form>

          {/* Quick Demo Credentials Helper */}
          <div className="mt-6 pt-5 border-t border-stone-100">
            <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-3.5 text-xs text-emerald-900">
              <div className="font-bold mb-1 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
                <span>Kredensial Pengujian (Demo):</span>
              </div>
              <p className="text-[11px] text-emerald-800">
                Username: <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-emerald-200">admin</code> &bull; Password: <code className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-emerald-200">adminpondok123</code>
              </p>
              <button
                type="button"
                onClick={handleUseDemo}
                className="mt-2.5 w-full py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold transition-colors"
              >
                Klik untuk Isi Otomatis
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
