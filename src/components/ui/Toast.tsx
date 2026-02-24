import { useState } from 'react';
import { X, CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';
import { useToastStore, type Toast as ToastType, type ToastType as ToastVariant } from '@/stores/toastStore';
import { cn } from '@/utils/cn';

const icons: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5" />,
  error: <XCircle className="w-5 h-5" />,
  info: <Info className="w-5 h-5" />,
  warning: <AlertTriangle className="w-5 h-5" />,
};

const variants: Record<ToastVariant, string> = {
  success: 'glass-medium border-green-200/50 dark:border-green-500/20 text-green-800 dark:text-green-200',
  error: 'glass-medium border-red-200/50 dark:border-red-500/20 text-red-800 dark:text-red-200',
  info: 'glass-medium border-blue-200/50 dark:border-blue-500/20 text-blue-800 dark:text-blue-200',
  warning: 'glass-medium border-yellow-200/50 dark:border-yellow-500/20 text-yellow-800 dark:text-yellow-200',
};

const iconColors: Record<ToastVariant, string> = {
  success: 'text-green-500 dark:text-green-400',
  error: 'text-red-500 dark:text-red-400',
  info: 'text-blue-500 dark:text-blue-400',
  warning: 'text-yellow-500 dark:text-yellow-400',
};

interface ToastItemProps {
  toast: ToastType;
  onClose: () => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const [isLeaving, setIsLeaving] = useState(false);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(onClose, 200);
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg transition-all duration-200',
        variants[toast.type],
        isLeaving ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'
      )}
    >
      <span className={iconColors[toast.type]}>{icons[toast.type]}</span>
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={handleClose}
        className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onClose={() => removeToast(toast.id)} />
        </div>
      ))}
    </div>
  );
}
