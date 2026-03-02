import { useState, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowRight, Check, Shield, CreditCard, DoorOpen } from 'lucide-react';
import { MarketingLayout } from '@/components/marketing/MarketingLayout';
import { MarketingSection } from '@/components/marketing/MarketingSection';
import { PlanComparisonTable } from '@/components/marketing/PlanComparisonTable';
import { CTASection } from '@/components/marketing/CTASection';
import { AuthModal } from '@/components/auth/AuthModal';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { isRootDomain, getAppUrl } from '@/lib/domain';

// ─── Plan card data ─────────────────────────────────────────────────
interface PlanDef {
  name: string;
  monthly: number;
  annual: number;
  period: string;
  tagline: string;
  features: string[];
  cta: string;
  featured?: boolean;
  note?: string;
}

const plans: PlanDef[] = [
  {
    name: 'Free',
    monthly: 0,
    annual: 0,
    period: 'forever',
    tagline: 'For individuals and small projects getting started with QR codes.',
    features: [
      '15 dynamic QR codes',
      '5,000 scans per month',
      '9 QR code types',
      'Full customization',
      'Scan analytics',
      '30-day scan history',
      'PNG downloads',
      '3 brand templates',
    ],
    cta: 'Get started',
    note: 'No credit card required. Not now, not ever.',
  },
  {
    name: 'Pro',
    monthly: 9,
    annual: 7,
    period: '/month',
    tagline: 'For businesses and creators who need more codes, more data, and more formats.',
    features: [
      'Everything in Free, plus:',
      '250 dynamic QR codes',
      '100,000 scans per month',
      '1-year scan history',
      'PNG, SVG, and PDF downloads',
      'Unlimited brand templates',
      'Up to 5 team members',
      'API access (1,000 req/day)',
      'Email support',
    ],
    cta: 'Start free, upgrade anytime',
    featured: true,
  },
  {
    name: 'Business',
    monthly: 29,
    annual: 23,
    period: '/month',
    tagline: 'For teams and agencies managing QR codes at scale.',
    features: [
      'Everything in Pro, plus:',
      'Unlimited dynamic QR codes',
      'Unlimited scans',
      'Unlimited scan history',
      'Up to 25 team members',
      'White-label (custom domains)',
      'API access (10,000 req/day)',
      'Priority support',
    ],
    cta: 'Start free, upgrade anytime',
  },
];

// ─── Full comparison table ──────────────────────────────────────────
const comparisonColumns = [
  { key: 'free', label: 'Free' },
  { key: 'pro', label: 'Pro', highlight: true },
  { key: 'business', label: 'Business' },
];

const comparisonRows = [
  { feature: 'Dynamic QR codes', values: { free: '15', pro: '250', business: 'Unlimited' } },
  { feature: 'Scans per month', values: { free: '5,000', pro: '100,000', business: 'Unlimited' } },
  { feature: 'QR code types', values: { free: 'All 9', pro: 'All 9', business: 'All 9' } },
  { feature: 'Customization', values: { free: 'Full', pro: 'Full', business: 'Full' } },
  { feature: 'Scan analytics', values: { free: true, pro: true, business: true } },
  { feature: 'Scan history', values: { free: '30 days', pro: '1 year', business: 'Unlimited' } },
  { feature: 'PNG download', values: { free: true, pro: true, business: true } },
  { feature: 'SVG download', values: { free: false, pro: true, business: true } },
  { feature: 'PDF download', values: { free: false, pro: true, business: true } },
  { feature: 'Brand templates', values: { free: '3', pro: 'Unlimited', business: 'Unlimited' } },
  { feature: 'Team members', values: { free: '1', pro: '5', business: '25' } },
  { feature: 'Folders', values: { free: false, pro: true, business: true } },
  { feature: 'Custom domain', values: { free: false, pro: false, business: true } },
  { feature: 'White-label', values: { free: false, pro: false, business: true } },
  { feature: 'API access', values: { free: false, pro: '1K req/day', business: '10K req/day' } },
  { feature: 'Support', values: { free: 'Community', pro: 'Email', business: 'Priority' } },
];

