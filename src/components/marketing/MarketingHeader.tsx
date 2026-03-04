import { useState, useEffect, useRef } from 'react';
import { Link } from '@tanstack/react-router';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

interface NavLink {
  label: string;
  /** Route path (e.g. '/features') for page navigation */
  href?: string;
  /** Hash anchor (e.g. '#use-cases') for same-page scroll */
  hash?: string;
  /** Dropdown children */
  children?: { label: string; href: string }[];
}

const useCaseDropdown = [
  { label: 'Restaurants', href: '/use-cases/restaurants' },
  { label: 'Retail', href: '/use-cases/retail' },
  { label: 'Events', href: '/use-cases/events' },
  { label: 'Real Estate', href: '/use-cases/real-estate' },
  { label: 'Agencies', href: '/use-cases/agencies' },
  { label: 'Education', href: '/use-cases/education' },
  { label: 'Healthcare', href: '/use-cases/healthcare' },
];

const navLinks: NavLink[] = [
  { label: 'Features', href: '/features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Use Cases', href: '/use-cases', children: useCaseDropdown },
  { label: 'Blog', href: '/blog' },
  { label: 'Sign In', href: '/signin' },
];

interface MarketingHeaderProps {
  onSignUp: () => void;
}

export function MarketingHeader({ onSignUp }: MarketingHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  // Hide header on scroll down, show on scroll up (mobile only)
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastScrollY.current;
      // Only hide after scrolling down past 60px, show immediately on scroll up
      if (delta > 0 && y > 60) {
        setHeaderHidden(true);
      } else if (delta < 0) {
        setHeaderHidden(false);
      }
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [mobileOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  const handleNavClick = (link: NavLink) => {
    setMobileOpen(false);
    if (link.hash) {
      document.querySelector(link.hash)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const renderNavItem = (link: NavLink) => {
    if (link.children) {
      return (
        <div key={link.label} className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="marketing-nav-link inline-flex items-center gap-1"
          >
            {link.label}
            <ChevronDown
              className="w-3.5 h-3.5 transition-transform"
              style={{ transform: dropdownOpen ? 'rotate(180deg)' : undefined }}
            />
          </button>
          {dropdownOpen && (
            <div
              className="absolute top-full left-1/2 -translate-x-1/2 mt-2 py-2 rounded-xl shadow-lg border"
              style={{ backgroundColor: '#ffffff', borderColor: '#E8E6E3', minWidth: 180 }}
            >
              <Link
                to={link.href as string}
                onClick={() => setDropdownOpen(false)}
                className="block px-4 py-2 text-sm font-semibold transition-colors"
                style={{ color: '#1A1A1A' }}
              >
                All Use Cases
              </Link>
              <div className="my-1" style={{ borderTop: '1px solid #E8E6E3' }} />
              {link.children.map((child) => (
                <Link
                  key={child.label}
                  to={child.href as string}
                  onClick={() => setDropdownOpen(false)}
                  className="block px-4 py-2 text-sm transition-colors hover:bg-[#FFF3E8]"
                  style={{ color: '#4A4A4A' }}
                >
                  {child.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }
    if (link.href) {
      return (
        <Link
          key={link.label}
          to={link.href as string}
          className="marketing-nav-link"
        >
          {link.label}
        </Link>
      );
    }
    return (
      <button
        key={link.label}
        onClick={() => handleNavClick(link)}
        className="marketing-nav-link"
      >
        {link.label}
      </button>
    );
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b transition-transform duration-300 ${
          headerHidden && !mobileOpen ? '-translate-y-[200%] md:translate-y-0' : 'translate-y-0'
        }`}
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
            {navLinks.map(renderNavItem)}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center">
            <button onClick={onSignUp} className="marketing-btn-primary" style={{ padding: '10px 20px', fontSize: 15 }}>
              Start free
            </button>
          </div>

          {/* Mobile hamburger — 44px min touch target */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex items-center justify-center w-11 h-11 -mr-2"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
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
        <div className="fixed inset-0 z-40 flex flex-col pt-16 overflow-y-auto" style={{ backgroundColor: '#FAFAF8' }}>
          <nav aria-label="Mobile navigation" className="flex flex-col items-center gap-6 pt-12 pb-8">
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.label} className="flex flex-col items-center gap-3">
                  <Link
                    to={link.href as string}
                    onClick={() => setMobileOpen(false)}
                    className="text-xl font-medium"
                    style={{ color: '#1A1A1A' }}
                  >
                    {link.label}
                  </Link>
                  <div className="flex flex-wrap justify-center gap-2 px-4">
                    {link.children.map((child) => (
                      <Link
                        key={child.label}
                        to={child.href as string}
                        onClick={() => setMobileOpen(false)}
                        className="px-3 py-1.5 rounded-full text-sm transition-colors"
                        style={{ color: '#4A4A4A', backgroundColor: '#F5F4F2', border: '1px solid #E8E6E3' }}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : link.href ? (
                <Link
                  key={link.label}
                  to={link.href as string}
                  onClick={() => setMobileOpen(false)}
                  className="text-xl font-medium"
                  style={{ color: '#1A1A1A' }}
                >
                  {link.label}
                </Link>
              ) : (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link)}
                  className="text-xl font-medium"
                  style={{ color: '#1A1A1A' }}
                >
                  {link.label}
                </button>
              )
            )}
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
