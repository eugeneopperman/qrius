import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/test-utils';
import SignUpPage from '../SignUpPage';

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

// Mock sign up form component
vi.mock('@/components/auth/SignUpForm', () => ({
  SignUpForm: () => <div data-testid="signup-form" />,
}));

// Mock Logo
vi.mock('@/components/ui/Logo', () => ({
  Logo: ({ size }: any) => <div data-testid="logo">Qrius ({size})</div>,
}));

describe('SignUpPage', () => {
  it('renders sign up form', () => {
    render(<SignUpPage />);
    expect(screen.getByTestId('signup-form')).toBeInTheDocument();
  });

  it('renders the logo with link to home', () => {
    render(<SignUpPage />);
    const logo = screen.getByTestId('logo');
    expect(logo).toBeInTheDocument();
    const homeLink = logo.closest('a');
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('renders theme toggle button with aria-label', () => {
    render(<SignUpPage />);
    expect(screen.getByRole('button', { name: /cycle theme/i })).toBeInTheDocument();
  });

  it('renders footer with "Already have an account?" and sign in link', () => {
    render(<SignUpPage />);
    expect(screen.getByText(/already have an account\?/i)).toBeInTheDocument();
    const signInLink = screen.getByRole('link', { name: /sign in/i });
    expect(signInLink).toBeInTheDocument();
    expect(signInLink).toHaveAttribute('href', '/signin');
  });

  it('renders left-side gradient panel with heading', () => {
    render(<SignUpPage />);
    expect(screen.getByText(/start creating qr codes for free/i)).toBeInTheDocument();
  });

  it('renders feature list with all 6 features', () => {
    render(<SignUpPage />);
    const features = [
      'Create unlimited QR codes',
      'Track scans in real-time',
      'Customize colors and styles',
      'Add your logo and branding',
      'Export in multiple formats',
      'Team collaboration',
    ];
    for (const feature of features) {
      expect(screen.getByText(feature)).toBeInTheDocument();
    }
  });

  it('renders free tier info in gradient panel', () => {
    render(<SignUpPage />);
    expect(screen.getByText(/free forever includes/i)).toBeInTheDocument();
  });
});
