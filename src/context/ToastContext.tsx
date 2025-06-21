import React, { createContext, useState, useContext, type ReactNode, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';
interface ToastMessage { id: number; message: string; type: ToastType; }
interface ToastContextType { addToast: (message: string, type?: ToastType) => void; }

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(toast => toast.id !== id)), 4000);
  }, []);

  const icons = { success: CheckCircle, error: XCircle, warning: AlertTriangle, info: Info };
  const colors = {
    success: 'bg-green-500/20 border-green-500/30 text-green-300',
    error: 'bg-red-500/20 border-red-500/30 text-red-300',
    warning: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300',
    info: 'bg-blue-500/20 border-blue-500/30 text-blue-300',
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2">
        {toasts.map(({ id, message, type }) => {
          const Icon = icons[type];
          return (
            <div key={id} className={`flex items-center gap-3 px-6 py-3 rounded-full shadow-lg border animate-fade-in-up ${colors[type]}`}>
              <Icon className="w-5 h-5" />
              <span>{message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context.addToast;
};