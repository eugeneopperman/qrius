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
        'bg-orange-500 text-white',
        'transition-all duration-200',
        'hover:bg-orange-600 active:scale-95',
        'focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2',
        'shadow-lg shadow-orange-500/30',
        className
      )}
    >
      <Download className="w-5 h-5" />
    </button>
  );
}
