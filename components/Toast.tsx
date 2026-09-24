'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md text-sm transition-all animate-slide-in ${
            toast.type === 'success'
              ? 'bg-[#141A16]/95 border-emerald-500/40 text-emerald-300'
              : toast.type === 'error'
              ? 'bg-[#201314]/95 border-red-500/40 text-red-300'
              : 'bg-[#141A22]/95 border-blue-500/40 text-blue-300'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />}
            {toast.type === 'info' && <Info className="w-4 h-4 flex-shrink-0 text-blue-400" />}
            <span className="truncate text-xs font-medium text-white">{toast.message}</span>
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="p-1 text-zinc-400 hover:text-white rounded"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
