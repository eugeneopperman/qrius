import { cn } from '@/utils/cn';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { icon: 'h-8 w-8', text: 'text-lg' },
  md: { icon: 'h-10 w-10', text: 'text-xl' },
  lg: { icon: 'h-12 w-12', text: 'text-2xl' },
};

export function Logo({ size = 'md', showText = true, className }: LogoProps) {
  const s = sizeMap[size];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <img
        src="/icon.svg"
        alt="Qrius Codes"
        className={cn(s.icon, 'flex-shrink-0')}
      />
      {showText && (
        <span className={cn(s.text, 'font-bold text-gray-900 dark:text-white')}>
          Qrius Codes
        </span>
      )}
    </div>
  );
}
