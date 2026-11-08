import React from 'react';

export interface RetroToast {
  id: string;
  title: string;
  message: string;
  type?: 'success' | 'warning' | 'danger' | 'info' | 'money';
  amount?: number;
  durationMs?: number;
}

interface RetroToastContainerProps {
  toasts: RetroToast[];
  onDismiss: (id: string) => void;
}

export const RetroToastContainer: React.FC<RetroToastContainerProps> = ({ toasts, onDismiss }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-12 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const borderClass =
          toast.type === 'danger'
            ? 'border-red-700 bg-red-950/95 text-red-100 shadow-[2px_2px_0px_#7f1d1d]'
            : toast.type === 'warning'
            ? 'border-amber-600 bg-amber-950/95 text-amber-100 shadow-[2px_2px_0px_#78350f]'
            : toast.type === 'money'
            ? 'border-emerald-500 bg-emerald-950/95 text-emerald-100 shadow-[2px_2px_0px_#065f46]'
            : toast.type === 'success'
            ? 'border-emerald-600 bg-emerald-950/95 text-emerald-100 shadow-[2px_2px_0px_#064e3b]'
            : 'border-slate-500 bg-slate-900/95 text-slate-100 shadow-[2px_2px_0px_#334155]';

        const badgeIcon =
          toast.type === 'danger'
            ? '🛑'
            : toast.type === 'warning'
            ? '⚠️'
            : toast.type === 'money'
            ? '💵'
            : toast.type === 'success'
            ? '✅'
            : 'ℹ️';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto border-2 p-3 font-mono text-xs rounded-none transition-all duration-200 animate-in slide-in-from-right-4 ${borderClass}`}
          >
            <div className="flex items-center justify-between border-b border-white/20 pb-1 mb-1.5">
              <span className="font-bold tracking-wide flex items-center gap-1.5 uppercase">
                <span>{badgeIcon}</span>
                <span>{toast.title}</span>
              </span>
              <button
                onClick={() => onDismiss(toast.id)}
                className="text-white/60 hover:text-white px-1.5 py-0.5 bg-black/40 hover:bg-black/70 border border-white/20 text-[10px] leading-none"
                title="Cerrar notificación"
              >
                ✕
              </button>
            </div>
            <p className="text-white/90 leading-relaxed break-words">{toast.message}</p>
            {toast.amount !== undefined && (
              <div className="mt-1 text-right font-black text-sm tracking-wider text-emerald-300">
                {toast.amount >= 0 ? '+' : ''}L {toast.amount.toLocaleString('es-HN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
