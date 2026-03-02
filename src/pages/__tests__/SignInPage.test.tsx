import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/test-utils';
import SignInPage from '../SignInPage';

// Mock TanStack Router
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
  useSearch: () => ({}),
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
}));

// Mock MarketingLayout to render children with header/footer markers
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

// Mock auth form components
vi.mock('@/components/auth/SignInForm', () => ({
  SignInForm: (props: any) => (
    <div data-testid="signin-form">
      <button onClick={props.onForgotPassword}>Forgot?</button>
      <button onClick={props.onSignUp}>Sign up</button>
    </div>
  ),
}));

vi.mock('@/components/auth/ForgotPasswordForm', () => ({
  ForgotPasswordForm: (props: any) => (
    <div data-testid="forgot-password-form">
      <button onClick={props.onBack}>Back</button>
    </div>
  ),
}));

describe('SignInPage', () => {
  it('renders within MarketingLayout', () => {
    render(<SignInPage />);
    expect(screen.getByTestId('marketing-layout')).toBeInTheDocument();
    expect(screen.getByTestId('marketing-header')).toBeInTheDocument();
    expect(screen.getByTestId('marketing-footer')).toBeInTheDocument();
  });

  it('renders sign in form by default', () => {
    render(<SignInPage />);
    expect(screen.getByTestId('signin-form')).toBeInTheDocument();
  });

  it('switches to forgot password view when triggered', async () => {
    const { user } = render(<SignInPage />);
    await user.click(screen.getByText('Forgot?'));
    expect(screen.getByTestId('forgot-password-form')).toBeInTheDocument();
    expect(screen.queryByTestId('signin-form')).not.toBeInTheDocument();
  });

  it('switches back to sign in from forgot password view', async () => {
    const { user } = render(<SignInPage />);
    await user.click(screen.getByText('Forgot?'));
    expect(screen.getByTestId('forgot-password-form')).toBeInTheDocument();

    await user.click(screen.getByText('Back'));
    expect(screen.getByTestId('signin-form')).toBeInTheDocument();
    expect(screen.queryByTestId('forgot-password-form')).not.toBeInTheDocument();
  });
});
