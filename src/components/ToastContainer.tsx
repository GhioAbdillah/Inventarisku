import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useInventory();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
        let borderClass = 'border-emerald-200 bg-white';

        if (toast.type === 'error') {
          icon = <XCircle className="w-5 h-5 text-red-600 shrink-0" />;
          borderClass = 'border-red-200 bg-white';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />;
          borderClass = 'border-amber-200 bg-white';
        } else if (toast.type === 'info') {
          icon = <Info className="w-5 h-5 text-blue-600 shrink-0" />;
          borderClass = 'border-blue-200 bg-white';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl border shadow-lg flex items-start gap-3 transition-all animate-in slide-in-from-bottom-3 duration-200 ${borderClass}`}
          >
            {icon}
            <div className="flex-1 text-xs">
              <div className="font-bold text-neutral-900">{toast.title}</div>
              {toast.message && (
                <div className="text-neutral-600 mt-0.5 leading-snug">{toast.message}</div>
              )}
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="p-1 text-neutral-400 hover:text-neutral-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
