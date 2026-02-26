import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { ForgotPasswordForm } from '../ForgotPasswordForm';

// --- Mocks ---

const mockResetPassword = vi.fn();

vi.mock('@/stores/authStore', () => ({
  useAuthStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      resetPassword: mockResetPassword,
    }),
}));

vi.mock('zustand/react/shallow', () => ({
  useShallow: (fn: unknown) => fn,
}));

// --- Helpers ---

const defaultProps = {
  onBack: vi.fn(),
};

function renderForgotPassword(props = {}) {
  return render(<ForgotPasswordForm {...defaultProps} {...props} />);
}

// --- Tests ---

describe('ForgotPasswordForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockResetPassword.mockResolvedValue({ error: null });
  });

  it('renders "Reset your password" heading', () => {
    renderForgotPassword();
    expect(screen.getByRole('heading', { name: /reset your password/i })).toBeInTheDocument();
  });

  it('renders subtitle text', () => {
    renderForgotPassword();
    expect(screen.getByText(/enter your email and we'll send you a reset link/i)).toBeInTheDocument();
  });

  it('renders email input field', () => {
    renderForgotPassword();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('renders send reset link button', () => {
    renderForgotPassword();
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
  });

  it('renders back to sign in link', () => {
    renderForgotPassword();
    expect(screen.getByRole('button', { name: /back to sign in/i })).toBeInTheDocument();
  });

  it('calls onBack when back to sign in is clicked', async () => {
    const user = userEvent.setup();
    renderForgotPassword();
    await user.click(screen.getByRole('button', { name: /back to sign in/i }));
    expect(defaultProps.onBack).toHaveBeenCalledOnce();
  });

  it('submits and calls resetPassword with email', async () => {
    const user = userEvent.setup();
    renderForgotPassword();

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith('test@example.com');
    });
  });

  it('shows success screen after successful reset', async () => {
    const user = userEvent.setup();
    renderForgotPassword();

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /check your email/i })).toBeInTheDocument();
    });
    expect(screen.getByText(/we've sent password reset instructions/i)).toBeInTheDocument();
  });

  it('shows error message when resetPassword fails', async () => {
    mockResetPassword.mockResolvedValue({ error: { message: 'User not found' } });
    const user = userEvent.setup();
    renderForgotPassword();

    await user.type(screen.getByLabelText(/email/i), 'unknown@example.com');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByText('User not found')).toBeInTheDocument();
    });
  });

  it('shows validation error when email is empty', async () => {
    const user = userEvent.setup();
    renderForgotPassword();

    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    await waitFor(() => {
      expect(screen.getByText('Please enter your email address')).toBeInTheDocument();
    });
    expect(mockResetPassword).not.toHaveBeenCalled();
  });

  it('does not call resetPassword when email is empty', async () => {
    const user = userEvent.setup();
    renderForgotPassword();

    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    expect(mockResetPassword).not.toHaveBeenCalled();
  });
});
