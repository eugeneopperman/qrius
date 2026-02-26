import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/test-utils';
import HomePage from '../HomePage';

// Mock TanStack Router
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
  useSearch: () => ({}),
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
}));

// Mock heavy child components
vi.mock('@/components/Header', () => ({
  Header: () => <div data-testid="header" />,
}));

vi.mock('@/components/wizard', () => ({
  WizardContainer: () => <div data-testid="wizard-container" />,
}));

vi.mock('@/components/layout/PublicFooter', () => ({
  PublicFooter: () => <div data-testid="public-footer" />,
}));

vi.mock('@/components/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: any) => <div data-testid="error-boundary">{children}</div>,
}));

// Mock stores
const mockUser = vi.fn<() => any>(() => null);

vi.mock('@/stores/authStore', () => ({
  useAuthStore: (selector: any) => selector({ user: mockUser() }),
}));

vi.mock('@/stores/themeStore', () => ({
  useThemeStore: (selector: any) => selector({ cycleTheme: vi.fn() }),
}));

vi.mock('@/stores/templateStore', () => ({
  useTemplateStore: () => ({ openWizard: vi.fn() }),
}));

vi.mock('@/stores/uiStore', () => ({
  useUIStore: () => ({ openShortcuts: vi.fn(), openSettings: vi.fn() }),
}));

vi.mock('@/hooks/useKeyboardShortcuts', () => ({
  useKeyboardShortcuts: vi.fn(),
}));

describe('HomePage', () => {
  beforeEach(() => {
    mockUser.mockReturnValue(null);
  });

  it('renders the header', () => {
    render(<HomePage />);
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('renders the wizard container', () => {
    render(<HomePage />);
    expect(screen.getByTestId('wizard-container')).toBeInTheDocument();
  });

  it('renders the public footer', () => {
    render(<HomePage />);
    expect(screen.getByTestId('public-footer')).toBeInTheDocument();
  });

  it('shows CTA banner when user is not authenticated', () => {
    render(<HomePage />);
    expect(screen.getByText(/track your qr code scans/i)).toBeInTheDocument();
    expect(screen.getByText(/get started free/i)).toBeInTheDocument();
  });

  it('CTA banner links to /signup', () => {
    render(<HomePage />);
    const signupLink = screen.getByText(/get started free/i).closest('a');
    expect(signupLink).toHaveAttribute('href', '/signup');
  });

  it('hides CTA banner when user is authenticated', () => {
    mockUser.mockReturnValue({ id: 'user-1', email: 'test@example.com' });
    render(<HomePage />);
    expect(screen.queryByText(/track your qr code scans/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/get started free/i)).not.toBeInTheDocument();
  });

  it('renders the main content area', () => {
    render(<HomePage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
