import { type LucideIcon } from 'lucide-react';

interface FeatureRowProps {
  icon: LucideIcon;
  headline: string;
  description: string;
  bullets: string[];
  /** Optional image URL — replaces the icon placeholder */
  image?: string;
  /** Whether to show the timeline connector below this row */
  isLast?: boolean;
  className?: string;
}

export function FeatureRow({
  icon: Icon,
  headline,
  description,
  bullets,
  image,
  isLast,
  className,
}: FeatureRowProps) {
  return (
    <div className={`flex gap-6 lg:gap-12 ${className ?? ''}`}>
      {/* Timeline — dot + line */}
      <div className="hidden sm:flex flex-col items-center flex-shrink-0" style={{ width: 24 }}>
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: '#F97316', marginTop: 8 }}
        />
        {!isLast && (
          <div
            className="flex-1"
            style={{ width: 2, backgroundColor: '#E8E6E3', marginTop: 8 }}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-12 lg:pb-16">
        <div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-16">
          {/* Text side */}
          <div className="flex-1">
            <h3
              className="font-serif mb-3"
              style={{
                fontSize: 'clamp(24px, 3.5vw, 32px)',
                fontWeight: 300,
                lineHeight: 1.2,
                letterSpacing: '-0.01em',
                color: '#1A1A1A',
              }}
            >
              {headline}
            </h3>
            <p
              className="mb-5"
              style={{
                fontSize: 17,
                lineHeight: 1.6,
                color: '#4A4A4A',
                maxWidth: 480,
              }}
            >
              {description}
            </p>
            <ul className="space-y-2.5">
              {bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="flex items-start gap-3"
                  style={{ fontSize: 15, lineHeight: 1.5, color: '#4A4A4A' }}
                >
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2"
                    style={{ backgroundColor: '#1A1A1A' }}
                  />
                  {bullet}
                </li>
              ))}
            </ul>
          </div>

          {/* Visual */}
          <div className="flex-1 flex justify-center lg:justify-end">
            {image ? (
              <img
                src={image}
                alt={headline}
                className="w-full max-w-sm aspect-[4/3] rounded-xl object-cover"
                style={{
                  border: '1px solid #E8E6E3',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
                }}
                loading="lazy"
              />
            ) : (
              <div
                className="w-full max-w-sm aspect-[4/3] rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #F5F4F2 0%, #ffffff 100%)',
                  border: '1px solid #E8E6E3',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
                }}
              >
                <Icon className="w-12 h-12" style={{ color: '#F97316', opacity: 0.25 }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
