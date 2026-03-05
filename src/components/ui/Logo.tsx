import { cn } from '@/utils/cn';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { icon: 'h-8 w-8', logo: 'h-8', text: 'text-lg' },
  md: { icon: 'h-10 w-10', logo: 'h-10', text: 'text-xl' },
  lg: { icon: 'h-12 w-12', logo: 'h-12', text: 'text-2xl' },
};

export function Logo({ size = 'md', showText = true, className }: LogoProps) {
  const s = sizeMap[size];

  if (showText) {
    return (
      <div className={cn('flex items-center', className)}>
        <img
          src="/logo.svg"
          alt="Qrius Codes"
          className={cn(s.logo, 'w-auto dark:hidden')}
        />
        <img
          src="/logo-dark.svg"
          alt="Qrius Codes"
          className={cn(s.logo, 'w-auto hidden dark:block')}
        />
      </div>
    );
  }

  return (
    <div className={cn('flex items-center', className)}>
      <img
        src="/icon.svg"
        alt="Qrius Codes"
        className={cn(s.icon, 'flex-shrink-0')}
      />
    </div>
  );
}
