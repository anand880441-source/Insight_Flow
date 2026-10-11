import { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, type = 'info', duration = 3500) => {
    const id = ++idCounter;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const value = {
    success: (m) => push(m, 'success'),
    error:   (m) => push(m, 'error', 5000),
    info:    (m) => push(m, 'info'),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-80">
        {toasts.map(t => (
          <div
            key={t.id}
            onClick={() => dismiss(t.id)}
            role="alert"
            className={`cursor-pointer rounded-xl backdrop-blur-xl shadow-elevated border px-4 py-3 text-sm transition-all duration-200 flex items-center gap-3 animate-slide-up ${
              t.type === 'success'
                ? 'bg-surface-850/95 border-emerald-500/30 text-emerald-200 shadow-glow-sm' :
              t.type === 'error'
                ? 'bg-surface-850/95 border-rose-500/30 text-rose-200' :
                  'bg-surface-850/95 border-white/10 text-slate-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                t.type === 'success' ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' :
                t.type === 'error' ? 'bg-rose-400 shadow-[0_0_8px_#fb7185]' :
                'bg-brand-400 shadow-[0_0_8px_#818cf8]'
              }`}
            />
            <span className="flex-1 font-medium">{t.message}</span>
            <span className="text-xs text-slate-500 hover:text-slate-300">✕</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be inside ToastProvider');
  return ctx;
}
