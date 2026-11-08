import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Ya, Lanjutkan',
  cancelLabel = 'Batal',
  isDanger = true,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isDanger ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg leading-snug">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed mb-6">{message}</p>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-stone-300 text-slate-700 font-semibold text-xs hover:bg-stone-100 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs text-white shadow-xs transition-colors ${
              isDanger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
