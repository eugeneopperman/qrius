import { useState, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Link as LinkIcon, Type, Mail, Phone, MessageSquare, Wifi, User, Calendar, MapPin, ArrowRight, Palette, Grid3X3, ImagePlus, Frame, Layers, Rocket } from 'lucide-react';
import { MarketingLayout } from '@/components/marketing/MarketingLayout';
import { MarketingSection } from '@/components/marketing/MarketingSection';
import { FeatureRow } from '@/components/marketing/FeatureRow';
import { StepCard } from '@/components/marketing/StepCard';
import { CTASection } from '@/components/marketing/CTASection';
import { AuthModal } from '@/components/auth/AuthModal';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { isRootDomain, getAppUrl } from '@/lib/domain';

// ─── QR type grid data ──────────────────────────────────────────────
const qrTypes = [
  { icon: LinkIcon, name: 'URL', description: 'Send someone to any webpage.', example: 'Link to your latest promotion or landing page.' },
  { icon: User, name: 'vCard', description: 'Share your contact details in one scan.', example: 'Hand out digital business cards at conferences.' },
  { icon: Wifi, name: 'WiFi', description: 'Let people join your network without typing a password.', example: 'Coffee shop, hotel lobby, co-working space.' },
  { icon: Mail, name: 'Email', description: 'Open a pre-filled email with one scan.', example: 'Customer feedback, support requests, RSVPs.' },
  { icon: Phone, name: 'Phone', description: 'Trigger a phone call instantly.', example: '"Call us" on a business card or flyer.' },
  { icon: MessageSquare, name: 'SMS', description: 'Open a pre-written text message.', example: 'Opt-in to marketing, appointment reminders.' },
  { icon: Calendar, name: 'Event', description: "Add an event to someone's calendar.", example: 'Conferences, workshops, meetups, webinars.' },
  { icon: Type, name: 'Text', description: 'Display a plain text message.', example: 'Instructions, serial numbers, welcome notes.' },
  { icon: MapPin, name: 'Location', description: 'Open a map to a specific spot.', example: 'Store locations, venue directions, parking.' },
];

// ─── Customization feature rows ─────────────────────────────────────
const customizationFeatures = [
  {
    icon: Palette,
    headline: 'Colors & gradients',
    description: 'Pick any color for dots and background — or use gradients for something that catches the eye. Match your exact brand palette with hex or RGB values.',
    bullets: ['Solid colors or gradient fills', 'Hex and RGB color picker', 'Match your exact brand palette'],
  },
  {
    icon: Grid3X3,
    headline: 'Dot & corner patterns',
    description: 'Choose from multiple dot shapes and corner styles. Subtle changes, big visual impact.',
    bullets: ['Square, rounded, dots, classy, extra-rounded', 'Independent corner styles', 'Subtle changes, big visual impact'],
  },
  {
    icon: ImagePlus,
    headline: 'Logo upload',
    description: 'Drop your logo right in the center. We handle the sizing and quiet zone so the code stays scannable.',
    bullets: ['Center-placed logo', 'Automatic quiet zone', 'Stays scannable at any size'],
  },
  {
    icon: Frame,
    headline: 'Frames & labels',
    description: 'Wrap your code in a frame with a custom call-to-action. "Scan for menu," "Get 20% off," "Connect to WiFi" — whatever fits.',
    bullets: ['Custom call-to-action text', 'Multiple frame styles', 'Color-matched to your brand'],
  },
  {
    icon: Layers,
    headline: 'Brand templates',
    description: "Save your brand's exact style — colors, logo, patterns, frame — and apply it to any new code in one click. Consistency without the repetition.",
    bullets: ['Save complete brand styles', 'Apply in one click', '3 free, unlimited on Pro+'],
  },
];

