import { type LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  headline: string;
  body: string;
  className?: string;
}

export function FeatureCard({ icon: Icon, headline, body, className }: FeatureCardProps) {
  return (
    <div className={`marketing-card ${className ?? ''}`}>
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
        style={{ backgroundColor: '#FFF3E8' }}
      >
        <Icon className="w-6 h-6" style={{ color: '#F97316' }} />
      </div>
      <h3
        className="mb-3"
        style={{
          fontSize: 20,
          fontWeight: 600,
          lineHeight: 1.3,
          letterSpacing: '-0.01em',
          color: '#1A1A1A',
        }}
      >
        {headline}
      </h3>
      <p
        style={{
          fontSize: 16,
          lineHeight: 1.6,
          color: '#4A4A4A',
        }}
      >
        {body}
      </p>
    </div>
  );
}
