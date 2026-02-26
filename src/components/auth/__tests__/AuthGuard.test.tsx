import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { AuthGuard } from '../AuthGuard';

// --- Mocks ---

let mockUser: Record<string, unknown> | null = null;
let mockIsLoading = false;
let mockIsInitialized = true;

vi.mock('@/stores/authStore', () => ({
  useAuthStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      get user() { return mockUser; },
      get isLoading() { return mockIsLoading; },
      get isInitialized() { return mockIsInitialized; },
    }),
}));

vi.mock('zustand/react/shallow', () => ({
  useShallow: (fn: unknown) => fn,
}));

// Mock window.location.href for redirect tests
const originalLocation = window.location;

beforeEach(() => {
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { ...originalLocation, href: '' },
  });
});

afterAll(() => {
  Object.defineProperty(window, 'location', {
    writable: true,
    value: originalLocation,
  });
});

// Need to import afterAll
import { afterAll } from 'vitest';

// --- Tests ---

describe('AuthGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = null;
    mockIsLoading = false;
    mockIsInitialized = true;
  });

  it('renders children when user is authenticated', () => {
    mockUser = { id: 'user-1', email: 'test@example.com' };
    render(
      <AuthGuard>
        <div data-testid="protected-content">Protected Content</div>
      </AuthGuard>
    );
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('does not render children when user is null', () => {
    mockUser = null;
    render(
      <AuthGuard>
        <div data-testid="protected-content">Protected Content</div>
      </AuthGuard>
    );
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('renders fallback when user is null and fallback is provided', () => {
    mockUser = null;
    render(
      <AuthGuard fallback={<div data-testid="fallback">Please sign in</div>}>
        <div data-testid="protected-content">Protected Content</div>
      </AuthGuard>
    );
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.getByTestId('fallback')).toBeInTheDocument();
    expect(screen.getByText('Please sign in')).toBeInTheDocument();
  });

  it('shows loading spinner when not initialized', () => {
    mockIsInitialized = false;
    const { container } = render(
      <AuthGuard>
        <div data-testid="protected-content">Protected Content</div>
      </AuthGuard>
    );
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    // The loader uses Loader2 which renders an SVG with animate-spin class
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('shows loading spinner when isLoading is true', () => {
    mockIsLoading = true;
    const { container } = render(
      <AuthGuard>
        <div data-testid="protected-content">Protected Content</div>
      </AuthGuard>
    );
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('redirects when user is null and redirectTo is provided', () => {
    mockUser = null;
    render(
      <AuthGuard redirectTo="/signin">
        <div data-testid="protected-content">Protected Content</div>
      </AuthGuard>
    );
    expect(window.location.href).toBe('/signin');
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('does not redirect when user is authenticated even if redirectTo is provided', () => {
    mockUser = { id: 'user-1', email: 'test@example.com' };
    render(
      <AuthGuard redirectTo="/signin">
        <div data-testid="protected-content">Protected Content</div>
      </AuthGuard>
    );
    expect(window.location.href).not.toBe('/signin');
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('shows spinner (not fallback) when redirecting', () => {
    mockUser = null;
    const { container } = render(
      <AuthGuard redirectTo="/signin" fallback={<div data-testid="fallback">Fallback</div>}>
        <div>Protected</div>
      </AuthGuard>
    );
    // When redirectTo is set and user is null, spinner is shown (not fallback)
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
    expect(screen.queryByTestId('fallback')).not.toBeInTheDocument();
  });
});
