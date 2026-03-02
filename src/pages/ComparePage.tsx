import { useState, useCallback } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { MarketingLayout } from '@/components/marketing/MarketingLayout';
import { MarketingSection } from '@/components/marketing/MarketingSection';
import { CTASection } from '@/components/marketing/CTASection';
import { AuthModal } from '@/components/auth/AuthModal';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { isRootDomain, getAppUrl } from '@/lib/domain';

const competitors = [
  { name: 'Bitly', summary: 'Great link shortener. Limited QR tool.', href: '/compare/bitly' as const },
  { name: 'QR Code Generator', summary: 'Big name. Bigger complaints.', href: '/compare/qr-code-generator' as const },
  { name: 'Uniqode', summary: 'Enterprise-grade. Enterprise-priced.', href: '/compare/uniqode' as const },
  { name: 'QR Tiger', summary: 'Feature-packed. Interface-heavy.', href: '/compare/qr-tiger' as const },
  { name: 'Flowcode', summary: 'Fortune 500 tool. Fortune 500 price tag.', href: '/compare/flowcode' as const },
];

export default function ComparePage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState<'signin' | 'signup'>('signup');
  const navigate = useNavigate();
  const containerRef = useScrollReveal<HTMLDivElement>();

  const openSignUp = useCallback(() => { setAuthView('signup'); setShowAuthModal(true); }, []);
  const handleAuthSuccess = useCallback(() => {
    setShowAuthModal(false);
    if (isRootDomain) { window.location.href = getAppUrl('/dashboard'); return; }
    navigate({ to: '/dashboard' });
  }, [navigate]);

  return (
    <MarketingLayout onSignUp={openSignUp}>
      <div ref={containerRef}>
        <MarketingSection bg="snow" className="!pt-12 !pb-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1
              className="font-serif animate-on-scroll"
              style={{ fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 300, lineHeight: 1.1, letterSpacing: '-0.02em', color: '#1A1A1A', marginBottom: 20 }}
            >
              How Qrius Codes compares.
            </h1>
            <p className="animate-on-scroll stagger-1" style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', lineHeight: 1.5, color: '#4A4A4A' }}>
              We believe in honest comparisons. Here's how we stack up against the alternatives — including where they might be a better fit.
            </p>
          </div>
        </MarketingSection>

        <MarketingSection bg="snow" className="!pt-4">
          <div className="max-w-2xl mx-auto space-y-4">
            {competitors.map(({ name, summary, href }, i) => (
              <Link
                key={name}
                to={href}
                className={`marketing-card flex items-center justify-between gap-4 group hover:shadow-lg transition-shadow animate-on-scroll stagger-${(i % 3) + 1}`}
                style={{ textDecoration: 'none' }}
              >
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1A1A1A', marginBottom: 4 }}>
                    Qrius Codes vs {name}
                  </h2>
                  <p style={{ fontSize: 15, color: '#4A4A4A' }}>{summary}</p>
                </div>
                <ArrowRight className="w-5 h-5 flex-shrink-0 group-hover:translate-x-1 transition-transform" style={{ color: '#F97316' }} />
              </Link>
            ))}
          </div>
        </MarketingSection>

        <CTASection
          headline="Or skip the comparisons and just try it."
          subheadline="15 free dynamic QR codes. No credit card, no time limit."
          primaryLabel="Start free"
          primaryAction={openSignUp}
        />
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} defaultView={authView} onAuthSuccess={handleAuthSuccess} />
    </MarketingLayout>
  );
}
