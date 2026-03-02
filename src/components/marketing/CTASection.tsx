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
    <section className="marketing-section" style={{ backgroundColor: '#FFF3E8' }}>
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
            className="marketing-btn-primary w-full sm:w-auto"
            style={{ padding: '14px 32px' }}
          >
            {primaryLabel}
          </button>
          {secondaryLabel && secondaryHref && (
            <a
              href={secondaryHref}
              className="marketing-btn-outline w-full sm:w-auto text-center"
              style={{ padding: '14px 32px' }}
            >
              {secondaryLabel}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
