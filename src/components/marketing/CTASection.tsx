interface CTASectionProps {
  headline: string;
  subheadline: string;
  primaryLabel: string;
  primaryAction: () => void;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export function CTASection({
  headline,
  subheadline,
  primaryLabel,
  primaryAction,
  secondaryLabel,
  secondaryHref,
}: CTASectionProps) {
  return (
    <section
      className="marketing-section"
      style={{ backgroundColor: '#FFF3E8' }}
    >
      <div className="marketing-section-inner text-center">
        <h2
          className="font-serif mx-auto"
          style={{
            fontSize: 'clamp(28px, 5vw, 40px)',
            fontWeight: 300,
            lineHeight: 1.15,
            letterSpacing: '-0.01em',
            color: '#1A1A1A',
            maxWidth: 600,
            marginBottom: 16,
          }}
        >
          {headline}
        </h2>
        <p
          className="mx-auto"
          style={{
            fontSize: 'clamp(16px, 2.5vw, 20px)',
            lineHeight: 1.5,
            color: '#4A4A4A',
            maxWidth: 500,
            marginBottom: 32,
          }}
        >
          {subheadline}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={primaryAction}
            className="text-[15px] font-medium text-white rounded-lg transition-colors w-full sm:w-auto"
            style={{
              backgroundColor: '#F97316',
              padding: '14px 32px',
              fontSize: 16,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#EA580C')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#F97316')}
          >
            {primaryLabel}
          </button>
          {secondaryLabel && secondaryHref && (
            <a
              href={secondaryHref}
              className="text-[15px] font-medium rounded-lg transition-colors w-full sm:w-auto text-center"
              style={{
                color: '#1A1A1A',
                padding: '14px 32px',
                border: '1.5px solid #1A1A1A',
                fontSize: 16,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1A1A1A';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#1A1A1A';
              }}
            >
              {secondaryLabel}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
