import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Toast as ToastType } from '@/types';

interface ToastContainerProps {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: { toast: ToastType; onRemove: (id: string) => void }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        setExiting(true);
        setTimeout(() => onRemove(toast.id), 300);
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onRemove]);

  const handleClose = () => {
    setExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const icons = {
    success: <CheckCircle size={20} className="text-[#10b981]" />,
    error: <AlertCircle size={20} className="text-[#ef4444]" />,
    info: <Info size={20} className="text-[#0e7490]" />,
  };

  const bgColors = {
    success: 'bg-white border-l-4 border-l-[#10b981]',
    error: 'bg-white border-l-4 border-l-[#ef4444]',
    info: 'bg-white border-l-4 border-l-[#0e7490]',
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[300px] max-w-[400px] ${bgColors[toast.type]} ${exiting ? 'animate-toastOut' : 'animate-toastIn'}`}
      role="alert"
    >
      {icons[toast.type]}
      <p className="flex-1 text-sm text-[#164e63] font-medium">{toast.message}</p>
      <button
        onClick={handleClose}
        className="p-1 rounded-full hover:bg-[#f0f9ff] transition-colors"
        aria-label="Close toast"
      >
        <X size={14} className="text-[#64748b]" />
      </button>
    </div>
  );
}

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[3000] flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}