// ─── Trust signals ──────────────────────────────────────────────────
const trustCards = [
  {
    icon: Shield,
    title: 'Your codes keep working.',
    description: "If you downgrade or cancel, your existing QR codes don't stop working. We don't hold your printed materials hostage. That's a promise, not a marketing line.",
  },
  {
    icon: CreditCard,
    title: 'No hidden fees.',
    description: "The price you see is the price you pay. Monthly means monthly — we won't surprise you with an annual charge. No setup fees, no overage charges, no \"premium support\" upsells.",
  },
  {
    icon: DoorOpen,
    title: 'Cancel anytime.',
    description: 'No contracts. No cancellation fees. No guilt-trip "are you sure?" screens. Click cancel, and you\'re done. We\'d rather earn your business than trap you in it.',
  },
];

// ─── FAQ ────────────────────────────────────────────────────────────
const faqItems = [
  {
    q: 'What happens to my QR codes if I downgrade?',
    a: "They keep working. If you go from Pro to Free and have more than 15 codes, your existing codes continue to scan and redirect. You just can't create new ones until you're back under the limit. We will never deactivate codes you've already printed.",
  },
  {
    q: 'Can I switch plans anytime?',
    a: "Yes. Upgrade or downgrade whenever you want — changes take effect immediately. If you upgrade mid-cycle, you'll be charged the prorated difference. If you downgrade, you'll keep your current plan's features until the end of your billing period.",
  },
  {
    q: 'Is there a free trial for Pro or Business?',
    a: "You don't need one. Start with the free plan — it's genuinely useful on its own. When you need more, upgrade. There's no artificial time limit or feature lockout to pressure you.",
  },
  {
    q: 'What counts as a "dynamic" QR code?',
    a: 'A dynamic code is one where you can change the destination URL after creating it, and where scans are tracked. Every code you create on Qrius Codes is dynamic. We don\'t make static-only codes and call them "free."',
  },
  {
    q: 'Do you offer refunds?',
    a: "If you're unhappy within the first 14 days of a paid plan, reach out and we'll sort it out. We're humans, not a terms-of-service wall.",
  },
  {
    q: 'Can I use Qrius Codes for commercial purposes?',
    a: 'Absolutely. Free plan included. Your codes, your business, your revenue.',
  },
  {
    q: 'What payment methods do you accept?',
    a: "All major credit and debit cards via Stripe. We don't store your card details — Stripe handles all of that securely.",
  },
  {
    q: 'Do you offer annual billing?',
    a: "Yes — save 22% when you pay annually. But we also offer monthly billing with no penalty, because sometimes you just want to go month by month. We get it.",
  },
];

// ─── Industry comparison ────────────────────────────────────────────
const industryColumns = [
  { key: 'qrius', label: 'Qrius', highlight: true },
  { key: 'bitly', label: 'Bitly' },
  { key: 'qrcg', label: 'QR Code Gen' },
  { key: 'uniqode', label: 'Uniqode' },
];

const industryRows = [
  { feature: 'Free dynamic codes', values: { qrius: '15', bitly: '2', qrcg: '1 (14-day trial)', uniqode: '0' } },
  { feature: 'Paid from', values: { qrius: '$9/mo', bitly: '$10/mo', qrcg: '~$8/mo (annual)', uniqode: '$9/mo (annual)' } },
  { feature: 'Codes at $9/mo', values: { qrius: '250', bitly: '5', qrcg: '~2', uniqode: '50' } },
  { feature: 'QR code types', values: { qrius: '9', bitly: '1 (URL)', qrcg: '8', uniqode: '10+' } },
  { feature: 'Monthly billing', values: { qrius: true, bitly: false, qrcg: false, uniqode: false } },
  { feature: 'Codes survive cancellation', values: { qrius: true, bitly: false, qrcg: false, uniqode: false } },
];

// ─── Sub-components ─────────────────────────────────────────────────

