import { useState, useCallback } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { UtensilsCrossed, ShoppingBag, CalendarDays, Home, Briefcase, GraduationCap, HeartPulse, ArrowRight } from 'lucide-react';
import { MarketingLayout } from '@/components/marketing/MarketingLayout';
import { MarketingSection } from '@/components/marketing/MarketingSection';
import { CTASection } from '@/components/marketing/CTASection';
import { AuthModal } from '@/components/auth/AuthModal';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { isRootDomain, getAppUrl } from '@/lib/domain';

const useCases = [
  { icon: UtensilsCrossed, title: 'Restaurants', hook: 'Menus, WiFi, and reviews — all on-brand.', href: '/use-cases/restaurants' as const, image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&fit=crop&q=80' },
  { icon: ShoppingBag, title: 'Retail', hook: 'Product info and promotions, right on the shelf.', href: '/use-cases/retail' as const, image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&fit=crop&q=80' },
  { icon: CalendarDays, title: 'Events', hook: 'Schedules, tickets, and feedback in one scan.', href: '/use-cases/events' as const, image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&fit=crop&q=80' },
  { icon: Home, title: 'Real Estate', hook: 'Listing details and virtual tours from the yard sign.', href: '/use-cases/real-estate' as const, image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&fit=crop&q=80' },
  { icon: Briefcase, title: 'Agencies', hook: 'Multi-client campaigns, brand templates, white-label.', href: '/use-cases/agencies' as const, image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&fit=crop&q=80' },
  { icon: GraduationCap, title: 'Education', hook: 'Classroom resources without the long URLs.', href: '/use-cases/education' as const, image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&fit=crop&q=80' },
  { icon: HeartPulse, title: 'Healthcare', hook: 'Patient forms and wayfinding, simplified.', href: '/use-cases/healthcare' as const, image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&fit=crop&q=80' },
];

export default function UseCasesPage() {
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
        <MarketingSection bg="snow" className="!pt-12 !pb-8">
          <div className="max-w-3xl mx-auto text-center">
            <h1
              className="font-serif animate-on-scroll"
              style={{ fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 300, lineHeight: 1.1, letterSpacing: '-0.02em', color: '#1A1A1A', marginBottom: 20 }}
            >
              QR codes for the way you work.
            </h1>
            <p className="animate-on-scroll stagger-1" style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', lineHeight: 1.5, color: '#4A4A4A' }}>
              See how businesses in your industry are using Qrius Codes to connect with their audience.
            </p>
          </div>
        </MarketingSection>

        <MarketingSection bg="snow" className="!pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {useCases.map(({ icon: Icon, title, hook, href, image }, i) => (
              <Link
                key={title}
                to={href}
                className={`marketing-card group hover:shadow-lg transition-shadow overflow-hidden animate-on-scroll stagger-${(i % 3) + 1}`}
                style={{ textDecoration: 'none', padding: 0 }}
              >
                <img
                  src={image}
                  alt=""
                  className="w-full aspect-[16/10] object-cover"
                  loading="lazy"
                />
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FFF3E8' }}>
                      <Icon className="w-4.5 h-4.5" style={{ color: '#F97316' }} />
                    </div>
                    <h2 style={{ fontSize: 20, fontWeight: 600, color: '#1A1A1A' }}>{title}</h2>
                  </div>
                  <p style={{ fontSize: 15, lineHeight: 1.5, color: '#4A4A4A', marginBottom: 12 }}>{hook}</p>
                  <span className="marketing-link">
                    Learn more <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
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
