import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { CreateFolderModal } from '../CreateFolderModal';

// Mock useFocusTrap (uses requestAnimationFrame which complicates tests)
vi.mock('@/hooks/useFocusTrap', () => ({
  useFocusTrap: vi.fn(),
}));

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onSubmit: vi.fn().mockResolvedValue(undefined),
  isLoading: false,
};

describe('CreateFolderModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('visibility', () => {
    it('renders when isOpen is true', () => {
      render(<CreateFolderModal {...defaultProps} isOpen={true} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      render(<CreateFolderModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('content', () => {
    it('renders New Folder heading', () => {
      render(<CreateFolderModal {...defaultProps} />);
      expect(screen.getByText('New Folder')).toBeInTheDocument();
    });

    it('renders folder name input with Name label', () => {
      render(<CreateFolderModal {...defaultProps} />);
      expect(screen.getByLabelText('Name')).toBeInTheDocument();
    });

    it('renders folder name input with placeholder', () => {
      render(<CreateFolderModal {...defaultProps} />);
      expect(screen.getByPlaceholderText('e.g. Marketing, Events')).toBeInTheDocument();
    });

    it('renders Color label', () => {
      render(<CreateFolderModal {...defaultProps} />);
      expect(screen.getByText('Color')).toBeInTheDocument();
    });

    it('renders 6 color swatches', () => {
      render(<CreateFolderModal {...defaultProps} />);
      expect(screen.getByRole('button', { name: 'Orange' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Blue' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Green' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Purple' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Pink' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Gray' })).toBeInTheDocument();
    });

    it('renders Create button', () => {
      render(<CreateFolderModal {...defaultProps} />);
      expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
    });

    it('renders Cancel button', () => {
      render(<CreateFolderModal {...defaultProps} />);
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    });

    it('shows Creating... text when loading', () => {
      render(<CreateFolderModal {...defaultProps} isLoading={true} />);
      expect(screen.getByRole('button', { name: 'Creating...' })).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('calls onClose when Cancel is clicked', async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();
      render(<CreateFolderModal {...defaultProps} onClose={onClose} />);
      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when backdrop is clicked', async () => {
      const onClose = vi.fn();
      const user = userEvent.setup();
      const { container } = render(<CreateFolderModal {...defaultProps} onClose={onClose} />);
      // The backdrop is the first child with bg-black/30 class
      const backdrop = container.querySelector('.bg-black\\/30');
      if (backdrop) {
        await user.click(backdrop);
      }
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('shows error when submitting with empty name', async () => {
      const user = userEvent.setup();
      render(<CreateFolderModal {...defaultProps} />);
      await user.click(screen.getByRole('button', { name: 'Create' }));
      expect(screen.getByText('Folder name is required')).toBeInTheDocument();
    });

    it('shows error when name exceeds 100 characters', async () => {
      const user = userEvent.setup();
      render(<CreateFolderModal {...defaultProps} />);
      const input = screen.getByLabelText('Name');
      await user.type(input, 'a'.repeat(101));
      await user.click(screen.getByRole('button', { name: 'Create' }));
      expect(screen.getByText('Folder name must be 100 characters or fewer')).toBeInTheDocument();
    });

    it('calls onSubmit with trimmed name and default color', async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      const user = userEvent.setup();
      render(<CreateFolderModal {...defaultProps} onSubmit={onSubmit} />);

      const input = screen.getByLabelText('Name');
      await user.type(input, '  My Folder  ');
      await user.click(screen.getByRole('button', { name: 'Create' }));

      expect(onSubmit).toHaveBeenCalledWith('My Folder', '#6B7280');
    });

    it('calls onSubmit with selected color', async () => {
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      const user = userEvent.setup();
      render(<CreateFolderModal {...defaultProps} onSubmit={onSubmit} />);

      await user.click(screen.getByRole('button', { name: 'Orange' }));
      const input = screen.getByLabelText('Name');
      await user.type(input, 'Test');
      await user.click(screen.getByRole('button', { name: 'Create' }));

      expect(onSubmit).toHaveBeenCalledWith('Test', '#F97316');
    });

    it('calls onClose after successful submission', async () => {
      const onClose = vi.fn();
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      const user = userEvent.setup();
      render(<CreateFolderModal {...defaultProps} onClose={onClose} onSubmit={onSubmit} />);

      const input = screen.getByLabelText('Name');
      await user.type(input, 'New Folder');
      await user.click(screen.getByRole('button', { name: 'Create' }));

      await waitFor(() => {
        expect(onClose).toHaveBeenCalledTimes(1);
      });
    });

    it('shows error message when onSubmit rejects', async () => {
      const onSubmit = vi.fn().mockRejectedValue(new Error('Server error'));
      const user = userEvent.setup();
      render(<CreateFolderModal {...defaultProps} onSubmit={onSubmit} />);

      const input = screen.getByLabelText('Name');
      await user.type(input, 'Test');
      await user.click(screen.getByRole('button', { name: 'Create' }));

      await waitFor(() => {
        expect(screen.getByText('Server error')).toBeInTheDocument();
      });
    });

    it('shows generic error when onSubmit rejects with non-Error', async () => {
      const onSubmit = vi.fn().mockRejectedValue('unknown');
      const user = userEvent.setup();
      render(<CreateFolderModal {...defaultProps} onSubmit={onSubmit} />);

      const input = screen.getByLabelText('Name');
      await user.type(input, 'Test');
      await user.click(screen.getByRole('button', { name: 'Create' }));

      await waitFor(() => {
        expect(screen.getByText('Failed to create folder')).toBeInTheDocument();
      });
    });
  });
});
