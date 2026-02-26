import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { QRCodeFilterBar } from '../QRCodeFilterBar';
import type { QRCodeFolder } from '@/hooks/queries/useQRCodeFolders';

// Mock TanStack Router Link
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, ...props }: { children: React.ReactNode; to: string; className?: string }) => (
    <a href={to} {...props}>{children}</a>
  ),
}));

const mockFolders: QRCodeFolder[] = [
  { id: 'folder-1', name: 'Marketing', color: '#F97316', qrCodeCount: 5, created_at: '2026-01-01T00:00:00Z' },
  { id: 'folder-2', name: 'Events', color: '#3B82F6', qrCodeCount: 3, created_at: '2026-01-01T00:00:00Z' },
];

const defaultProps = {
  status: 'all' as const,
  onStatusChange: vi.fn(),
  counts: { all: 25, active: 20, paused: 5 },
  folderId: undefined,
  onFolderChange: vi.fn(),
  folders: mockFolders,
  search: '',
  onSearchChange: vi.fn(),
  sort: 'created_at' as const,
  order: 'desc' as const,
  onSortChange: vi.fn(),
  onCreateFolder: vi.fn(),
};

describe('QRCodeFilterBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('status tabs', () => {
    it('renders All tab with count', () => {
      render(<QRCodeFilterBar {...defaultProps} />);
      expect(screen.getByText('All')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
    });

    it('renders Active tab with count', () => {
      render(<QRCodeFilterBar {...defaultProps} />);
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('20')).toBeInTheDocument();
    });

    it('renders Paused tab with count', () => {
      render(<QRCodeFilterBar {...defaultProps} />);
      expect(screen.getByText('Paused')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('calls onStatusChange when Active tab is clicked', async () => {
      const onStatusChange = vi.fn();
      const user = userEvent.setup();
      render(<QRCodeFilterBar {...defaultProps} onStatusChange={onStatusChange} />);
      await user.click(screen.getByText('Active'));
      expect(onStatusChange).toHaveBeenCalledWith('active');
    });

    it('calls onStatusChange when Paused tab is clicked', async () => {
      const onStatusChange = vi.fn();
      const user = userEvent.setup();
      render(<QRCodeFilterBar {...defaultProps} onStatusChange={onStatusChange} />);
      await user.click(screen.getByText('Paused'));
      expect(onStatusChange).toHaveBeenCalledWith('paused');
    });

    it('calls onStatusChange when All tab is clicked', async () => {
      const onStatusChange = vi.fn();
      const user = userEvent.setup();
      render(<QRCodeFilterBar {...defaultProps} status="active" onStatusChange={onStatusChange} />);
      await user.click(screen.getByText('All'));
      expect(onStatusChange).toHaveBeenCalledWith('all');
    });
  });

  describe('search input', () => {
    it('renders search input with placeholder', () => {
      render(<QRCodeFilterBar {...defaultProps} />);
      expect(screen.getByPlaceholderText('Search QR codes...')).toBeInTheDocument();
    });

    it('renders search input with current value', () => {
      render(<QRCodeFilterBar {...defaultProps} search="hello" />);
      expect(screen.getByDisplayValue('hello')).toBeInTheDocument();
    });

    it('calls onSearchChange after debounce when typing', async () => {
      const onSearchChange = vi.fn();
      const user = userEvent.setup();
      render(<QRCodeFilterBar {...defaultProps} onSearchChange={onSearchChange} />);

      const input = screen.getByPlaceholderText('Search QR codes...');
      await user.type(input, 'test');

      // The debounce is 300ms; wait for it to fire
      await waitFor(() => {
        expect(onSearchChange).toHaveBeenCalled();
      }, { timeout: 1000 });
    });
  });

  describe('create QR code button', () => {
    it('renders create QR code link to /create', () => {
      render(<QRCodeFilterBar {...defaultProps} />);
      const link = screen.getByRole('link', { name: /Create QR Code/i });
      expect(link).toHaveAttribute('href', '/create');
    });
  });

  describe('folder dropdown', () => {
    it('shows All Folders label by default', () => {
      render(<QRCodeFilterBar {...defaultProps} folderId={undefined} />);
      expect(screen.getByText('All Folders')).toBeInTheDocument();
    });

    it('shows Unfiled label when folderId is none', () => {
      render(<QRCodeFilterBar {...defaultProps} folderId="none" />);
      expect(screen.getByText('Unfiled')).toBeInTheDocument();
    });

    it('shows folder name when a folder is selected', () => {
      render(<QRCodeFilterBar {...defaultProps} folderId="folder-1" />);
      expect(screen.getByText('Marketing')).toBeInTheDocument();
    });
  });

  describe('sort dropdown', () => {
    it('renders sort trigger with Date Created label', () => {
      render(<QRCodeFilterBar {...defaultProps} sort="created_at" />);
      expect(screen.getByText('Date Created')).toBeInTheDocument();
    });

    it('renders sort trigger with Scans label', () => {
      render(<QRCodeFilterBar {...defaultProps} sort="total_scans" />);
      expect(screen.getByText('Scans')).toBeInTheDocument();
    });

    it('renders sort trigger with Name label', () => {
      render(<QRCodeFilterBar {...defaultProps} sort="name" />);
      expect(screen.getByText('Name')).toBeInTheDocument();
    });
  });
});
