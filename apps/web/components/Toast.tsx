'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Info, AlertCircle } from 'lucide-react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface ToastNotificationProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastNotification({ toast, onRemove }: ToastNotificationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-500" />
  };

  const backgrounds = {
    success: 'bg-green-900/20 border-green-500',
    error: 'bg-red-900/20 border-red-500',
    info: 'bg-blue-900/20 border-blue-500',
    warning: 'bg-yellow-900/20 border-yellow-500'
  };

  return (
    <div className={`flex items-center gap-3 p-4 rounded-lg border ${backgrounds[toast.type]} animate-fade-in`}>
      {icons[toast.type]}
      <p className="text-white">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="ml-auto text-gray-400 hover:text-white"
      >
        ×
      </button>
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: Toast['type'] = 'info') => {
    const newToast: Toast = {
      id: Date.now().toString(),
      message,
      type
    };
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const ToastContainer = () => (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <ToastNotification
          key={toast.id}
          toast={toast}
          onRemove={removeToast}
        />
      ))}
    </div>
  );

  return { addToast, ToastContainer };
}
