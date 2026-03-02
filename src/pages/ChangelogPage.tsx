import { useState, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { MarketingLayout } from '@/components/marketing/MarketingLayout';
import { MarketingSection } from '@/components/marketing/MarketingSection';
import { CTASection } from '@/components/marketing/CTASection';
import { AuthModal } from '@/components/auth/AuthModal';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { isRootDomain, getAppUrl } from '@/lib/domain';

// ─── Changelog entries ──────────────────────────────────────────────

interface ChangelogEntry {
  date: string;
  version: string;
  title: string;
  items: { tag: 'New' | 'Improved' | 'Fixed'; text: string }[];
}

const tagColors: Record<string, { bg: string; color: string }> = {
  New: { bg: '#DCFCE7', color: '#166534' },
  Improved: { bg: '#DBEAFE', color: '#1E40AF' },
  Fixed: { bg: '#FEF3C7', color: '#92400E' },
};

const entries: ChangelogEntry[] = [
  {
    date: 'March 1, 2026',
    version: 'v0.72',
    title: 'Features & Pricing marketing pages',
    items: [
      { tag: 'New', text: 'Dedicated /features page with 10 sections covering all product capabilities.' },
      { tag: 'New', text: 'Dedicated /pricing page with billing toggle, plan comparison, FAQ, and industry comparison.' },
      { tag: 'New', text: 'PlanComparisonTable component for dynamic-column feature comparisons.' },
      { tag: 'Improved', text: 'Header and footer navigation links now route to dedicated pages.' },
    ],
  },
  {
    date: 'March 1, 2026',
    version: 'v0.71',
    title: 'Accessibility, SEO, and UX polish',
    items: [
      { tag: 'Improved', text: 'Skip-to-content link, JSON-LD structured data, and semantic heading hierarchy on marketing pages.' },
      { tag: 'Fixed', text: 'Self-hosted Instrument Serif font to fix CSP and service worker errors.' },
    ],
  },
  {
    date: 'March 1, 2026',
    version: 'v0.65',
    title: 'Marketing homepage',
    items: [
      { tag: 'New', text: 'Full marketing homepage with 10 sections: hero, trust bar, features, how it works, pricing, use cases, comparison.' },
      { tag: 'New', text: '8 reusable marketing components with scroll-triggered animations.' },
      { tag: 'New', text: 'Instrument Serif editorial font for marketing headlines.' },
    ],
  },
  {
    date: 'February 28, 2026',
    version: 'v0.61',
    title: 'QR code draft status & auto-save',
    items: [
      { tag: 'New', text: 'Draft status for QR codes with auto-save from step 3.' },
      { tag: 'New', text: 'Draft filter tab on QR Codes page.' },
      { tag: 'Improved', text: 'Autosave interval reduced to 30 seconds for faster recovery.' },
    ],
  },
  {
    date: 'February 27, 2026',
    version: 'v0.57',
    title: 'Mobile UX overhaul',
    items: [
      { tag: 'Improved', text: 'Compact QR cards with dual layout: 72px mobile rows vs full desktop cards.' },
      { tag: 'New', text: 'Fixed bottom nav bar with 5 tabs for mobile.' },
      { tag: 'Improved', text: 'Wizard polish with 160px preview and inline save indicator.' },
    ],
  },
  {
    date: 'February 27, 2026',
    version: 'v0.53',
    title: 'Template Studio',
    items: [
      { tag: 'New', text: 'Full-page interactive template editor with click-to-edit zones.' },
      { tag: 'New', text: 'Undo/redo with debounced snapshots.' },
      { tag: 'New', text: 'Keyboard shortcuts (Cmd+Z/S, 1-5 panel keys).' },
    ],
  },
  {
    date: 'February 25, 2026',
    version: 'v0.39',
    title: 'Multi-theme system',
    items: [
      { tag: 'New', text: '4 theme modes: Warm, Cool, Dark, and Auto (time-based).' },
      { tag: 'New', text: 'Profile settings with theme selector and auto schedule panel.' },
    ],
  },
  {
    date: 'February 24, 2026',
    version: 'v0.36',
    title: 'QR Codes page redesign',
    items: [
      { tag: 'New', text: 'Folder system for organizing QR codes by campaign or location.' },
      { tag: 'New', text: 'Server-side filtering with status tabs, search, and sort.' },
      { tag: 'Improved', text: 'Info-dense QR code rows with type badges and inline actions.' },
    ],
  },
  {
    date: 'February 23, 2026',
    version: 'v0.30',
    title: 'White-label custom domains',
    items: [
      { tag: 'New', text: 'Custom domains for QR code short URLs on Business plan.' },
      { tag: 'New', text: 'Settings > Domains tab with domain verification flow.' },
      { tag: 'New', text: 'Redis domain mapping cache for fast redirects.' },
    ],
  },
  {
    date: 'February 21, 2026',
    version: 'v0.25',
    title: 'Enhanced scan analytics',
    items: [
      { tag: 'New', text: '4-tab analytics dashboard: Overview, Geography, Technology, Sources.' },
      { tag: 'New', text: 'Daily/hourly charts, country flags, browser/OS breakdown.' },
    ],
  },
];

// ─── Main component ─────────────────────────────────────────────────

export default function ChangelogPage() {
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
        <MarketingSection bg="snow" className="!pt-12 !pb-8">
          <div className="max-w-2xl">
            <h1
              className="font-serif animate-on-scroll"
              style={{ fontSize: 'clamp(36px, 6vw, 52px)', fontWeight: 300, lineHeight: 1.1, letterSpacing: '-0.02em', color: '#1A1A1A', marginBottom: 16 }}
            >
              What's new in Qrius Codes.
            </h1>
            <p className="animate-on-scroll stagger-1" style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', lineHeight: 1.5, color: '#4A4A4A' }}>
              We ship often. Here's what's changed.
            </p>
          </div>
        </MarketingSection>

        {/* ─── Timeline ──────────────────────────────────────── */}
        <MarketingSection bg="snow" className="!pt-4">
          <div className="max-w-2xl mx-auto">
            {entries.map((entry, entryIdx) => (
              <div key={entry.version} className={`flex gap-6 animate-on-scroll stagger-${(entryIdx % 3) + 1}`}>
                {/* Timeline line + dot */}
                <div className="hidden sm:flex flex-col items-center flex-shrink-0" style={{ width: 24 }}>
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: '#F97316', marginTop: 6 }} />
                  {entryIdx < entries.length - 1 && (
                    <div className="flex-1" style={{ width: 2, backgroundColor: '#E8E6E3', marginTop: 8 }} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-10">
                  <div className="flex flex-wrap items-baseline gap-3 mb-1">
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#F97316' }}>{entry.version}</span>
                    <span style={{ fontSize: 13, color: '#9CA3AF' }}>{entry.date}</span>
                  </div>
                  <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1A1A1A', marginBottom: 12, lineHeight: 1.3 }}>
                    {entry.title}
                  </h2>
                  <ul className="space-y-2">
                    {entry.items.map(({ tag, text }) => {
                      const { bg, color } = tagColors[tag];
                      return (
                        <li key={text} className="flex items-start gap-2.5" style={{ fontSize: 15, lineHeight: 1.5, color: '#4A4A4A' }}>
                          <span
                            className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold flex-shrink-0 mt-0.5"
                            style={{ backgroundColor: bg, color }}
                          >
                            {tag}
                          </span>
                          {text}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </MarketingSection>

        <CTASection
          headline="Ready to get qrius?"
          subheadline="Create your first QR code in under a minute. Free, no credit card, no strings."
          primaryLabel="Start creating"
          primaryAction={openSignUp}
        />
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} defaultView={authView} onAuthSuccess={handleAuthSuccess} />
    </MarketingLayout>
  );
}
