import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { QRCodeCard } from '../QRCodeCard';
import type { QRCode } from '@/types/database';

// Mock QRMiniPreview (heavy canvas dependency)
vi.mock('../../ui/QRMiniPreview', () => ({
  QRMiniPreview: ({ data }: { data: string }) => <div data-testid="qr-preview">{data}</div>,
}));

// Mock TanStack Router Link
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, params, ...props }: { children: React.ReactNode; to: string; params?: Record<string, string>; onClick?: () => void; className?: string }) => (
    <a href={`${to}${params?.id ? `/${params.id}` : ''}`} {...props}>{children}</a>
  ),
}));

function makeQRCode(overrides: Partial<QRCode> = {}): QRCode {
  return {
    id: 'qr-1',
    short_code: 'abc123',
    destination_url: 'https://example.com',
    qr_type: 'url',
    original_data: null,
    is_active: true,
    total_scans: 42,
    user_id: 'user-1',
    organization_id: 'org-1',
    folder_id: null,
    name: 'Test QR Code',
    description: null,
    tags: [],
    metadata: {},
    tracking_url: 'https://qrius.app/r/abc123',
    created_at: '2026-02-20T12:00:00Z',
    updated_at: '2026-02-20T12:00:00Z',
    ...overrides,
  };
}

describe('QRCodeCard', () => {
  describe('rendering', () => {
    it('renders QR code name', () => {
      render(<QRCodeCard qrCode={makeQRCode()} />);
      expect(screen.getByText('Test QR Code')).toBeInTheDocument();
    });

    it('falls back to short_code when name is null', () => {
      render(<QRCodeCard qrCode={makeQRCode({ name: null })} />);
      expect(screen.getByText('QR Code abc123')).toBeInTheDocument();
    });

    it('renders destination URL', () => {
      render(<QRCodeCard qrCode={makeQRCode()} />);
      expect(screen.getByText('https://example.com')).toBeInTheDocument();
    });

    it('renders formatted creation date', () => {
      render(<QRCodeCard qrCode={makeQRCode()} />);
      expect(screen.getByText('Feb 20, 2026')).toBeInTheDocument();
    });

    it('renders QR preview with tracking URL for url type', () => {
      render(<QRCodeCard qrCode={makeQRCode()} />);
      expect(screen.getByTestId('qr-preview')).toHaveTextContent('https://qrius.app/r/abc123');
    });

    it('renders QR preview with destination URL for non-url type', () => {
      render(<QRCodeCard qrCode={makeQRCode({ qr_type: 'text', tracking_url: undefined })} />);
      expect(screen.getByTestId('qr-preview')).toHaveTextContent('https://example.com');
    });
  });

  describe('status badges', () => {
    it('shows Dynamic badge for codes with short_code', () => {
      render(<QRCodeCard qrCode={makeQRCode()} />);
      expect(screen.getByText('Dynamic')).toBeInTheDocument();
    });

    it('shows Static badge for codes without short_code', () => {
      render(<QRCodeCard qrCode={makeQRCode({ short_code: '' })} />);
      expect(screen.getByText('Static')).toBeInTheDocument();
    });

    it('shows Inactive badge when is_active is false', () => {
      render(<QRCodeCard qrCode={makeQRCode({ is_active: false })} />);
      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });

    it('does not show Inactive badge when is_active is true', () => {
      render(<QRCodeCard qrCode={makeQRCode({ is_active: true })} />);
      expect(screen.queryByText('Inactive')).not.toBeInTheDocument();
    });

    it('applies opacity class when inactive', () => {
      const { container } = render(<QRCodeCard qrCode={makeQRCode({ is_active: false })} />);
      expect(container.firstChild).toHaveClass('opacity-60');
    });
  });

  describe('scan count', () => {
    it('shows scan count for dynamic QR codes', () => {
      render(<QRCodeCard qrCode={makeQRCode({ total_scans: 42 })} />);
      expect(screen.getByText('42 scans')).toBeInTheDocument();
    });

    it('shows dash for static QR codes', () => {
      render(<QRCodeCard qrCode={makeQRCode({ short_code: '' })} />);
      expect(screen.getByText('—')).toBeInTheDocument();
    });

    it('shows 0 scans for dynamic codes with no scans', () => {
      render(<QRCodeCard qrCode={makeQRCode({ total_scans: 0 })} />);
      expect(screen.getByText('0 scans')).toBeInTheDocument();
    });
  });

  describe('actions menu', () => {
    it('renders actions button', () => {
      render(<QRCodeCard qrCode={makeQRCode()} />);
      expect(screen.getByRole('button', { name: 'QR code actions' })).toBeInTheDocument();
    });

    it('calls onDelete callback when delete is clicked', async () => {
      const onDelete = vi.fn();
      const { user } = render(<QRCodeCard qrCode={makeQRCode()} onDelete={onDelete} />);

      // Open menu
      await user.click(screen.getByRole('button', { name: 'QR code actions' }));
      // Click delete
      await user.click(screen.getByText('Delete'));

      expect(onDelete).toHaveBeenCalledWith('qr-1');
    });
  });

  describe('style extraction', () => {
    it('passes extracted style options to preview', () => {
      const qrCode = makeQRCode({
        metadata: {
          style_options: {
            dotsColor: '#ff0000',
            backgroundColor: '#ffffff',
          },
        },
      });
      render(<QRCodeCard qrCode={qrCode} />);
      // QRMiniPreview is mocked; just verify no crash
      expect(screen.getByTestId('qr-preview')).toBeInTheDocument();
    });

    it('handles empty metadata gracefully', () => {
      render(<QRCodeCard qrCode={makeQRCode({ metadata: {} })} />);
      expect(screen.getByTestId('qr-preview')).toBeInTheDocument();
    });

    it('handles null-like metadata gracefully', () => {
      render(<QRCodeCard qrCode={makeQRCode({ metadata: null as unknown as QRCode['metadata'] })} />);
      expect(screen.getByTestId('qr-preview')).toBeInTheDocument();
    });
  });

  describe('links', () => {
    it('links QR preview to detail page', () => {
      render(<QRCodeCard qrCode={makeQRCode()} />);
      const previewLink = screen.getByTestId('qr-preview').closest('a');
      expect(previewLink).toHaveAttribute('href', '/qr-codes/$id/qr-1');
    });
  });
});
