import { type ReactNode } from 'react';
import { MarketingHeader } from './MarketingHeader';
import { MarketingFooter } from './MarketingFooter';

interface MarketingLayoutProps {
  children: ReactNode;
  onSignIn: () => void;
  onSignUp: () => void;
}

/**
 * Wrapper for marketing pages.
 * Overrides the app's glassmorphism background with a clean Snow (#FAFAF8) surface.
 */
export function MarketingLayout({ children, onSignIn, onSignUp }: MarketingLayoutProps) {
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
        <MarketingHeader onSignIn={onSignIn} onSignUp={onSignUp} />
        <main>{children}</main>
        <MarketingFooter />
      </div>
    </div>
  );
}