// ─── Dynamic codes steps ────────────────────────────────────────────
const dynamicSteps = [
  { step: 1, title: 'Create your code', description: 'You create a QR code pointing to yoursite.com/summer-menu' },
  { step: 2, title: 'Print it', description: 'You print it on table cards, flyers, or packaging' },
  { step: 3, title: 'Update anytime', description: 'Fall rolls around — update the destination to yoursite.com/fall-menu' },
  { step: 4, title: 'Zero waste', description: 'Same printed code, new destination. No reprinting needed.' },
];

// ─── Analytics tabs ─────────────────────────────────────────────────
const analyticsTabs = [
  { title: 'Overview', description: 'Daily and hourly scan charts. See patterns — which days spike, what time your audience is most active.' },
  { title: 'Geography', description: 'Country, region, and city-level breakdown. See where your scans are coming from.' },
  { title: 'Technology', description: 'Browser, operating system, and device type. Know if your audience is mostly on iPhone or Android.' },
  { title: 'Sources', description: 'Referrer tracking shows how people found your code — direct scan, social media link, or embedded on a website.' },
];

// ─── Team features ──────────────────────────────────────────────────
const teamFeatures = [
  { title: 'Workspaces', description: 'Create organizations for different brands, clients, or projects.' },
  { title: 'Role-based access', description: 'Owner, admin, editor, and viewer permissions.' },
  { title: 'Folders', description: 'Organize codes by campaign, location, or whatever makes sense.' },
  { title: 'Shared templates', description: 'Brand templates available to everyone on the team.' },
];

// ─── Download formats ───────────────────────────────────────────────
const downloadFormats = [
  { format: 'PNG', description: 'Perfect for screens, social media, and quick sharing.', availability: 'All plans' },
  { format: 'SVG', description: 'Scalable vector format for designers. Resize without losing quality.', availability: 'Pro and above' },
  { format: 'PDF', description: 'Print-ready with precise dimensions. Great for packaging and signage.', availability: 'Pro and above' },
];

// ─── Roadmap items ──────────────────────────────────────────────────
const roadmapItems = [
  'Barcodes — Traditional barcodes for product packaging and inventory',
  'Digital business cards — Shareable, scannable contact profiles',
  'CSV export — Download your analytics data for custom reporting',
  'More integrations — Connect with the tools you already use',
];

// ─── Main component ─────────────────────────────────────────────────