function BillingToggle({ billing, onChange }: { billing: 'monthly' | 'annual'; onChange: (b: 'monthly' | 'annual') => void }) {
  return (
    <div className="flex items-center justify-center gap-1 mb-10">
      <div
        className="inline-flex rounded-full p-1"
        style={{ backgroundColor: '#F5F4F2', border: '1px solid #E8E6E3' }}
      >
        <button
          onClick={() => onChange('monthly')}
          className="px-5 py-2 rounded-full text-sm font-medium transition-colors"
          style={{
            backgroundColor: billing === 'monthly' ? '#F97316' : 'transparent',
            color: billing === 'monthly' ? '#ffffff' : '#4A4A4A',
          }}
        >
          Monthly
        </button>
        <button
          onClick={() => onChange('annual')}
          className="px-5 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2"
          style={{
            backgroundColor: billing === 'annual' ? '#F97316' : 'transparent',
            color: billing === 'annual' ? '#ffffff' : '#4A4A4A',
          }}
        >
          Annual
          <span
            className="px-2 py-0.5 rounded-full text-[11px] font-bold"
            style={{
              backgroundColor: billing === 'annual' ? 'rgba(255,255,255,0.25)' : '#FFF3E8',
              color: billing === 'annual' ? '#ffffff' : '#F97316',
            }}
          >
            Save 22%
          </span>
        </button>
      </div>
    </div>
  );
}

function PlanCard({ plan, billing, onSelect, stagger }: { plan: PlanDef; billing: 'monthly' | 'annual'; onSelect: () => void; stagger: number }) {
  const price = billing === 'annual' ? plan.annual : plan.monthly;

  return (
    <div
      className={`marketing-card flex flex-col animate-on-scroll stagger-${stagger}`}
      style={plan.featured ? { border: '2px solid #F97316', position: 'relative' } : undefined}
    >
      {plan.featured && (
        <span
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold text-white"
          style={{ backgroundColor: '#F97316' }}
        >
          Popular
        </span>
      )}
      <p style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: plan.featured ? '#F97316' : '#4A4A4A', marginBottom: 8 }}>
        {plan.name}
      </p>
      <div className="flex items-baseline gap-1 mb-2">
        <span style={{ fontSize: 40, fontWeight: 700, color: '#1A1A1A' }}>
          ${price}
        </span>
        <span style={{ fontSize: 16, color: '#4A4A4A' }}>
          {plan.period}
        </span>
      </div>
      {billing === 'annual' && price > 0 && (
        <p style={{ fontSize: 13, color: '#F97316', marginBottom: 8 }}>
          ${plan.monthly}/mo billed monthly
        </p>
      )}
      <p style={{ fontSize: 15, lineHeight: 1.5, color: '#4A4A4A', marginBottom: 16 }}>
        {plan.tagline}
      </p>
      <ul className="space-y-2.5 flex-1 mb-6">
        {plan.features.map((feat) => (
          <li key={feat} className="flex items-start gap-2.5" style={{ fontSize: 14, lineHeight: 1.5, color: '#4A4A4A' }}>
            {feat.endsWith(':') ? (
              <span style={{ fontWeight: 600, color: '#1A1A1A' }}>{feat}</span>
            ) : (
              <>
                <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#22C55E' }} />
                {feat}
              </>
            )}
          </li>
        ))}
      </ul>
      <button
        onClick={onSelect}
        className={plan.featured ? 'marketing-btn-primary w-full' : 'marketing-btn-outline w-full'}
        style={{ padding: '12px 20px' }}
      >
        {plan.cta}
      </button>
      {plan.note && (
        <p className="mt-3 text-center" style={{ fontSize: 13, color: '#9CA3AF' }}>
          {plan.note}
        </p>
      )}
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────

