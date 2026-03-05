import { useState, useCallback } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { AlertTriangle, ChevronRight, Star } from 'lucide-react';
import { MarketingLayout } from './MarketingLayout';
import { MarketingSection } from './MarketingSection';
import { PlanComparisonTable } from './PlanComparisonTable';
import { CTASection } from './CTASection';
import { AuthModal } from '@/components/auth/AuthModal';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { isRootDomain, getAppUrl } from '@/lib/domain';

// ─── Types ──────────────────────────────────────────────────────────

interface WinPoint {
  title: string;
  description: string;
}

interface ComparisonColumn {
  key: string;
  label: string;
  highlight?: boolean;
}

interface ComparisonRow {
  feature: string;
  values: Record<string, string | boolean>;
}

export interface ComparisonPageData {
  competitor: string;
  hero: {
    headline: string;
    subheadline: string;
  };
  verdict: {
    body: string[];
  };
  table: {
    columns: ComparisonColumn[];
    rows: ComparisonRow[];
  };
  wins: {
    headline: string;
    items: WinPoint[];
  };
  concessions: {
    headline: string;
    items: WinPoint[];
  };
  switching?: {
    headline: string;
    body: string[];
  };
  /** Optional callout — trust rating, price shock, etc. */
  callout?: {
    type: 'rating' | 'price' | 'warning';
    text: string;
  };
  cta: {
    headline: string;
    primaryLabel?: string;
    secondaryLabel?: string;
    secondaryHref?: string;
  };
}

// ─── Callout sub-component ──────────────────────────────────────────

function Callout({ type, text }: { type: 'rating' | 'price' | 'warning'; text: string }) {
  const config = {
    rating: { bg: '#FEF2F2', border: '#FCA5A5', color: '#991B1B', Icon: Star },
    price: { bg: '#FFF3E8', border: '#FDBA74', color: '#9A3412', Icon: AlertTriangle },
    warning: { bg: '#FEF9C3', border: '#FDE047', color: '#854D0E', Icon: AlertTriangle },
  }[type];

  return (
    <div
      className="flex items-start gap-3 rounded-xl p-4 mb-8 animate-on-scroll"
      style={{ backgroundColor: config.bg, border: `1px solid ${config.border}` }}
    >
      <config.Icon className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: config.color }} />
      <p style={{ fontSize: 15, lineHeight: 1.5, color: config.color }}>{text}</p>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────

export function ComparisonPageTemplate({ data }: { data: ComparisonPageData }) {
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

        {/* Breadcrumb */}
        <div className="mx-auto px-4 sm:px-6 lg:px-8 pt-6" style={{ maxWidth: 1200 }}>
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm" style={{ color: '#9CA3AF' }}>
            <Link to="/" className="transition-colors hover:text-[#F97316]" style={{ color: '#9CA3AF' }}>Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/compare" className="transition-colors hover:text-[#F97316]" style={{ color: '#9CA3AF' }}>Compare</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span style={{ color: '#1A1A1A', fontWeight: 500 }}>vs {data.competitor}</span>
          </nav>
        </div>

        {/* Hero */}
        <MarketingSection bg="snow" className="!pt-6 !pb-12">
          <div className="max-w-3xl">
            <p className="marketing-overline mb-4 animate-on-scroll">Comparison</p>
            <h1
              className="font-serif animate-on-scroll stagger-1"
              style={{ fontSize: 'clamp(36px, 6vw, 52px)', fontWeight: 300, lineHeight: 1.1, letterSpacing: '-0.02em', color: '#1A1A1A', marginBottom: 20 }}
            >
              {data.hero.headline}
            </h1>
            <p className="animate-on-scroll stagger-2" style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', lineHeight: 1.5, color: '#4A4A4A', maxWidth: 600 }}>
              {data.hero.subheadline}
            </p>
          </div>
        </MarketingSection>

        {/* Quick verdict */}
        <MarketingSection bg="cloud" overline="The short version" headline="Quick verdict.">
          {data.callout && <Callout type={data.callout.type} text={data.callout.text} />}
          {data.verdict.body.map((p, i) => (
            <p key={i} className={`animate-on-scroll stagger-${i + 1}`} style={{ fontSize: 17, lineHeight: 1.7, color: '#4A4A4A', marginBottom: 16, maxWidth: 700 }}>
              {p}
            </p>
          ))}
        </MarketingSection>

        {/* Side-by-side table */}
        <MarketingSection bg="snow" overline="Side by side" headline="Feature comparison.">
          <div className="animate-on-scroll">
            <PlanComparisonTable columns={data.table.columns} rows={data.table.rows} />
          </div>
        </MarketingSection>

        {/* Where Qrius wins */}
        <MarketingSection bg="cloud" overline="Where we win" headline={data.wins.headline}>
          <div className="space-y-6">
            {data.wins.items.map(({ title, description }, i) => (
              <div key={title} className={`animate-on-scroll stagger-${(i % 3) + 1}`}>
                <h3 style={{ fontSize: 17, fontWeight: 600, color: '#1A1A1A', marginBottom: 6 }}>{title}</h3>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: '#4A4A4A', maxWidth: 700 }}>{description}</p>
              </div>
            ))}
          </div>
        </MarketingSection>

        {/* Where competitor might be better */}
        <MarketingSection bg="snow" overline="Being honest" headline={data.concessions.headline}>
          <div className="space-y-6">
            {data.concessions.items.map(({ title, description }, i) => (
              <div key={title} className={`flex items-start gap-4 animate-on-scroll stagger-${(i % 3) + 1}`}>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2.5" style={{ backgroundColor: '#9CA3AF' }} />
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: '#4A4A4A', marginBottom: 4 }}>{title}</h3>
                  <p style={{ fontSize: 15, lineHeight: 1.6, color: '#4A4A4A', maxWidth: 650 }}>{description}</p>
                </div>
              </div>
            ))}
          </div>
        </MarketingSection>

        {/* Switching guide (optional) */}
        {data.switching && (
          <MarketingSection bg="cloud" overline="Making the switch" headline={data.switching.headline}>
            {data.switching.body.map((p, i) => (
              <p key={i} className={`animate-on-scroll stagger-${i + 1}`} style={{ fontSize: 16, lineHeight: 1.7, color: '#4A4A4A', marginBottom: 14, maxWidth: 700 }}>
                {p}
              </p>
            ))}
          </MarketingSection>
        )}

        {/* CTA */}
        <CTASection
          headline={data.cta.headline}
          subheadline="Start building with 5 free dynamic QR codes. No credit card, no time limit."
          primaryLabel={data.cta.primaryLabel ?? 'Try Qrius Codes free'}
          primaryAction={openSignUp}
          secondaryLabel={data.cta.secondaryLabel ?? 'Compare all plans'}
          secondaryHref={data.cta.secondaryHref ?? '/pricing'}
        />
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} defaultView={authView} onAuthSuccess={handleAuthSuccess} />
    </MarketingLayout>
  );
}
