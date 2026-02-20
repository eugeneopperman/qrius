import { Link } from '@tanstack/react-router';
import { Sparkles, Clock } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ProBadgeProps {
  plan?: 'pro' | 'business';
  size?: 'sm' | 'md';
}

export function ProBadge({ plan = 'pro', size = 'sm' }: ProBadgeProps) {
  return (
    <Link
      to="/settings"
      search={{ tab: 'billing' }}
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors',
        size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'
      )}
    >
      <Sparkles className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
      {plan === 'pro' ? 'Pro' : 'Business'}
    </Link>
  );
}

interface ComingSoonBadgeProps {
  size?: 'sm' | 'md';
}

export function ComingSoonBadge({ size = 'sm' }: ComingSoonBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
        size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'
      )}
    >
      <Clock className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
      Coming soon
    </span>
  );
}
