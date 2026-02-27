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

// Mock heavy child components
vi.mock('@/components/Header', () => ({
  Header: () => <div data-testid="header" />,
}));

vi.mock('@/components/landing/LandingTypeGrid', () => ({
  LandingTypeGrid: ({ onSelect }: { onSelect: (id: string) => void }) => (
    <div data-testid="landing-type-grid">
      <button data-testid="type-url" onClick={() => onSelect('url')}>URL</button>
    </div>
  ),
}));

vi.mock('@/components/auth/AuthModal', () => ({
  AuthModal: ({ isOpen, onClose, onAuthSuccess }: any) =>
    isOpen ? (
      <div data-testid="auth-modal">
        <button data-testid="close-modal" onClick={onClose}>Close</button>
        <button data-testid="auth-success" onClick={onAuthSuccess}>Sign In Success</button>
      </div>
    ) : null,
}));

vi.mock('@/components/layout/PublicFooter', () => ({
  PublicFooter: () => <div data-testid="public-footer" />,
}));

// Mock stores
vi.mock('@/stores/uiStore', () => ({
  useUIStore: () => ({ openShortcuts: vi.fn(), openSettings: vi.fn() }),
}));

const mockSetActiveType = vi.fn();
const mockMarkCompleted = vi.fn();
const mockGoToStep = vi.fn();

vi.mock('@/stores/qrStore', () => ({
  useQRStore: Object.assign(
    (selector: any) => selector({ setActiveType: mockSetActiveType }),
    { getState: () => ({ setActiveType: mockSetActiveType }) }
  ),
}));

vi.mock('@/stores/wizardStore', () => ({
  useWizardStore: Object.assign(
    (selector: any) => selector({ markCompleted: mockMarkCompleted, goToStep: mockGoToStep }),
    { getState: () => ({ markCompleted: mockMarkCompleted, goToStep: mockGoToStep }) }
  ),
}));

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('renders the header', () => {
    render(<HomePage />);
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('renders the landing type grid', () => {
    render(<HomePage />);
    expect(screen.getByTestId('landing-type-grid')).toBeInTheDocument();
  });

  it('renders the public footer', () => {
    render(<HomePage />);
    expect(screen.getByTestId('public-footer')).toBeInTheDocument();
  });

  it('renders the main content area', () => {
    render(<HomePage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('does not show auth modal initially', () => {
    render(<HomePage />);
    expect(screen.queryByTestId('auth-modal')).not.toBeInTheDocument();
  });

  it('opens auth modal when a type card is clicked', () => {
    render(<HomePage />);
    fireEvent.click(screen.getByTestId('type-url'));
    expect(screen.getByTestId('auth-modal')).toBeInTheDocument();
  });

  it('stores pending type in sessionStorage on type select', () => {
    render(<HomePage />);
    fireEvent.click(screen.getByTestId('type-url'));
    expect(sessionStorage.getItem('pendingQRType')).toBe('url');
  });

  it('closes auth modal when close button is clicked', () => {
    render(<HomePage />);
    fireEvent.click(screen.getByTestId('type-url'));
    expect(screen.getByTestId('auth-modal')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('close-modal'));
    expect(screen.queryByTestId('auth-modal')).not.toBeInTheDocument();
  });

  it('navigates to /create on auth success', () => {
    render(<HomePage />);
    fireEvent.click(screen.getByTestId('type-url'));
    fireEvent.click(screen.getByTestId('auth-success'));
    expect(mockNavigate).toHaveBeenCalledWith({ to: '/create' });
  });

  it('sets active type and wizard step on auth success', () => {
    render(<HomePage />);
    fireEvent.click(screen.getByTestId('type-url'));
    fireEvent.click(screen.getByTestId('auth-success'));
    expect(mockSetActiveType).toHaveBeenCalledWith('url');
    expect(mockMarkCompleted).toHaveBeenCalledWith(1);
    expect(mockGoToStep).toHaveBeenCalledWith(2);
  });

  it('clears sessionStorage on auth success', () => {
    render(<HomePage />);
    fireEvent.click(screen.getByTestId('type-url'));
    expect(sessionStorage.getItem('pendingQRType')).toBe('url');
    fireEvent.click(screen.getByTestId('auth-success'));
    expect(sessionStorage.getItem('pendingQRType')).toBeNull();
  });
});
