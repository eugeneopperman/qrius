import { useState, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { type LucideIcon } from 'lucide-react';
import { MarketingLayout } from './MarketingLayout';
import { MarketingSection } from './MarketingSection';
import { CTASection } from './CTASection';
import { AuthModal } from '@/components/auth/AuthModal';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { isRootDomain, getAppUrl } from '@/lib/domain';

// ─── Types ──────────────────────────────────────────────────────────

interface UseCaseCard {
  title: string;
  description: string;
  context?: string;
  icon?: LucideIcon;
}

interface Benefit {
  title: string;
  description: string;
}

interface ScenarioItem {
  label: string;
  text: string;
}

type CardLayout = 'grid-2' | 'grid-3' | 'stack' | 'alternating';

export interface UseCasePageData {
  hero: {
    headline: string;
    subheadline: string;
    image?: string;
  };
  problem?: {
    headline: string;
    body: string | string[];
  };
  useCases: {
    headline: string;
    items: UseCaseCard[];
    layout?: CardLayout;
  };
  benefits: {
    headline: string;
    items: Benefit[];
  };
  scenario?: {
    headline: string;
    items: ScenarioItem[];
  };
  cta: {
    headline: string;
    subheadline?: string;
    secondaryLabel?: string;
    secondaryHref?: string;
  };
}

// ─── Sub-components ─────────────────────────────────────────────────

function UseCaseCardsGrid2({ items }: { items: UseCaseCard[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {items.map(({ icon: Icon, title, description, context }, i) => (
        <div key={title} className={`marketing-card animate-on-scroll stagger-${(i % 2) + 1}`}>
          {Icon && (
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#FFF3E8' }}>
              <Icon className="w-5 h-5" style={{ color: '#F97316' }} />
            </div>
          )}
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1A1A1A', marginBottom: 6 }}>{title}</h3>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: '#4A4A4A', marginBottom: context ? 10 : 0 }}>{description}</p>
          {context && <p style={{ fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' }}>{context}</p>}
        </div>
      ))}
    </div>
  );
}

function UseCaseCardsGrid3({ items }: { items: UseCaseCard[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
      {items.map(({ icon: Icon, title, description, context }, i) => (
        <div key={title} className={`marketing-card text-center animate-on-scroll stagger-${(i % 3) + 1}`}>
          {Icon && (
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#FFF3E8' }}>
              <Icon className="w-6 h-6" style={{ color: '#F97316' }} />
            </div>
          )}
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1A1A1A', marginBottom: 6 }}>{title}</h3>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: '#4A4A4A', marginBottom: context ? 10 : 0 }}>{description}</p>
          {context && <p style={{ fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' }}>{context}</p>}
        </div>
      ))}
    </div>
  );
}

function UseCaseCardsStack({ items }: { items: UseCaseCard[] }) {
  return (
    <div className="space-y-4">
      {items.map(({ icon: Icon, title, description, context }, i) => (
        <div
          key={title}
          className={`marketing-card flex items-start gap-5 animate-on-scroll stagger-${(i % 3) + 1}`}
        >
          {Icon && (
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FFF3E8' }}>
              <Icon className="w-6 h-6" style={{ color: '#F97316' }} />
            </div>
          )}
          <div className="flex-1">
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1A1A1A', marginBottom: 4 }}>{title}</h3>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: '#4A4A4A', marginBottom: context ? 8 : 0 }}>{description}</p>
            {context && <p style={{ fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' }}>{context}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

function UseCaseCardsAlternating({ items }: { items: UseCaseCard[] }) {
  return (
    <div className="space-y-8">
      {items.map(({ icon: Icon, title, description, context }, i) => (
        <div
          key={title}
          className={`flex flex-col sm:flex-row items-start gap-6 ${i % 2 === 1 ? 'sm:flex-row-reverse' : ''} animate-on-scroll stagger-${(i % 3) + 1}`}
        >
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              {Icon && (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FFF3E8' }}>
                  <Icon className="w-4 h-4" style={{ color: '#F97316' }} />
                </div>
              )}
              <h3 style={{ fontSize: 20, fontWeight: 600, color: '#1A1A1A' }}>{title}</h3>
            </div>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: '#4A4A4A', marginBottom: context ? 10 : 0 }}>{description}</p>
            {context && <p style={{ fontSize: 14, color: '#9CA3AF', fontStyle: 'italic' }}>{context}</p>}
          </div>
          <div
            className="w-full sm:w-48 h-32 rounded-xl flex-shrink-0"
            style={{
              background: `linear-gradient(${135 + i * 30}deg, #F5F4F2 0%, #ffffff 100%)`,
              border: '1px solid #E8E6E3',
            }}
          />
        </div>
      ))}
    </div>
  );
}

const layoutMap: Record<CardLayout, React.ComponentType<{ items: UseCaseCard[] }>> = {
  'grid-2': UseCaseCardsGrid2,
  'grid-3': UseCaseCardsGrid3,
  'stack': UseCaseCardsStack,
  'alternating': UseCaseCardsAlternating,
};

// ─── Main component ─────────────────────────────────────────────────

export function UseCasePageTemplate({ data }: { data: UseCasePageData }) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState<'signin' | 'signup'>('signup');
  const navigate = useNavigate();
  const containerRef = useScrollReveal<HTMLDivElement>();

  const openSignIn = useCallback(() => { setAuthView('signin'); setShowAuthModal(true); }, []);
  const openSignUp = useCallback(() => { setAuthView('signup'); setShowAuthModal(true); }, []);
  const handleAuthSuccess = useCallback(() => {
    setShowAuthModal(false);
    if (isRootDomain) { window.location.href = getAppUrl('/dashboard'); return; }
    navigate({ to: '/dashboard' });
  }, [navigate]);

  const CardComponent = layoutMap[data.useCases.layout ?? 'grid-2'];

  return (
    <MarketingLayout onSignIn={openSignIn} onSignUp={openSignUp}>
      <div ref={containerRef}>

        {/* Hero */}
        <MarketingSection bg="snow" className="!pt-12 !pb-12">
          <div className={`flex flex-col ${data.hero.image ? 'lg:flex-row items-center gap-12 lg:gap-16' : ''}`}>
            <div className={data.hero.image ? 'flex-1 max-w-xl' : 'max-w-3xl'}>
              <h1
                className="font-serif animate-on-scroll"
                style={{ fontSize: 'clamp(36px, 6vw, 52px)', fontWeight: 300, lineHeight: 1.1, letterSpacing: '-0.02em', color: '#1A1A1A', marginBottom: 20 }}
              >
                {data.hero.headline}
              </h1>
              <p className="animate-on-scroll stagger-1" style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', lineHeight: 1.5, color: '#4A4A4A', marginBottom: 32, maxWidth: 600 }}>
                {data.hero.subheadline}
              </p>
              <div className="flex flex-col sm:flex-row items-start gap-3 animate-on-scroll stagger-2">
                <button onClick={openSignUp} className="marketing-btn-primary w-full sm:w-auto">
                  Create your first code — free
                </button>
              </div>
            </div>
            {data.hero.image && (
              <div className="flex-1 animate-on-scroll stagger-2">
                <img
                  src={data.hero.image}
                  alt=""
                  className="w-full aspect-[4/3] rounded-2xl object-cover"
                  style={{ border: '1px solid #E8E6E3', boxShadow: '0 16px 48px rgba(0,0,0,0.08)' }}
                />
              </div>
            )}
          </div>
        </MarketingSection>

        {/* Problem (optional) */}
        {data.problem && (
          <MarketingSection bg="ink">
            <h2 className="font-serif animate-on-scroll" style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 300, lineHeight: 1.15, letterSpacing: '-0.01em', color: '#ffffff', marginBottom: 24 }}>
              {data.problem.headline}
            </h2>
            {(Array.isArray(data.problem.body) ? data.problem.body : [data.problem.body]).map((p, i) => (
              <p key={i} className={`animate-on-scroll stagger-${i + 1}`} style={{ fontSize: 17, lineHeight: 1.7, color: 'rgba(255,255,255,0.7)', marginBottom: 16, maxWidth: 700 }}>
                {p}
              </p>
            ))}
          </MarketingSection>
        )}

        {/* Use cases */}
        <MarketingSection bg={data.problem ? 'snow' : 'cloud'} overline="Use cases" headline={data.useCases.headline}>
          <CardComponent items={data.useCases.items} />
        </MarketingSection>

        {/* Benefits */}
        <MarketingSection bg={data.problem ? 'cloud' : 'snow'} overline="Why Qrius" headline={data.benefits.headline}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {data.benefits.items.map(({ title, description }, i) => (
              <div key={title} className={`animate-on-scroll stagger-${i + 1}`}>
                <h3 style={{ fontSize: 17, fontWeight: 600, color: '#1A1A1A', marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: '#4A4A4A' }}>{description}</p>
              </div>
            ))}
          </div>
        </MarketingSection>

        {/* Scenario (optional) */}
        {data.scenario && (
          <MarketingSection bg={data.problem ? 'snow' : 'cloud'} overline="In practice" headline={data.scenario.headline}>
            <div className="max-w-2xl space-y-4">
              {data.scenario.items.map(({ label, text }, i) => (
                <div key={label} className={`flex items-start gap-4 animate-on-scroll stagger-${(i % 3) + 1}`}>
                  <span
                    className="inline-block px-3 py-1 rounded-full text-sm font-semibold flex-shrink-0"
                    style={{ backgroundColor: '#FFF3E8', color: '#F97316', minWidth: 90, textAlign: 'center' }}
                  >
                    {label}
                  </span>
                  <p style={{ fontSize: 15, lineHeight: 1.6, color: '#4A4A4A' }}>{text}</p>
                </div>
              ))}
            </div>
          </MarketingSection>
        )}

        {/* CTA */}
        <CTASection
          headline={data.cta.headline}
          subheadline={data.cta.subheadline ?? 'Start building with 15 free dynamic QR codes. No credit card, no time limit.'}
          primaryLabel="Start free"
          primaryAction={openSignUp}
          secondaryLabel={data.cta.secondaryLabel ?? 'See pricing'}
          secondaryHref={data.cta.secondaryHref ?? '/pricing'}
        />
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} defaultView={authView} onAuthSuccess={handleAuthSuccess} />
    </MarketingLayout>
  );
}
