import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Menu, X } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

interface NavLink {
  label: string;
  /** Hash anchor (e.g. '#features') for same-page scroll */
  hash?: string;
  /** Route path for real page navigation */
  to?: string;
}

const navLinks: NavLink[] = [
  { label: 'Features', hash: '#features' },
  { label: 'Pricing', hash: '#pricing' },
  { label: 'Use Cases', hash: '#use-cases' },
  { label: 'Sign In', to: '/signin' },
];

interface MarketingHeaderProps {
  onSignIn: () => void;
  onSignUp: () => void;
}

export function MarketingHeader({ onSignIn, onSignUp }: MarketingHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (link: NavLink) => {
    setMobileOpen(false);
    if (link.hash) {
      const el = document.querySelector(link.hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
    if (link.to === '/signin') {
      onSignIn();
    }
  };

  return (
    <>
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          backgroundColor: '#FAFAF8',
          borderColor: '#E8E6E3',
        }}
      >
        <div className="mx-auto flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8" style={{ maxWidth: 1200 }}>
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Logo size="sm" showText />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) =>
              link.to ? (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link)}
                  className="text-[15px] font-medium transition-colors"
                  style={{ color: '#4A4A4A' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#1A1A1A')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#4A4A4A')}
                >
                  {link.label}
                </button>
              ) : (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link)}
                  className="text-[15px] font-medium transition-colors"
                  style={{ color: '#4A4A4A' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#1A1A1A')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#4A4A4A')}
                >
                  {link.label}
                </button>
              )
            )}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={onSignUp}
              className="text-[15px] font-medium text-white rounded-lg transition-colors"
              style={{
                backgroundColor: '#F97316',
                padding: '10px 20px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#EA580C')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#F97316')}
            >
              Start free
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 -mr-2"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? (
              <X className="w-6 h-6" style={{ color: '#1A1A1A' }} />
            ) : (
              <Menu className="w-6 h-6" style={{ color: '#1A1A1A' }} />
            )}
          </button>
        </div>
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 flex flex-col pt-16"
          style={{ backgroundColor: '#FAFAF8' }}
        >
          <nav className="flex flex-col items-center gap-6 pt-12">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link)}
                className="text-xl font-medium"
                style={{ color: '#1A1A1A' }}
              >
                {link.label}
              </button>
            ))}
            <div className="flex flex-col items-center gap-4 mt-8 w-full px-8">
              <button
                onClick={() => { setMobileOpen(false); onSignUp(); }}
                className="text-[15px] font-medium text-white w-full py-3 rounded-lg"
                style={{ backgroundColor: '#F97316' }}
              >
                Start free
              </button>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
