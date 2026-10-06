import React, { useEffect } from 'react';
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
  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="toast-icon toast-icon-success" size={18} />,
    error: <AlertCircle className="toast-icon toast-icon-error" size={18} />,
    info: <Info className="toast-icon toast-icon-info" size={18} />,
  };

  return (
    <div className={`toast toast-${toast.type}`} role="alert">
      {icons[toast.type]}
      <span className="toast-message">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="toast-close"
        aria-label="Dismiss notification"
      >
        <X size={15} />
      </button>
    </div>
  );
};
