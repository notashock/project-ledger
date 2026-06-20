import React, { createContext, useContext, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    warning: (msg) => addToast(msg, 'warning'),
    info: (msg) => addToast(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Overlay Container */}
      <div className="fixed top-6 right-6 z-[300] flex flex-col gap-4 max-w-sm w-full pointer-events-none font-body-md">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 border-2 border-[#000000] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between gap-4 transition-all duration-300 animate-slide-in rounded ${
              t.type === 'success' ? 'bg-[#D1E7DD] text-[#0F5132]' :
              t.type === 'error' ? 'bg-[#F8D7DA] text-[#842029]' :
              t.type === 'warning' ? 'bg-[#FFF3CD] text-[#664D03]' :
              'bg-surface-variant text-on-surface'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined shrink-0 text-[20px]">
                {t.type === 'success' && 'check_circle'}
                {t.type === 'error' && 'error'}
                {t.type === 'warning' && 'warning'}
                {t.type === 'info' && 'info'}
              </span>
              <span className="font-label-bold text-xs">{t.message}</span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="hover:opacity-75 transition-opacity pointer-events-auto cursor-pointer flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
