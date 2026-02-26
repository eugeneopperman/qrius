import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/test-utils';
import SignInPage from '../SignInPage';

// Mock TanStack Router
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
  useSearch: () => ({}),
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
}));

// Mock themeStore
vi.mock('@/stores/themeStore', () => ({
  useThemeStore: () => ({
    resolvedTheme: 'warm',
    cycleTheme: vi.fn(),
  }),
}));

// Mock auth form components
vi.mock('@/components/auth/SignInForm', () => ({
  SignInForm: (props: any) => (
    <div data-testid="signin-form">
      <button onClick={props.onForgotPassword}>Forgot?</button>
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

// Mock Logo
vi.mock('@/components/ui/Logo', () => ({
  Logo: ({ size }: any) => <div data-testid="logo">Qrius ({size})</div>,
}));

describe('SignInPage', () => {
  it('renders sign in form by default', () => {
    render(<SignInPage />);
    expect(screen.getByTestId('signin-form')).toBeInTheDocument();
  });

  it('renders the logo with link to home', () => {
    render(<SignInPage />);
    const logo = screen.getByTestId('logo');
    expect(logo).toBeInTheDocument();
    // Logo is wrapped in a Link to "/"
    const homeLink = logo.closest('a');
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('renders theme toggle button with aria-label', () => {
    render(<SignInPage />);
    expect(screen.getByRole('button', { name: /cycle theme/i })).toBeInTheDocument();
  });

  it('renders footer with "Don\'t have an account?" and sign up link', () => {
    render(<SignInPage />);
    expect(screen.getByText(/don't have an account\?/i)).toBeInTheDocument();
    const signUpLink = screen.getByRole('link', { name: /sign up/i });
    expect(signUpLink).toBeInTheDocument();
    expect(signUpLink).toHaveAttribute('href', '/signup');
  });

  it('renders the right-side gradient panel with marketing text', () => {
    render(<SignInPage />);
    expect(screen.getByText(/create trackable qr codes in seconds/i)).toBeInTheDocument();
    expect(screen.getByText(/10M\+/)).toBeInTheDocument();
    expect(screen.getByText(/50K\+/)).toBeInTheDocument();
  });

  it('switches to forgot password view when triggered', async () => {
    const { user } = render(<SignInPage />);
    // Click the mocked "Forgot?" button inside SignInForm
    await user.click(screen.getByText('Forgot?'));
    expect(screen.getByTestId('forgot-password-form')).toBeInTheDocument();
    expect(screen.queryByTestId('signin-form')).not.toBeInTheDocument();
  });

  it('switches back to sign in from forgot password view', async () => {
    const { user } = render(<SignInPage />);
    // Go to forgot password
    await user.click(screen.getByText('Forgot?'));
    expect(screen.getByTestId('forgot-password-form')).toBeInTheDocument();

    // Go back
    await user.click(screen.getByText('Back'));
    expect(screen.getByTestId('signin-form')).toBeInTheDocument();
    expect(screen.queryByTestId('forgot-password-form')).not.toBeInTheDocument();
  });
});
