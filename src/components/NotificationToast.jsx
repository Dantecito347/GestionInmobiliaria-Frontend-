import React, { useEffect } from 'react';

export const NotificationToast = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  const bgColors = {
    success: 'bg-emerald-600 border-emerald-500',
    error: 'bg-rose-600 border-rose-500',
    warning: 'bg-amber-600 border-amber-500',
    info: 'bg-blue-600 border-blue-500',
  };

  const colorClass = bgColors[toast.type] || bgColors.info;

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-fade-in">
      <div className={`${colorClass} text-white px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 max-w-md transition-all`}>
        <span className="text-lg">
          {toast.type === 'success' && '✅'}
          {toast.type === 'error' && '⚠️'}
          {toast.type === 'warning' && '🔔'}
          {toast.type === 'info' && 'ℹ️'}
        </span>
        <p className="text-sm font-medium leading-snug">{toast.message}</p>
        <button
          onClick={onClose}
          className="ml-auto text-white/70 hover:text-white text-sm font-bold p-1 rounded transition cursor-pointer"
        >
          ✕
        </button>
      </div>
    </div>
  );
};