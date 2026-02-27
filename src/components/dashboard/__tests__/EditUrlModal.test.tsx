import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { EditUrlModal } from '../EditUrlModal';

// Mock useFocusTrap (uses requestAnimationFrame which complicates tests)
vi.mock('@/hooks/useFocusTrap', () => ({
  useFocusTrap: vi.fn(),
}));

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onSubmit: vi.fn().mockResolvedValue(undefined),
  currentUrl: 'https://example.com',
  qrType: 'url',
  isLoading: false,
};

describe('EditUrlModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('visibility', () => {
    it('renders when isOpen is true', () => {
      render(<EditUrlModal {...defaultProps} isOpen={true} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      render(<EditUrlModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('content', () => {
    it('renders Edit Destination URL heading', () => {
      render(<EditUrlModal {...defaultProps} />);
      expect(screen.getByText('Edit Destination URL')).toBeInTheDocument();
    });

    it('renders URL label for url qr type', () => {
      render(<EditUrlModal {...defaultProps} qrType="url" />);
      expect(screen.getByLabelText('URL')).toBeInTheDocument();
    });

    it('renders Content label for non-url qr type', () => {
      render(<EditUrlModal {...defaultProps} qrType="text" />);
      expect(screen.getByLabelText('Content')).toBeInTheDocument();
    });

    it('renders Content label for email qr type', () => {
      render(<EditUrlModal {...defaultProps} qrType="email" />);
      expect(screen.getByLabelText('Content')).toBeInTheDocument();
    });

    it('renders URL label when qrType is empty string', () => {
      render(<EditUrlModal {...defaultProps} qrType="" />);
      expect(screen.getByLabelText('URL')).toBeInTheDocument();
    });

    it('renders URL input with current URL value', () => {
      render(<EditUrlModal {...defaultProps} currentUrl="https://example.com" />);
      expect(screen.getByDisplayValue('https://example.com')).toBeInTheDocument();
    });

    it('renders placeholder for url type', () => {
      render(<EditUrlModal {...defaultProps} qrType="url" />);
      expect(screen.getByPlaceholderText('https://example.com')).toBeInTheDocument();
    });

    it('renders placeholder for non-url type', () => {
      render(<EditUrlModal {...defaultProps} qrType="text" />);
      expect(screen.getByPlaceholderText('Enter content...')).toBeInTheDocument();
    });

    it('renders Save button', () => {
      render(<EditUrlModal {...defaultProps} />);
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    });

    it('renders Cancel button', () => {
      render(<EditUrlModal {...defaultProps} />);
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('shows Saving... text when loading', () => {
      render(<EditUrlModal {...defaultProps} isLoading={true} />);
      expect(screen.getByRole('button', { name: 'Saving...' })).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls onClose when Cancel is clicked', async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();
      render(<EditUrlModal {...defaultProps} onClose={onClose} />);
      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when backdrop is clicked', async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();
      render(<EditUrlModal {...defaultProps} onClose={onClose} />);
      // Portal renders to document.body; backdrop has bg-black/40 class
      const backdrop = document.body.querySelector('.bg-black\\/40');
      if (backdrop) {
        await user.click(backdrop);
      }
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('shows error when submitting empty URL', async () => {
      const user = userEvent.setup();
      render(<EditUrlModal {...defaultProps} currentUrl="" />);

      await user.click(screen.getByRole('button', { name: 'Save' }));
      expect(screen.getByText('URL is required')).toBeInTheDocument();
    });

    it('shows error for invalid URL on url type', async () => {
      const user = userEvent.setup();
      render(<EditUrlModal {...defaultProps} currentUrl="" />);

      const input = screen.getByLabelText('URL');
      await user.type(input, 'not-a-url');
      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(screen.getByText('Please enter a valid URL')).toBeInTheDocument();
    });

    it('shows error for non-http URL on url type', async () => {
      const user = userEvent.setup();
      render(<EditUrlModal {...defaultProps} currentUrl="" />);

      const input = screen.getByLabelText('URL');
      await user.type(input, 'ftp://example.com');
      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(screen.getByText('URL must start with http:// or https://')).toBeInTheDocument();
    });

    it('does not validate URL format for non-url types', async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      const user = userEvent.setup();
      render(<EditUrlModal {...defaultProps} qrType="text" currentUrl="" onSubmit={onSubmit} />);

      const input = screen.getByLabelText('Content');
      await user.type(input, 'just plain text');
      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(onSubmit).toHaveBeenCalledWith('just plain text');
    });

    it('calls onSubmit with trimmed URL', async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      const user = userEvent.setup();
      render(<EditUrlModal {...defaultProps} currentUrl="" onSubmit={onSubmit} />);

      const input = screen.getByLabelText('URL');
      await user.type(input, '  https://new-url.com  ');
      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(onSubmit).toHaveBeenCalledWith('https://new-url.com');
    });

    it('calls onClose after successful submission', async () => {
      const onClose = vi.fn();
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      const user = userEvent.setup();
      render(<EditUrlModal {...defaultProps} onClose={onClose} onSubmit={onSubmit} currentUrl="" />);

      const input = screen.getByLabelText('URL');
      await user.type(input, 'https://new-url.com');
      await user.click(screen.getByRole('button', { name: 'Save' }));

      await waitFor(() => {
        expect(onClose).toHaveBeenCalledTimes(1);
      });
    });

    it('shows error message when onSubmit rejects', async () => {
      const onSubmit = vi.fn().mockRejectedValue(new Error('Network error'));
      const user = userEvent.setup();
      render(<EditUrlModal {...defaultProps} onSubmit={onSubmit} currentUrl="" />);

      const input = screen.getByLabelText('URL');
      await user.type(input, 'https://new-url.com');
      await user.click(screen.getByRole('button', { name: 'Save' }));

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('shows generic error when onSubmit rejects with non-Error', async () => {
      const onSubmit = vi.fn().mockRejectedValue('unexpected');
      const user = userEvent.setup();
      render(<EditUrlModal {...defaultProps} onSubmit={onSubmit} currentUrl="" />);

      const input = screen.getByLabelText('URL');
      await user.type(input, 'https://new-url.com');
      await user.click(screen.getByRole('button', { name: 'Save' }));

      await waitFor(() => {
        expect(screen.getByText('Failed to update URL')).toBeInTheDocument();
      });
    });

    it('allows editing the pre-filled URL', async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      const user = userEvent.setup();
      render(<EditUrlModal {...defaultProps} currentUrl="https://old.com" onSubmit={onSubmit} />);

      const input = screen.getByDisplayValue('https://old.com');
      await user.clear(input);
      await user.type(input, 'https://new.com');
      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(onSubmit).toHaveBeenCalledWith('https://new.com');
    });
  });
});
