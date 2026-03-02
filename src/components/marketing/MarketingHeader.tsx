import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Menu, X } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

interface NavLink {
  label: string;
  /** Hash anchor (e.g. '#features') for same-page scroll */
  hash?: string;
  /** Callback action instead of scroll (e.g. open auth modal) */
  action?: 'signin';
}

const navLinks: NavLink[] = [
  { label: 'Features', hash: '#features' },
  { label: 'Pricing', hash: '#pricing' },
  { label: 'Use Cases', hash: '#use-cases' },
  { label: 'Sign In', action: 'signin' },
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
      document.querySelector(link.hash)?.scrollIntoView({ behavior: 'smooth' });
    }
    if (link.action === 'signin') {
      onSignIn();
    }
  };

  return (
    <>
      <header
        className="sticky top-0 z-50 border-b"
        style={{ backgroundColor: '#FAFAF8', borderColor: '#E8E6E3' }}
      >
        <div
          className="mx-auto flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8"
          style={{ maxWidth: 1200 }}
        >
          <Link to="/" className="flex items-center gap-2">
            <Logo size="sm" showText className="[&_span]:!text-gray-900" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link)}
                className="marketing-nav-link"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center">
            <button onClick={onSignUp} className="marketing-btn-primary" style={{ padding: '10px 20px', fontSize: 15 }}>
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
        <div className="fixed inset-0 z-40 flex flex-col pt-16" style={{ backgroundColor: '#FAFAF8' }}>
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
                className="marketing-btn-primary w-full"
                style={{ padding: '12px 20px' }}
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
