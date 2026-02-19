import { QrCode } from 'lucide-react';
import { cn } from '@/utils/cn';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { container: 'w-8 h-8', icon: 'w-5 h-5', text: 'text-lg' },
  md: { container: 'w-10 h-10', icon: 'w-6 h-6', text: 'text-xl' },
  lg: { container: 'w-12 h-12', icon: 'w-7 h-7', text: 'text-2xl' },
};

export function Logo({ size = 'md', showText = true, className }: LogoProps) {
  const s = sizeMap[size];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          s.container,
          'bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center shadow-sm'
        )}
      >
        <QrCode className={cn(s.icon, 'text-white')} aria-hidden="true" />
      </div>
      {showText && (
        <span className={cn(s.text, 'font-bold text-gray-900 dark:text-white')}>
          Qrius
        </span>
      )}
    </div>
  );
}
