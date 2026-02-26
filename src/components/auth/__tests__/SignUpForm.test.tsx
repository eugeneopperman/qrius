import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { SignUpForm } from '../SignUpForm';

// --- Mocks ---

const mockSignUp = vi.fn();
const mockSignInWithOAuth = vi.fn();
let mockIsLoading = false;

vi.mock('@/stores/authStore', () => ({
  useAuthStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      signUp: mockSignUp,
      signInWithOAuth: mockSignInWithOAuth,
      isLoading: mockIsLoading,
    }),
}));

vi.mock('zustand/react/shallow', () => ({
  useShallow: (fn: unknown) => fn,
}));

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
  Link: ({ children, to, ...props }: Record<string, unknown>) => (
    <a href={to as string} {...props}>{children as React.ReactNode}</a>
  ),
}));

vi.mock('../OAuthButtons', () => ({
  OAuthButtons: ({ disabled }: { disabled?: boolean }) => (
    <div data-testid="oauth-buttons" data-disabled={disabled} />
  ),
}));

// --- Helpers ---

const defaultProps = {
  onSignIn: vi.fn(),
};

function renderSignUp(props = {}) {
  return render(<SignUpForm {...defaultProps} {...props} />);
}

// --- Tests ---

describe('SignUpForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsLoading = false;
    mockSignUp.mockResolvedValue({ error: null });
    mockSignInWithOAuth.mockResolvedValue({ error: null });
  });

  it('renders "Create your account" heading', () => {
    renderSignUp();
    expect(screen.getByRole('heading', { name: /create your account/i })).toBeInTheDocument();
  });

  it('renders subtitle text', () => {
    renderSignUp();
    expect(screen.getByText('Start creating trackable QR codes today')).toBeInTheDocument();
  });

  it('renders name input field with optional hint', () => {
    renderSignUp();
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByText('Optional')).toBeInTheDocument();
  });

  it('renders email input field', () => {
    renderSignUp();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('renders password input field with hint', () => {
    renderSignUp();
    // There are two password fields; find by label text
    const passwordFields = screen.getAllByLabelText(/password/i);
    expect(passwordFields.length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('At least 8 characters')).toBeInTheDocument();
  });

  it('renders confirm password input field', () => {
    renderSignUp();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it('renders create account button', () => {
    renderSignUp();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('renders sign in link', () => {
    renderSignUp();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('calls onSignIn when sign in link is clicked', async () => {
    const user = userEvent.setup();
    renderSignUp();
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    expect(defaultProps.onSignIn).toHaveBeenCalledOnce();
  });

  it('renders OAuth buttons', () => {
    renderSignUp();
    expect(screen.getByTestId('oauth-buttons')).toBeInTheDocument();
  });

  it('renders terms and privacy policy links', () => {
    renderSignUp();
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
  });

  it('submits and calls signUp with email, password, and name', async () => {
    const user = userEvent.setup();
    renderSignUp();

    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    // Type into password fields in order
    const passwordFields = screen.getAllByPlaceholderText('••••••••');
    await user.type(passwordFields[0], 'password123');
    await user.type(passwordFields[1], 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith('john@example.com', 'password123', 'John Doe');
    });
  });

  it('calls signUp with undefined name when name is empty', async () => {
    const user = userEvent.setup();
    renderSignUp();

    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    const passwordFields = screen.getAllByPlaceholderText('••••••••');
    await user.type(passwordFields[0], 'password123');
    await user.type(passwordFields[1], 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith('john@example.com', 'password123', undefined);
    });
  });

  it('shows error for password mismatch', async () => {
    const user = userEvent.setup();
    renderSignUp();

    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    const passwordFields = screen.getAllByPlaceholderText('••••••••');
    await user.type(passwordFields[0], 'password123');
    await user.type(passwordFields[1], 'differentpass');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('shows error for short password (less than 8 chars)', async () => {
    const user = userEvent.setup();
    renderSignUp();

    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    const passwordFields = screen.getAllByPlaceholderText('••••••••');
    await user.type(passwordFields[0], 'short');
    await user.type(passwordFields[1], 'short');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    });
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('does not submit when required fields are empty', async () => {
    const user = userEvent.setup();
    renderSignUp();

    await user.click(screen.getByRole('button', { name: /create account/i }));

    // The email and password inputs have the required attribute,
    // so the form won't submit with empty fields (native or JS validation)
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('has required attribute on email and password fields', () => {
    renderSignUp();
    expect(screen.getByLabelText(/email/i)).toBeRequired();
    const passwordFields = screen.getAllByPlaceholderText('••••••••');
    expect(passwordFields[0]).toBeRequired();
    expect(passwordFields[1]).toBeRequired();
  });

  it('shows success screen after successful signup', async () => {
    const user = userEvent.setup();
    renderSignUp();

    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    const passwordFields = screen.getAllByPlaceholderText('••••••••');
    await user.type(passwordFields[0], 'password123');
    await user.type(passwordFields[1], 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /check your email/i })).toBeInTheDocument();
    });
    expect(screen.getByText(/we've sent a confirmation link/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /back to sign in/i })).toBeInTheDocument();
  });

  it('shows error message when signUp API fails', async () => {
    mockSignUp.mockResolvedValue({ error: { message: 'Email already registered' } });
    const user = userEvent.setup();
    renderSignUp();

    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    const passwordFields = screen.getAllByPlaceholderText('••••••••');
    await user.type(passwordFields[0], 'password123');
    await user.type(passwordFields[1], 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText('Email already registered')).toBeInTheDocument();
    });
  });
});