export default function PricingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState<'signin' | 'signup'>('signup');
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const navigate = useNavigate();
  const containerRef = useScrollReveal<HTMLDivElement>();

  const openSignIn = useCallback(() => {
    setAuthView('signin');
    setShowAuthModal(true);
  }, []);

  const openSignUp = useCallback(() => {
    setAuthView('signup');
    setShowAuthModal(true);
  }, []);

  const handleAuthSuccess = useCallback(() => {
    setShowAuthModal(false);
    if (isRootDomain) {
      window.location.href = getAppUrl('/dashboard');
      return;
    }
    navigate({ to: '/dashboard' });
  }, [navigate]);

  return (
    <MarketingLayout onSignIn={openSignIn} onSignUp={openSignUp}>
      <div ref={containerRef}>

        {/* ─── 1. Hero ──────────────────────────────────────── */}
        <MarketingSection bg="snow" className="!pt-12 !pb-8">
          <div className="text-center max-w-2xl mx-auto">
            <h1
              className="font-serif animate-on-scroll"
              style={{
                fontSize: 'clamp(36px, 6vw, 56px)',
                fontWeight: 300,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                color: '#1A1A1A',
                marginBottom: 20,
              }}
            >
              Honest pricing. No surprises.
            </h1>
            <p
              className="animate-on-scroll stagger-1"
              style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', lineHeight: 1.5, color: '#4A4A4A' }}
            >
              Pick a plan, pay what you see, cancel when you want. Your codes keep working no matter what.
            </p>
          </div>
        </MarketingSection>

        {/* ─── 2. Billing toggle + Plan cards ───────────────── */}
        <MarketingSection bg="snow" className="!pt-4">
          <BillingToggle billing={billing} onChange={setBilling} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <PlanCard
                key={plan.name}
                plan={plan}
                billing={billing}
                onSelect={openSignUp}
                stagger={i + 1}
              />
            ))}
          </div>
        </MarketingSection>

        {/* ─── 3. Full comparison table ─────────────────────── */}
        <MarketingSection
          bg="cloud"
          overline="Compare plans"
          headline="The full picture."
        >
          <div className="animate-on-scroll">
            <PlanComparisonTable columns={comparisonColumns} rows={comparisonRows} />
          </div>
        </MarketingSection>

        {/* ─── 4. Trust signals ─────────────────────────────── */}
        <MarketingSection
          bg="snow"
          overline="Our promise"
          headline="The fine print — except it's not fine print."
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {trustCards.map(({ icon: Icon, title, description }, i) => (
              <div
                key={title}
                className={`marketing-card animate-on-scroll stagger-${i + 1}`}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: '#FFF3E8' }}
                >
                  <Icon className="w-5 h-5" style={{ color: '#F97316' }} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1A1A1A', marginBottom: 8 }}>
                  {title}
                </h3>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: '#4A4A4A' }}>
                  {description}
                </p>
              </div>
            ))}
          </div>
        </MarketingSection>

        {/* ─── 5. FAQ ───────────────────────────────────────── */}
        <MarketingSection
          bg="cloud"
          overline="FAQ"
          headline="Questions? Good ones."
        >
          <div className="max-w-2xl mx-auto space-y-3">
            {faqItems.map(({ q, a }, i) => (
              <details
                key={q}
                className={`group rounded-xl animate-on-scroll stagger-${(i % 3) + 1}`}
                style={{ backgroundColor: '#ffffff', border: '1px solid #E8E6E3' }}
              >
                <summary
                  className="flex items-center justify-between gap-4 cursor-pointer px-5 py-4 list-none"
                  style={{ fontSize: 16, fontWeight: 500, color: '#1A1A1A' }}
                >
                  {q}
                  <ArrowRight
                    className="w-4 h-4 flex-shrink-0 transition-transform group-open:rotate-90"
                    style={{ color: '#9CA3AF' }}
                  />
                </summary>
                <div className="px-5 pb-4" style={{ fontSize: 15, lineHeight: 1.6, color: '#4A4A4A' }}>
                  {a}
                </div>
              </details>
            ))}
          </div>
        </MarketingSection>

        {/* ─── 6. Industry comparison ───────────────────────── */}
        <MarketingSection
          bg="snow"
          overline="Compare tools"
          headline="How we stack up."
        >
          <div className="animate-on-scroll">
            <PlanComparisonTable columns={industryColumns} rows={industryRows} />
          </div>
          <p className="mt-6 animate-on-scroll stagger-1" style={{ fontSize: 15, lineHeight: 1.6, color: '#4A4A4A', fontStyle: 'italic' }}>
            We didn't set out to be the cheapest. We set out to be the most honest. The pricing just worked out that way.
          </p>
        </MarketingSection>

        {/* ─── 7. Bottom CTA ────────────────────────────────── */}
        <CTASection
          headline="Start free. Upgrade when you're ready. Cancel if you're not."
          subheadline="That's the whole deal."
          primaryLabel="Create your free account"
          primaryAction={openSignUp}
          secondaryLabel="Have questions? Let's talk"
          secondaryHref="mailto:hello@qrius.app"
        />
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultView={authView}
        onAuthSuccess={handleAuthSuccess}
      />
    </MarketingLayout>
  );
}
