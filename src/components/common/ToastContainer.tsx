import React from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useCatalog();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let bgStyle = 'bg-slate-900 border-slate-700 text-white';
        let icon = <Info className="w-5 h-5 text-sky-400 shrink-0" />;

        if (toast.type === 'success') {
          bgStyle = 'bg-emerald-900/95 border-emerald-600/50 text-white shadow-emerald-950/20';
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
        } else if (toast.type === 'error') {
          bgStyle = 'bg-rose-950/95 border-rose-700/50 text-white shadow-rose-950/20';
          icon = <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-top-3 ${bgStyle}`}
          >
            {icon}
            <div className="flex-1 text-sm">
              {toast.title && <div className="font-semibold mb-0.5">{toast.title}</div>}
              <div className="text-slate-200 text-xs leading-relaxed">{toast.message}</div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 transition-colors"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