export default function FeaturesPage() {
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

        {/* ─── 1. Hero ──────────────────────────────────────── */}
        <MarketingSection bg="snow" className="!pt-12 !pb-12">
          <div className="max-w-3xl">
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
              Everything you need to create QR codes people actually scan.
            </h1>
            <p
              className="animate-on-scroll stagger-1"
              style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', lineHeight: 1.5, color: '#4A4A4A', marginBottom: 32, maxWidth: 600 }}
            >
              Nine code types. Full brand customization. Real-time analytics. Team tools. And a free plan that actually means it.
            </p>
            <div className="flex flex-col sm:flex-row items-start gap-3 animate-on-scroll stagger-2">
              <button onClick={openSignUp} className="marketing-btn-primary w-full sm:w-auto">
                Start free
              </button>
              <button
                onClick={() => navigate({ to: '/pricing' })}
                className="marketing-btn-outline w-full sm:w-auto"
              >
                See pricing
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </MarketingSection>

        {/* ─── 2. QR code types ─────────────────────────────── */}
        <MarketingSection
          bg="cloud"
          overline="QR code types"
          headline="Nine types. One tool."
          subheadline="Whether you're sharing a link, a contact card, or your WiFi password — there's a code for that."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {qrTypes.map(({ icon: Icon, name, description, example }, i) => (
              <div
                key={name}
                className={`marketing-card animate-on-scroll stagger-${(i % 3) + 1}`}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: '#FFF3E8' }}
                >
                  <Icon className="w-5 h-5" style={{ color: '#F97316' }} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1A1A1A', marginBottom: 6 }}>
                  {name}
                </h3>
                <p style={{ fontSize: 15, lineHeight: 1.5, color: '#4A4A4A', marginBottom: 8 }}>
                  {description}
                </p>
                <p style={{ fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' }}>
                  {example}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-8 animate-on-scroll" style={{ fontSize: 15, color: '#4A4A4A', fontStyle: 'italic' }}>
            Most QR tools only support URL codes. We support nine — and we're adding more.
          </p>
        </MarketingSection>

        {/* ─── 3. Customization ─────────────────────────────── */}
        <MarketingSection
          bg="snow"
          overline="Customization"
          headline="Your brand. Your code. Every pixel."
          subheadline="A QR code on your menu, your packaging, or your business card should look like it belongs there — not like it was generated by a free tool in 2012."
        >
          {customizationFeatures.map((feat, i) => (
            <div key={feat.headline} className={`animate-on-scroll${i > 0 ? ` stagger-${i}` : ''}`}>
              <FeatureRow {...feat} isLast={i === customizationFeatures.length - 1} />
            </div>
          ))}
        </MarketingSection>

        {/* ─── 4. Dynamic codes ─────────────────────────────── */}
        <MarketingSection
          bg="cloud"
          overline="Dynamic codes"
          headline="Print once. Update forever."
          subheadline="Dynamic QR codes let you change where a scan goes — anytime, from your dashboard. New seasonal menu? Updated event schedule? Change the destination. The printed code stays the same."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dynamicSteps.map((s) => (
              <div key={s.step} className={`animate-on-scroll stagger-${s.step}`}>
                <StepCard {...s} />
              </div>
            ))}
          </div>
          <p className="mt-8 text-center animate-on-scroll" style={{ fontSize: 15, color: '#4A4A4A', fontStyle: 'italic' }}>
            Every code on the free plan is dynamic. Because static-only free tiers aren't really free — they're demos.
          </p>
        </MarketingSection>

        {/* ─── 5. Scan analytics ────────────────────────────── */}
        <MarketingSection
          bg="snow"
          overline="Analytics"
          headline="Know exactly what's happening after the scan."
          subheadline="Every scan tells a story. Where it happened, when, what device was used, and how they found your code. Qrius Codes tracks it all — in real time, with zero setup."
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {analyticsTabs.map(({ title, description }, i) => (
              <div
                key={title}
                className={`marketing-card animate-on-scroll stagger-${(i % 2) + 1}`}
              >
                <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1A1A1A', marginBottom: 6 }}>
                  {title}
                </h3>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: '#4A4A4A' }}>
                  {description}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-8 animate-on-scroll" style={{ fontSize: 15, color: '#4A4A4A', fontStyle: 'italic' }}>
            Analytics are included on every plan — even free. Because "how's my QR code performing?" shouldn't be a premium question.
          </p>
        </MarketingSection>

        {/* ─── 6. Team collaboration ────────────────────────── */}
        <MarketingSection
          bg="cloud"
          overline="Teams"
          headline="Built for teams, not just individuals."
          subheadline="Invite your team, assign roles, and keep everyone working from the same dashboard. No more emailing QR code files around."
        >
          <div className="space-y-4 mb-8">
            {teamFeatures.map(({ title, description }, i) => (
              <div
                key={title}
                className={`marketing-card flex items-start gap-4 animate-on-scroll stagger-${(i % 3) + 1}`}
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0 mt-2"
                  style={{ backgroundColor: '#F97316' }}
                />
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A', marginBottom: 2 }}>
                    {title}
                  </h3>
                  <p style={{ fontSize: 15, lineHeight: 1.5, color: '#4A4A4A' }}>
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div
            className="rounded-xl overflow-hidden animate-on-scroll"
            style={{ border: '1px solid #E8E6E3' }}
          >
            <table className="w-full text-left">
              <thead>
                <tr style={{ backgroundColor: '#F5F4F2' }}>
                  <th className="py-2.5 px-4" style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#4A4A4A' }}>
                    Plan
                  </th>
                  <th className="py-2.5 px-4 text-right" style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#4A4A4A' }}>
                    Team members
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { plan: 'Free', members: 'Just you' },
                  { plan: 'Starter', members: 'Just you' },
                  { plan: 'Pro', members: 'Up to 5' },
                  { plan: 'Business', members: 'Up to 25' },
                ].map(({ plan, members }, i) => (
                  <tr key={plan} style={{ backgroundColor: i % 2 === 0 ? '#ffffff' : '#FAFAF8', borderTop: '1px solid #E8E6E3' }}>
                    <td className="py-2.5 px-4" style={{ fontSize: 15, color: '#1A1A1A', fontWeight: 500 }}>{plan}</td>
                    <td className="py-2.5 px-4 text-right" style={{ fontSize: 15, color: '#4A4A4A' }}>{members}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </MarketingSection>

        {/* ─── 7. Downloads & print ─────────────────────────── */}
        <MarketingSection
          bg="snow"
          overline="Downloads"
          headline="Print-ready. Every time."
          subheadline="Download your QR codes in the format you need — whether it's for a quick social post or a billboard."
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {downloadFormats.map(({ format, description, availability }, i) => (
              <div
                key={format}
                className={`marketing-card text-center animate-on-scroll stagger-${i + 1}`}
              >
                <p style={{ fontSize: 28, fontWeight: 700, color: '#F97316', marginBottom: 8 }}>
                  {format}
                </p>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: '#4A4A4A', marginBottom: 8 }}>
                  {description}
                </p>
                <p style={{ fontSize: 13, fontWeight: 500, color: '#9CA3AF' }}>
                  {availability}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-8 animate-on-scroll" style={{ fontSize: 15, color: '#4A4A4A', fontStyle: 'italic' }}>
            Every download is high-resolution. We don't watermark, compress, or degrade your codes on any plan.
          </p>
        </MarketingSection>

        {/* ─── 8. API access ────────────────────────────────── */}
        <MarketingSection
          bg="cloud"
          overline="API"
          headline="For the builders."
          subheadline="Need to generate QR codes programmatically? Our API lets you create, customize, and manage codes from your own applications."
        >
          <div className="space-y-3 mb-6 animate-on-scroll">
            {[
              { label: 'Pro plan ($29/mo)', detail: '1,000 API requests per day' },
              { label: 'Business plan ($79/mo)', detail: '10,000 API requests per day' },
            ].map(({ label, detail }) => (
              <div key={label} className="flex items-center gap-3" style={{ fontSize: 16, color: '#4A4A4A' }}>
                <span className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#F97316' }} />
                <span><strong style={{ color: '#1A1A1A' }}>{label}:</strong> {detail}</span>
              </div>
            ))}
          </div>
          <p className="animate-on-scroll stagger-1" style={{ fontSize: 15, color: '#4A4A4A', fontStyle: 'italic' }}>
            Not a developer? That's fine — you'll never need to touch the API. Everything it does, the dashboard does too.
          </p>
        </MarketingSection>

        {/* ─── 9. What's coming next ────────────────────────── */}
        <MarketingSection
          bg="ink"
          overline="Roadmap"
          headline="We're just getting started."
          subheadline="Qrius Codes is growing. Here's a peek at what's on the way:"
        >
          <div className="space-y-4">
            {roadmapItems.map((item, i) => (
              <div
                key={item}
                className={`flex items-start gap-3 animate-on-scroll stagger-${i + 1}`}
              >
                <Rocket className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#F97316' }} />
                <p style={{ fontSize: 16, lineHeight: 1.5, color: 'rgba(255,255,255,0.8)' }}>
                  {item}
                </p>
              </div>
            ))}
          </div>
        </MarketingSection>

        {/* ─── 10. Bottom CTA ───────────────────────────────── */}
        <CTASection
          headline="See something you like?"
          subheadline="Start building with 5 free dynamic QR codes and unlimited scans. No credit card, no time limit."
          primaryLabel="Create your first code"
          primaryAction={openSignUp}
          secondaryLabel="Compare plans"
          secondaryHref="/pricing"
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
