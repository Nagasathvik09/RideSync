import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  isOpen,
  onClose,
  duration = 3500,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const iconMap = {
    success: <CheckCircle2 className="w-4 h-4 text-[#22B07D] shrink-0" strokeWidth={2.2} />,
    error: <AlertCircle className="w-4 h-4 text-[#E5484D] shrink-0" strokeWidth={2.2} />,
    info: <Info className="w-4 h-4 text-[#2B8CEB] shrink-0" strokeWidth={2.2} />,
  };

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] max-w-sm w-[90%] animate-in fade-in slide-in-from-top-4 duration-200">
      <div className="bg-white border border-[#E3ECF5] text-[#0F1B2D] px-4 py-3 rounded-2xl shadow-soft flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {iconMap[type]}
          <span className="text-xs font-semibold truncate">{message}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-[#5B6B80] hover:text-[#0F1B2D] p-1 rounded-lg transition-colors"
          aria-label="Close notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
