import { type ReactNode } from 'react';
import { cn } from '@/utils/cn';

type BgVariant = 'snow' | 'cloud' | 'ink' | 'ember-light';

const bgMap: Record<BgVariant, string> = {
  snow: 'marketing-bg-snow',
  cloud: 'marketing-bg-cloud',
  ink: 'marketing-bg-ink',
  'ember-light': 'marketing-bg-ember-light',
};

interface MarketingSectionProps {
  id?: string;
  bg?: BgVariant;
  overline?: string;
  headline?: ReactNode;
  subheadline?: string;
  children: ReactNode;
  className?: string;
}

export function MarketingSection({
  id,
  bg = 'snow',
  overline,
  headline,
  subheadline,
  children,
  className,
}: MarketingSectionProps) {
  const isDark = bg === 'ink';

  return (
    <section id={id} className={cn('marketing-section', bgMap[bg], className)}>
      <div className="marketing-section-inner">
        {overline && (
          <p
            className="marketing-overline mb-4"
            style={isDark ? { color: '#F97316' } : undefined}
          >
            {overline}
          </p>
        )}
        {headline && (
          <h2
            className="font-serif max-w-3xl"
            style={{
              fontSize: 'clamp(28px, 5vw, 40px)',
              fontWeight: 300,
              lineHeight: 1.15,
              letterSpacing: '-0.01em',
              color: isDark ? '#ffffff' : '#1A1A1A',
              marginBottom: subheadline ? 16 : 48,
            }}
          >
            {headline}
          </h2>
        )}
        {subheadline && (
          <p
            className="max-w-xl"
            style={{
              fontSize: 'clamp(16px, 2.5vw, 20px)',
              lineHeight: 1.5,
              color: isDark ? 'rgba(255,255,255,0.7)' : '#4A4A4A',
              marginBottom: 48,
            }}
          >
            {subheadline}
          </p>
        )}
        {children}
      </div>
    </section>
  );
}
