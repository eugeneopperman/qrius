import { type ReactNode } from 'react';
import { MarketingHeader } from './MarketingHeader';
import { MarketingFooter } from './MarketingFooter';

interface MarketingLayoutProps {
  children: ReactNode;
  onSignUp: () => void;
}

/**
 * Wrapper for marketing pages.
 * Overrides the app's glassmorphism background with a clean Snow (#FAFAF8) surface.
 */
export function MarketingLayout({ children, onSignUp }: MarketingLayoutProps) {
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: '#FAFAF8',
        color: '#1A1A1A',
        /* Hide the app's glass mesh background */
      }}
    >
      {/* Cover the body::before decorative shapes */}
      <div className="fixed inset-0 z-0" style={{ backgroundColor: '#FAFAF8' }} />

      <div className="relative z-[1]">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:rounded-md focus:bg-white focus:text-[#1A1A1A] focus:shadow-lg focus:outline-2 focus:outline-[#F97316]"
        >
          Skip to content
        </a>
        <MarketingHeader onSignUp={onSignUp} />
        <main id="main-content">{children}</main>
        <MarketingFooter />
      </div>
    </div>
  );
}
