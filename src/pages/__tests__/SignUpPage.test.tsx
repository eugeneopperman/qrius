import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/test-utils';
import SignUpPage from '../SignUpPage';

// Mock TanStack Router
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
  useSearch: () => ({}),
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
}));

// Mock MarketingLayout
vi.mock('@/components/marketing/MarketingLayout', () => ({
  MarketingLayout: ({ children, onSignUp }: any) => (
    <div data-testid="marketing-layout">
      <header data-testid="marketing-header">
        <button data-testid="sign-up-trigger" onClick={onSignUp}>Start free</button>
      </header>
      <main>{children}</main>
      <footer data-testid="marketing-footer" />
    </div>
  ),
}));

// Mock sign up form component
vi.mock('@/components/auth/SignUpForm', () => ({
  SignUpForm: () => <div data-testid="signup-form" />,
}));

describe('SignUpPage', () => {
  it('renders within MarketingLayout', () => {
    render(<SignUpPage />);
    expect(screen.getByTestId('marketing-layout')).toBeInTheDocument();
    expect(screen.getByTestId('marketing-header')).toBeInTheDocument();
    expect(screen.getByTestId('marketing-footer')).toBeInTheDocument();
  });

  it('renders sign up form', () => {
    render(<SignUpPage />);
    expect(screen.getByTestId('signup-form')).toBeInTheDocument();
  });
});
