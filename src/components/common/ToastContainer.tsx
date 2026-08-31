import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertTriangle, Info, AlertOctagon, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(t => {
        let icon = <Info className="w-4 h-4 text-sky-600" />;
        let border = 'border-slate-200 bg-white';

        if (t.type === 'success') {
          icon = <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
          border = 'border-emerald-200 bg-white';
        } else if (t.type === 'error') {
          icon = <AlertOctagon className="w-4 h-4 text-rose-600" />;
          border = 'border-rose-200 bg-white';
        } else if (t.type === 'warning') {
          icon = <AlertTriangle className="w-4 h-4 text-amber-600" />;
          border = 'border-amber-200 bg-white';
        }

        return (
          <div
            key={t.id}
            className={`pointer-events-auto p-3.5 rounded-xl border shadow-lg flex items-start gap-3 text-xs transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${border}`}
          >
            <div className="shrink-0 mt-0.5">{icon}</div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-slate-900">{t.title}</div>
              <div className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">{t.message}</div>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-slate-600 p-1 shrink-0 -mr-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
