import { Download } from 'lucide-react';
import { cn } from '../../utils/cn';

interface FloatingActionProps {
  onClick: () => void;
  className?: string;
}

export function FloatingAction({ onClick, className }: FloatingActionProps) {
  return (
    <button
      onClick={onClick}
      aria-label="Download QR code"
      className={cn(
        'fixed bottom-6 right-6 z-40 lg:hidden',
        'flex items-center justify-center',
        'w-14 h-14 rounded-full',
        'bg-indigo-600 text-white shadow-lg',
        'hover:bg-indigo-700 active:bg-indigo-800',
        'transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
        className
      )}
    >
      <Download className="w-6 h-6" />
    </button>
  );
}
