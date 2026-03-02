import { useState, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Rocket } from 'lucide-react';
import { MarketingLayout } from '@/components/marketing/MarketingLayout';
import { MarketingSection } from '@/components/marketing/MarketingSection';
import { CTASection } from '@/components/marketing/CTASection';
import { AuthModal } from '@/components/auth/AuthModal';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { isRootDomain, getAppUrl } from '@/lib/domain';

// ─── Values ─────────────────────────────────────────────────────────
const values = [
  {
    title: 'Make the free plan actually free.',
    description: "Not a 14-day trial. Not a teaser with watermarks. A real, useful product that helps real businesses — without ever asking for a credit card. If the free plan isn't good enough to build loyalty on its own, the product isn't good enough.",
  },
  {
    title: 'Say the price. Charge the price.',
    description: "Monthly means monthly. If there's a limit, it's on the pricing page — not buried in paragraph 47 of the terms of service. When you're done, you can leave. Your codes don't come with us.",
  },
  {
    title: 'Design is not a luxury.',
    description: "A QR code on a restaurant menu or a product label is part of someone's brand. It should look like it. We give every user — free or paid — the same customization tools, because good design shouldn't be a premium feature.",
  },
  {
    title: 'Build in the open.',
    description: "Our changelog is public. Our roadmap is visible. When something breaks, we say so. When something ships, we show it. Trust is earned by being transparent, not by writing \"we value transparency\" on a marketing page.",
  },
];

// ─── Roadmap ────────────────────────────────────────────────────────
const roadmapItems = [
  'Barcodes for product packaging and inventory',
  'Digital business cards you can share with a scan',
  'Deeper analytics to help you understand what happens after the scan',
  'More integrations with the tools you already use',
];

// ─── Main component ─────────────────────────────────────────────────

export default function AboutPage() {
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

  return (
    <MarketingLayout onSignIn={openSignIn} onSignUp={openSignUp}>
      <div ref={containerRef}>

        {/* ─── Hero ──────────────────────────────────────────── */}
        <MarketingSection bg="snow" className="!pt-16 !pb-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1
              className="font-serif animate-on-scroll"
              style={{ fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 300, lineHeight: 1.1, letterSpacing: '-0.02em', color: '#1A1A1A', marginBottom: 20 }}
            >
              We're building the QR code tool we wished existed.
            </h1>
            <p className="animate-on-scroll stagger-1" style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', lineHeight: 1.5, color: '#4A4A4A' }}>
              Qrius Codes started with a simple frustration: why is every QR code tool either ugly, dishonest, or both?
            </p>
          </div>
        </MarketingSection>

        {/* ─── Origin story ──────────────────────────────────── */}
        <MarketingSection bg="cloud" overline="Our story" headline="The short version.">
          <div className="max-w-2xl space-y-5">
            <p className="animate-on-scroll" style={{ fontSize: 17, lineHeight: 1.7, color: '#4A4A4A' }}>
              We needed a QR code. Simple enough. So we tried the tools that came up first on Google.
            </p>
            <p className="animate-on-scroll stagger-1" style={{ fontSize: 17, lineHeight: 1.7, color: '#4A4A4A' }}>
              One gave us a single free code, then wanted $12 a month to keep it alive. Another charged us upfront for a year we didn't agree to. A third one killed our codes when we cancelled — codes we'd already printed on 200 event badges.
            </p>
            <p className="animate-on-scroll stagger-2" style={{ fontSize: 17, lineHeight: 1.7, color: '#4A4A4A' }}>
              So we built Qrius Codes. Not because the world needs another SaaS tool, but because the existing ones seemed more interested in trapping customers than helping them. We figured there had to be room for something better: a tool that's genuinely useful on the free plan, honest about pricing, and makes codes that actually look good.
            </p>
            <p className="animate-on-scroll stagger-3" style={{ fontSize: 18, fontWeight: 500, color: '#1A1A1A' }}>
              Turns out there was.
            </p>
          </div>
        </MarketingSection>

        {/* ─── Values ────────────────────────────────────────── */}
        <MarketingSection bg="snow" overline="Our values" headline="How we think about building this.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map(({ title, description }, i) => (
              <div
                key={title}
                className={`marketing-card animate-on-scroll stagger-${(i % 2) + 1}`}
                style={{ borderLeft: '3px solid #F97316' }}
              >
                <h3 style={{ fontSize: 17, fontWeight: 600, color: '#1A1A1A', marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: '#4A4A4A' }}>{description}</p>
              </div>
            ))}
          </div>
        </MarketingSection>

        {/* ─── The name ──────────────────────────────────────── */}
        <MarketingSection bg="ink">
          <div className="max-w-2xl mx-auto text-center">
            <p className="marketing-overline mb-4" style={{ color: '#F97316' }}>The name</p>
            <h2
              className="font-serif mb-8 animate-on-scroll"
              style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 300, lineHeight: 1.15, letterSpacing: '-0.01em', color: '#ffffff' }}
            >
              Why "Qrius"?
            </h2>
            <p className="animate-on-scroll stagger-1" style={{ fontSize: 17, lineHeight: 1.7, color: 'rgba(255,255,255,0.7)', marginBottom: 20 }}>
              It's "curious" — rearranged. Because every QR code is a little moment of curiosity. You see a code, you pull out your phone, and you discover something. A menu, a contact card, a promotion, a story.
            </p>
            <p className="animate-on-scroll stagger-2" style={{ fontSize: 17, lineHeight: 1.7, color: 'rgba(255,255,255,0.7)', marginBottom: 20 }}>
              We like that moment. The not-knowing, and then the reveal. It's a small thing, but it's why QR codes work — they turn a printed surface into a doorway. We named the company after that feeling.
            </p>
            <p className="animate-on-scroll stagger-3" style={{ fontSize: 17, lineHeight: 1.7, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
              And yes, we know it looks like a typo at first. That's part of the charm.
            </p>
          </div>
        </MarketingSection>

        {/* ─── Where we're headed ────────────────────────────── */}
        <MarketingSection bg="cloud" overline="Roadmap" headline="What's next.">
          <p className="animate-on-scroll" style={{ fontSize: 17, lineHeight: 1.7, color: '#4A4A4A', marginBottom: 24, maxWidth: 600 }}>
            QR codes are just the beginning. We're building toward a broader vision — a platform for all the codes that connect the physical and digital world:
          </p>
          <div className="space-y-4 mb-8">
            {roadmapItems.map((item, i) => (
              <div key={item} className={`flex items-start gap-3 animate-on-scroll stagger-${i + 1}`}>
                <Rocket className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#F97316' }} />
                <p style={{ fontSize: 16, lineHeight: 1.5, color: '#4A4A4A' }}>{item}</p>
              </div>
            ))}
          </div>
          <p className="animate-on-scroll" style={{ fontSize: 15, lineHeight: 1.6, color: '#4A4A4A', fontStyle: 'italic' }}>
            We're not in a rush. We'd rather ship something great than ship something fast. But if you want to see what we're working on — our changelog is always up to date.
          </p>
        </MarketingSection>

        {/* ─── CTA ───────────────────────────────────────────── */}
        <CTASection
          headline="Come be qrius with us."
          subheadline="Create your free account and make your first code. It takes about 30 seconds."
          primaryLabel="Get started"
          primaryAction={openSignUp}
        />
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} defaultView={authView} onAuthSuccess={handleAuthSuccess} />
    </MarketingLayout>
  );
}
