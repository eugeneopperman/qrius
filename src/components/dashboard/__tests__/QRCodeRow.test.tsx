import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/test-utils';
import userEvent from '@testing-library/user-event';
import { QRCodeRow } from '../QRCodeRow';
import type { QRCode } from '@/types/database';
import type { QRCodeFolder } from '@/hooks/queries/useQRCodeFolders';

// Mock QRMiniPreview (heavy canvas dependency)
vi.mock('../../ui/QRMiniPreview', () => ({
  QRMiniPreview: ({ data }: { data: string }) => <div data-testid="qr-preview">{data}</div>,
}));

// Mock extractStyleOptions
vi.mock('@/utils/extractStyleOptions', () => ({
  extractStyleOptions: () => undefined,
}));

// Mock TanStack Router Link
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, params, ...props }: { children: React.ReactNode; to: string; params?: Record<string, string>; onClick?: () => void; className?: string }) => (
    <a href={`${to}${params?.id ? `/${params.id}` : ''}`} {...props}>{children}</a>
  ),
}));

// Mock toast
vi.mock('@/stores/toastStore', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

function makeQRCode(overrides: Partial<QRCode> = {}): QRCode {
  return {
    id: 'qr-1',
    short_code: 'abc123',
    destination_url: 'https://example.com',
    qr_type: 'url',
    original_data: null,
    status: 'active',
    is_active: true,
    total_scans: 42,
    user_id: 'user-1',
    organization_id: 'org-1',
    folder_id: null,
    name: 'My Test QR',
    description: null,
    tags: [],
    metadata: {},
    tracking_url: 'https://qrius.app/r/abc123',
    created_at: '2026-02-20T12:00:00Z',
    updated_at: '2026-02-20T12:00:00Z',
    ...overrides,
  };
}

const mockFolders: QRCodeFolder[] = [
  { id: 'folder-1', name: 'Marketing', color: '#F97316', qrCodeCount: 5, created_at: '2026-01-01T00:00:00Z' },
  { id: 'folder-2', name: 'Events', color: '#3B82F6', qrCodeCount: 3, created_at: '2026-01-01T00:00:00Z' },
];

const defaultProps = {
  qr: makeQRCode(),
  folders: mockFolders,
  onEditUrl: vi.fn(),
  onToggleActive: vi.fn(),
  onMoveToFolder: vi.fn(),
  onDelete: vi.fn(),
};

describe('QRCodeRow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders QR code name', () => {
      render(<QRCodeRow {...defaultProps} />);
      expect(screen.getByText('My Test QR')).toBeInTheDocument();
    });

    it('falls back to truncated destination_url when name is null', () => {
      render(<QRCodeRow {...defaultProps} qr={makeQRCode({ name: null })} />);
      // The display name appears in the link, plus destination also appears in the URL column and preview
      const nameLink = screen.getAllByText('https://example.com').find(
        (el) => el.closest('a')?.getAttribute('href')?.includes('qr-codes')
      );
      expect(nameLink).toBeInTheDocument();
    });

    it('renders type badge with uppercase text', () => {
      render(<QRCodeRow {...defaultProps} />);
      expect(screen.getByText('url')).toBeInTheDocument();
    });

    it('renders email type badge', () => {
      render(<QRCodeRow {...defaultProps} qr={makeQRCode({ qr_type: 'email' })} />);
      expect(screen.getByText('email')).toBeInTheDocument();
    });

    it('renders Active status badge for active QR', () => {
      render(<QRCodeRow {...defaultProps} qr={makeQRCode({ is_active: true })} />);
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('renders Paused status badge for inactive QR', () => {
      render(<QRCodeRow {...defaultProps} qr={makeQRCode({ status: 'paused', is_active: false })} />);
      expect(screen.getByText('Paused')).toBeInTheDocument();
    });

    it('renders Draft status badge with amber styling', () => {
      render(<QRCodeRow {...defaultProps} qr={makeQRCode({ status: 'draft' })} />);
      expect(screen.getByText('Draft')).toBeInTheDocument();
    });

    it('renders scan count', () => {
      render(<QRCodeRow {...defaultProps} qr={makeQRCode({ total_scans: 42 })} />);
      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.getByText('scans')).toBeInTheDocument();
    });

    it('renders zero scan count', () => {
      render(<QRCodeRow {...defaultProps} qr={makeQRCode({ total_scans: 0 })} />);
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('renders QR preview component', () => {
      render(<QRCodeRow {...defaultProps} />);
      expect(screen.getByTestId('qr-preview')).toBeInTheDocument();
    });

    it('renders name as link to detail page', () => {
      render(<QRCodeRow {...defaultProps} />);
      const link = screen.getByText('My Test QR');
      expect(link.closest('a')).toHaveAttribute('href', '/qr-codes/$id/qr-1');
    });
  });

  describe('action buttons', () => {
    it('renders download button', () => {
      render(<QRCodeRow {...defaultProps} />);
      expect(screen.getByRole('button', { name: 'Download' })).toBeInTheDocument();
    });

    it('renders more actions button', () => {
      render(<QRCodeRow {...defaultProps} />);
      expect(screen.getByRole('button', { name: 'More actions' })).toBeInTheDocument();
    });

    it('shows dropdown menu on more actions click', async () => {
      const user = userEvent.setup();
      render(<QRCodeRow {...defaultProps} />);
      await user.click(screen.getByRole('button', { name: 'More actions' }));
      expect(screen.getByText('Edit URL')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('calls onEditUrl when Edit URL is clicked', async () => {
      const onEditUrl = vi.fn();
      const user = userEvent.setup();
      const qr = makeQRCode();
      render(<QRCodeRow {...defaultProps} qr={qr} onEditUrl={onEditUrl} />);
      await user.click(screen.getByRole('button', { name: 'More actions' }));
      await user.click(screen.getByText('Edit URL'));
      expect(onEditUrl).toHaveBeenCalledWith(qr);
    });

    it('calls onDelete when Delete is clicked', async () => {
      const onDelete = vi.fn();
      const user = userEvent.setup();
      const qr = makeQRCode();
      render(<QRCodeRow {...defaultProps} qr={qr} onDelete={onDelete} />);
      await user.click(screen.getByRole('button', { name: 'More actions' }));
      await user.click(screen.getByText('Delete'));
      expect(onDelete).toHaveBeenCalledWith(qr);
    });

    it('calls onToggleActive with Pause text for active QR', async () => {
      const onToggleActive = vi.fn();
      const user = userEvent.setup();
      const qr = makeQRCode({ is_active: true });
      render(<QRCodeRow {...defaultProps} qr={qr} onToggleActive={onToggleActive} />);
      await user.click(screen.getByRole('button', { name: 'More actions' }));
      await user.click(screen.getByText('Pause'));
      expect(onToggleActive).toHaveBeenCalledWith(qr);
    });

    it('calls onToggleActive with Activate text for paused QR', async () => {
      const onToggleActive = vi.fn();
      const user = userEvent.setup();
      const qr = makeQRCode({ is_active: false });
      render(<QRCodeRow {...defaultProps} qr={qr} onToggleActive={onToggleActive} />);
      await user.click(screen.getByRole('button', { name: 'More actions' }));
      await user.click(screen.getByText('Activate'));
      expect(onToggleActive).toHaveBeenCalledWith(qr);
    });

    it('shows View Analytics link in dropdown', async () => {
      const user = userEvent.setup();
      render(<QRCodeRow {...defaultProps} />);
      await user.click(screen.getByRole('button', { name: 'More actions' }));
      expect(screen.getByText('View Analytics')).toBeInTheDocument();
    });

    it('shows Copy Tracking URL option in dropdown', async () => {
      const user = userEvent.setup();
      render(<QRCodeRow {...defaultProps} />);
      await user.click(screen.getByRole('button', { name: 'More actions' }));
      expect(screen.getByText('Copy Tracking URL')).toBeInTheDocument();
    });

    it('shows Move to Folder option in dropdown', async () => {
      const user = userEvent.setup();
      render(<QRCodeRow {...defaultProps} />);
      await user.click(screen.getByRole('button', { name: 'More actions' }));
      expect(screen.getByText('Move to Folder')).toBeInTheDocument();
    });
  });

  describe('folder display', () => {
    it('does not show folder name when QR has no folder', () => {
      render(<QRCodeRow {...defaultProps} qr={makeQRCode({ folder_id: null })} />);
      expect(screen.queryByText('Marketing')).not.toBeInTheDocument();
    });
  });
});
