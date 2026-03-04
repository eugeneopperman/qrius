import { useState, useCallback } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { QrCode, ArrowRight, BarChart3, Gift } from 'lucide-react';
import { MarketingLayout } from '@/components/marketing/MarketingLayout';
import { MarketingSection } from '@/components/marketing/MarketingSection';
import { FeatureRow } from '@/components/marketing/FeatureRow';
import { StepCard } from '@/components/marketing/StepCard';
import { ComparisonTable } from '@/components/marketing/ComparisonTable';
import { CTASection } from '@/components/marketing/CTASection';
import { AuthModal } from '@/components/auth/AuthModal';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { isRootDomain, getAppUrl } from '@/lib/domain';

// ─── Unsplash images ────────────────────────────────────────────────
const IMAGES = {
  hero: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&fit=crop&q=80',
  create: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&fit=crop&q=80',
  track: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&fit=crop&q=80',
  update: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&fit=crop&q=80',
  teams: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&fit=crop&q=80',
  restaurants: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&fit=crop&q=80',
  retail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&fit=crop&q=80',
  events: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&fit=crop&q=80',
  agencies: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&fit=crop&q=80',
};

// ─── Section data ───────────────────────────────────────────────────
const trustItems = [
  { icon: QrCode, stat: '9 QR code types', label: 'URL, vCard, WiFi, Event, and more' },
  { icon: BarChart3, stat: 'Real-time analytics', label: 'Know where, when, and how people scan' },
  { icon: Gift, stat: 'Free forever plan', label: '5 dynamic codes, unlimited scans, no catch' },
];

const features = [
  {
    image: IMAGES.create,
    headline: 'Create & customize',
    description: 'Your QR code, your brand. Pick your colors, add your logo, and wrap it in a frame with a custom label. It takes about 60 seconds.',
    bullets: [
      'Choose from 9 QR code types — URL, vCard, WiFi, and more',
      'Add your logo, brand colors, and custom dot patterns',
      'Save brand templates and apply them in one click',
    ],
  },
  {
    image: IMAGES.track,
    headline: 'Track every scan',
    description: 'See who\'s scanning, where they are, what device they\'re using, and when they do it — all in real time, all without a single line of code.',
    bullets: [
      'Daily and hourly scan trends with geography breakdown',
      'Browser, OS, and device type analytics',
      'Referrer tracking to see how people find your codes',
    ],
  },
  {
    image: IMAGES.update,
    headline: 'Update anytime',
    description: 'Dynamic codes let you change where a scan goes — even after you\'ve printed it. New menu? New promotion? Update the destination.',
    bullets: [
      'Change the destination URL without reprinting',
      'Pause and reactivate codes from your dashboard',
      'Every code on the free plan is dynamic',
    ],
  },
  {
    image: IMAGES.teams,
    headline: 'Built for teams',
    description: 'Invite your team, assign roles, and keep everyone working from the same dashboard. No more emailing QR code files around.',
    bullets: [
      'Workspaces for different brands, clients, or projects',
      'Owner, admin, editor, and viewer permissions',
      'Shared brand templates available to everyone',
    ],
  },
];

const steps = [
  { step: 1, title: 'Pick your type', description: 'Choose from 9 QR code types — URL, vCard, WiFi, Event, and more. Just fill in the details.' },
  { step: 2, title: 'Make it yours', description: 'Customize colors, patterns, logos, and frames to match your brand. Or grab a template and go.' },
  { step: 3, title: 'Download & track', description: 'Export in PNG, SVG, or PDF. Share it, print it, stick it anywhere. Then watch the scans roll in.' },
];

const pricingPlans = [
  { name: 'Free', nameColor: '#4A4A4A', price: '$0', period: 'forever', lines: ['5 dynamic codes', 'Unlimited scans', 'PNG downloads'] },
  { name: 'Starter', nameColor: '#4A4A4A', price: '$12', period: '/month', lines: ['50 dynamic codes', 'Unlimited scans', 'PNG, SVG downloads'] },
  { name: 'Pro', nameColor: '#F97316', price: '$29', period: '/month', lines: ['500 dynamic codes', 'API + team + domains', 'PNG, SVG, PDF'], featured: true },
  { name: 'Business', nameColor: '#4A4A4A', price: '$79', period: '/month', lines: ['Unlimited codes', 'White-label branding', 'Dedicated support'] },
];

const useCases = [
  { image: IMAGES.restaurants, title: 'Restaurants & cafes', description: 'Digital menus, WiFi sharing, Google review codes — all on-brand and easy to update.' },
  { image: IMAGES.retail, title: 'Retail & packaging', description: 'Product details, promotions, and loyalty programs, right on the shelf or the box.' },
  { image: IMAGES.events, title: 'Events & conferences', description: 'Schedules, tickets, speaker bios, and feedback forms. One scan does it all.' },
  { image: IMAGES.agencies, title: 'Agencies & teams', description: 'Manage client campaigns, apply brand templates, and share access with your team.' },
];

