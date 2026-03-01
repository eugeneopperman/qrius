import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@/test/test-utils';
import HomePage from '../HomePage';

// Mock TanStack Router
const mockNavigate = vi.fn();
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
  useSearch: () => ({}),
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
}));

// Mock marketing layout children
vi.mock('@/components/marketing/MarketingLayout', () => ({
  MarketingLayout: ({ children, onSignIn, onSignUp }: any) => (
    <div data-testid="marketing-layout">
      <button data-testid="sign-in-trigger" onClick={onSignIn}>Sign In</button>
      <button data-testid="sign-up-trigger" onClick={onSignUp}>Sign Up</button>
      <main>{children}</main>
    </div>
  ),
}));

vi.mock('@/components/marketing/MarketingSection', () => ({
  MarketingSection: ({ children, ...props }: any) => <section {...props}>{children}</section>,
}));

vi.mock('@/components/marketing/FeatureCard', () => ({
  FeatureCard: ({ headline }: any) => <div data-testid="feature-card">{headline}</div>,
}));

vi.mock('@/components/marketing/StepCard', () => ({
  StepCard: ({ title }: any) => <div data-testid="step-card">{title}</div>,
}));

vi.mock('@/components/marketing/ComparisonTable', () => ({
  ComparisonTable: () => <div data-testid="comparison-table" />,
}));

vi.mock('@/components/marketing/CTASection', () => ({
  CTASection: ({ primaryAction }: any) => (
    <div data-testid="cta-section">
      <button data-testid="cta-primary" onClick={primaryAction}>CTA</button>
    </div>
  ),
}));

vi.mock('@/components/auth/AuthModal', () => ({
  AuthModal: ({ isOpen, onClose, onAuthSuccess, defaultView }: any) =>
    isOpen ? (
      <div data-testid="auth-modal" data-view={defaultView}>
        <button data-testid="close-modal" onClick={onClose}>Close</button>
        <button data-testid="auth-success" onClick={onAuthSuccess}>Sign In Success</button>
      </div>
    ) : null,
}));

vi.mock('@/hooks/useScrollReveal', () => ({
  useScrollReveal: () => ({ current: null }),
}));

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the marketing layout', () => {
    render(<HomePage />);
    expect(screen.getByTestId('marketing-layout')).toBeInTheDocument();
  });

  it('renders the main content area', () => {
    render(<HomePage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('renders the hero headline', () => {
    render(<HomePage />);
    expect(screen.getByText(/QR codes that people actually want to scan/)).toBeInTheDocument();
  });

  it('does not show auth modal initially', () => {
    render(<HomePage />);
    expect(screen.queryByTestId('auth-modal')).not.toBeInTheDocument();
  });

  it('opens auth modal in signup mode when Sign Up is clicked', () => {
    render(<HomePage />);
    fireEvent.click(screen.getByTestId('sign-up-trigger'));
    expect(screen.getByTestId('auth-modal')).toBeInTheDocument();
    expect(screen.getByTestId('auth-modal')).toHaveAttribute('data-view', 'signup');
  });

  it('opens auth modal in signin mode when Sign In is clicked', () => {
    render(<HomePage />);
    fireEvent.click(screen.getByTestId('sign-in-trigger'));
    expect(screen.getByTestId('auth-modal')).toBeInTheDocument();
    expect(screen.getByTestId('auth-modal')).toHaveAttribute('data-view', 'signin');
  });

  it('closes auth modal when close button is clicked', () => {
    render(<HomePage />);
    fireEvent.click(screen.getByTestId('sign-up-trigger'));
    expect(screen.getByTestId('auth-modal')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('close-modal'));
    expect(screen.queryByTestId('auth-modal')).not.toBeInTheDocument();
  });

  it('navigates to /dashboard on auth success', () => {
    render(<HomePage />);
    fireEvent.click(screen.getByTestId('sign-up-trigger'));
    fireEvent.click(screen.getByTestId('auth-success'));
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/dashboard' });
  });

  it('opens auth modal from bottom CTA', () => {
    render(<HomePage />);
    fireEvent.click(screen.getByTestId('cta-primary'));
    expect(screen.getByTestId('auth-modal')).toBeInTheDocument();
  });

  it('renders 4 feature cards', () => {
    render(<HomePage />);
    expect(screen.getAllByTestId('feature-card')).toHaveLength(4);
  });

  it('renders 3 step cards', () => {
    render(<HomePage />);
    expect(screen.getAllByTestId('step-card')).toHaveLength(3);
  });

  it('renders the comparison table', () => {
    render(<HomePage />);
    expect(screen.getByTestId('comparison-table')).toBeInTheDocument();
  });
});