const comparisonRows = [
  { feature: 'Dynamic QR codes', qrius: '5 (free)', competitor: '1–3' },
  { feature: 'Scans per month', qrius: 'Unlimited', competitor: '0–500' },
  { feature: 'QR code types', qrius: '9', competitor: '1 (URL only)' },
  { feature: 'Scan analytics', qrius: true as const, competitor: false as const },
  { feature: 'Logo & brand colors', qrius: true as const, competitor: false as const },
  { feature: 'Codes survive cancellation', qrius: true as const, competitor: false as const },
];

// ─── Sub-components ─────────────────────────────────────────────────

function PricingCard({ name, nameColor, price, period, lines, featured, stagger }: {
  name: string;
  nameColor: string;
  price: string;
  period: string;
  lines: string[];
  featured?: boolean;
  stagger: number;
}) {
  return (
    <div
      className={`marketing-card text-center flex flex-col animate-on-scroll stagger-${stagger}`}
      style={featured ? { border: '2px solid #F97316', position: 'relative' } : undefined}
    >
      {featured && (
        <span
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold text-white"
          style={{ backgroundColor: '#F97316' }}
        >
          Popular
        </span>
      )}
      <p style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: nameColor, marginBottom: 8 }}>
        {name}
      </p>
      <p style={{ fontSize: 36, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>{price}</p>
      <p style={{ fontSize: 14, color: '#4A4A4A', marginBottom: 16 }}>{period}</p>
      <div className="space-y-2 flex-1" style={{ fontSize: 15, color: '#4A4A4A' }}>
        {lines.map((line) => {
          const match = line.match(/^(.+?)(\s(?:dynamic codes|scans\/mo|codes|scans|downloads).*)$/);
          return match ? (
            <p key={line}><strong style={{ color: '#1A1A1A' }}>{match[1]}</strong>{match[2]}</p>
          ) : (
            <p key={line}>{line}</p>
          );
        })}
      </div>
      <Link to="/pricing" className="marketing-link justify-center mt-6">
        And more <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────

export default function HomePage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState<'signin' | 'signup'>('signup');
  const navigate = useNavigate();
  const containerRef = useScrollReveal<HTMLDivElement>();

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
    <MarketingLayout onSignUp={openSignUp}>
      <div ref={containerRef}>

        {/* ─── Hero ──────────────────────────────────────────── */}
        <MarketingSection bg="snow" className="!pt-12 !pb-12">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <div className="flex-1 max-w-xl">
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
                QR codes that people actually want to scan.
              </h1>
              <p
                className="animate-on-scroll stagger-1"
                style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', lineHeight: 1.5, color: '#4A4A4A', marginBottom: 32, maxWidth: 520 }}
              >
                Create beautiful, trackable QR codes in under a minute. Customize every detail, track every scan, and update your codes anytime — even after they're printed.
              </p>
              <div className="flex flex-col sm:flex-row items-start gap-3 animate-on-scroll stagger-2">
                <button onClick={openSignUp} className="marketing-btn-primary w-full sm:w-auto">
                  Start creating — it's free
                </button>
                <button
                  onClick={() => document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="marketing-btn-outline w-full sm:w-auto"
                >
                  See what's inside
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 animate-on-scroll stagger-2">
              <img
                src={IMAGES.hero}
                alt="Entrepreneur working at a modern workspace"
                className="w-full aspect-[4/3] rounded-2xl object-cover"
                style={{ border: '1px solid #E8E6E3', boxShadow: '0 16px 48px rgba(0,0,0,0.08)' }}
              />
            </div>
          </div>
        </MarketingSection>

        {/* ─── Trust bar ─────────────────────────────────────── */}
        <section style={{ backgroundColor: '#F5F4F2' }}>
          <div className="mx-auto px-4 sm:px-6 lg:px-8 py-10" style={{ maxWidth: 1200 }}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
              {trustItems.map(({ icon: Icon, stat, label }, i) => (
                <div key={stat} className={`flex items-start gap-4 animate-on-scroll stagger-${i + 1}`}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FFF3E8' }}>
                    <Icon className="w-5 h-5" style={{ color: '#F97316' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A', marginBottom: 2 }}>{stat}</p>
                    <p style={{ fontSize: 14, color: '#4A4A4A' }}>{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Problem → Solution ────────────────────────────── */}
        <MarketingSection bg="ink">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <div className="w-full lg:w-1/3 flex-shrink-0 animate-on-scroll">
              <img
                src={IMAGES.hero}
                alt="Modern workspace with branded QR codes"
                className="w-full aspect-[3/4] rounded-2xl object-cover"
                style={{ boxShadow: '0 16px 48px rgba(0,0,0,0.3)', opacity: 0.85 }}
                loading="lazy"
              />
            </div>
            <div className="flex-1 animate-on-scroll stagger-1">
              <h2
                className="font-serif mb-6"
                style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 300, lineHeight: 1.15, letterSpacing: '-0.01em', color: '#ffffff' }}
              >
                You deserve better than a black-and-white square.
              </h2>
              <p className="mb-6" style={{ fontSize: 17, lineHeight: 1.6, color: 'rgba(255,255,255,0.7)' }}>
                Most QR code tools are stuck in 2015. They give you an ugly code, charge you to track it, and — here's the fun part — kill it the moment you stop paying.
              </p>
              <p style={{ fontSize: 17, lineHeight: 1.6, color: 'rgba(255,255,255,0.7)' }}>
                Qrius Codes is different. We built the tool we wished existed: one where your codes look like they belong to your brand, your analytics are clear and useful, and your codes keep working no matter what. Because once you've printed 500 flyers, "just make a new one" isn't really an option.
              </p>
            </div>
          </div>
        </MarketingSection>

        {/* ─── Features ──────────────────────────────────────── */}
        <MarketingSection id="features" bg="snow" overline="Features" headline="Everything you need. Nothing you don't.">
          {features.map((feat, i) => (
            <div key={feat.headline} className={`animate-on-scroll${i > 0 ? ` stagger-${i}` : ''}`}>
              <FeatureRow {...feat} isLast={i === features.length - 1} />
            </div>
          ))}
        </MarketingSection>

        {/* ─── How it works ──────────────────────────────────── */}
        <MarketingSection bg="cloud" overline="How it works" headline={<>Three steps. One minute.<br />Zero learning curve.</>}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6">
            {steps.map((s) => (
              <div key={s.step} className={`animate-on-scroll stagger-${s.step}`}>
                <StepCard {...s} />
              </div>
            ))}
          </div>
          <div className="text-center mt-12 animate-on-scroll stagger-4">
            <button onClick={openSignUp} className="marketing-btn-primary" style={{ padding: '12px 24px' }}>
              Try it now — free
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </MarketingSection>

        {/* ─── Pricing ───────────────────────────────────────── */}
        <MarketingSection
          id="pricing"
          bg="snow"
          overline="Pricing"
          headline="Plans that grow with you."
          subheadline="Start free with unlimited scans. Upgrade when you need more codes, formats, or team features."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {pricingPlans.map((plan, i) => (
              <PricingCard key={plan.name} {...plan} stagger={i + 1} />
            ))}
          </div>
          <p className="text-center animate-on-scroll stagger-4" style={{ fontSize: 15, color: '#4A4A4A' }}>
            No credit card for free. No annual lock-in on any plan. Cancel anytime — your codes keep working.
          </p>
        </MarketingSection>

        {/* ─── Use cases ─────────────────────────────────────── */}
        <MarketingSection id="use-cases" bg="cloud" overline="Use cases" headline="QR codes for the way you work.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {useCases.map(({ image, title, description }, i) => (
              <div key={title} className={`marketing-card overflow-hidden animate-on-scroll stagger-${i + 1}`} style={{ padding: 0 }}>
                <img src={image} alt={title} className="w-full aspect-[16/9] object-cover" loading="lazy" />
                <div style={{ padding: '20px 24px 24px' }}>
                  <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1A1A1A', marginBottom: 6 }}>{title}</h3>
                  <p style={{ fontSize: 15, lineHeight: 1.6, color: '#4A4A4A' }}>{description}</p>
                </div>
              </div>
            ))}
          </div>
        </MarketingSection>

        {/* ─── Comparison ────────────────────────────────────── */}
        <MarketingSection bg="snow" overline="Compare" headline="More for less. That's not a typo.">
          <div className="animate-on-scroll">
            <ComparisonTable rows={comparisonRows} />
          </div>
          <p className="mt-6 animate-on-scroll stagger-1" style={{ fontSize: 15, lineHeight: 1.6, color: '#4A4A4A', fontStyle: 'italic' }}>
            We're not being generous to be nice. We just think the bar has been set embarrassingly low.
          </p>
        </MarketingSection>

        {/* ─── Bottom CTA ────────────────────────────────────── */}
        <CTASection
          headline="Ready to get qrius?"
          subheadline="Create your first QR code in under a minute. Free, no credit card, no strings."
          primaryLabel="Start creating"
          primaryAction={openSignUp}
          secondaryLabel="Talk to us first"
          secondaryHref="mailto:hello@qriuscodes.com"
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
