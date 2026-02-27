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
    it('renders QR code name (mobile + desktop)', () => {
      render(<QRCodeCard qrCode={makeQRCode()} />);
      const names = screen.getAllByText('Test QR Code');
      expect(names.length).toBe(2); // mobile + desktop
    });

    it('falls back to short_code when name is null', () => {
      render(<QRCodeCard qrCode={makeQRCode({ name: null })} />);
      // Mobile shows "QR abc123", desktop shows "QR Code abc123"
      expect(screen.getByText('QR Code abc123')).toBeInTheDocument();
      expect(screen.getByText('QR abc123')).toBeInTheDocument();
    });

    it('renders destination URL (mobile + desktop)', () => {
      render(<QRCodeCard qrCode={makeQRCode()} />);
      const urls = screen.getAllByText('https://example.com');
      expect(urls.length).toBe(2); // mobile + desktop
    });

    it('renders formatted creation date', () => {
      render(<QRCodeCard qrCode={makeQRCode()} />);
      expect(screen.getByText('Feb 20, 2026')).toBeInTheDocument();
    });

    it('renders QR preview with tracking URL for url type', () => {
      render(<QRCodeCard qrCode={makeQRCode()} />);
      const previews = screen.getAllByTestId('qr-preview');
      expect(previews.length).toBe(2); // mobile + desktop
      expect(previews[0]).toHaveTextContent('https://qrius.app/r/abc123');
    });

    it('renders QR preview with destination URL for non-url type', () => {
      render(<QRCodeCard qrCode={makeQRCode({ qr_type: 'text', tracking_url: undefined })} />);
      const previews = screen.getAllByTestId('qr-preview');
      expect(previews[0]).toHaveTextContent('https://example.com');
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
    it('shows scan count for dynamic QR codes (desktop)', () => {
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
    it('renders actions buttons (mobile + desktop)', () => {
      render(<QRCodeCard qrCode={makeQRCode()} />);
      const actionButtons = screen.getAllByRole('button', { name: 'QR code actions' });
      expect(actionButtons.length).toBe(2); // mobile + desktop
    });

    it('calls onDelete callback when delete is clicked', async () => {
      const onDelete = vi.fn();
      const { user } = render(<QRCodeCard qrCode={makeQRCode()} onDelete={onDelete} />);

      // Open menu (first = mobile, second = desktop)
      const actionButtons = screen.getAllByRole('button', { name: 'QR code actions' });
      await user.click(actionButtons[0]);
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
      expect(screen.getAllByTestId('qr-preview').length).toBeGreaterThan(0);
    });

    it('handles empty metadata gracefully', () => {
      render(<QRCodeCard qrCode={makeQRCode({ metadata: {} })} />);
      expect(screen.getAllByTestId('qr-preview').length).toBeGreaterThan(0);
    });

    it('handles null-like metadata gracefully', () => {
      render(<QRCodeCard qrCode={makeQRCode({ metadata: null as unknown as QRCode['metadata'] })} />);
      expect(screen.getAllByTestId('qr-preview').length).toBeGreaterThan(0);
    });
  });

  describe('links', () => {
    it('links QR preview to detail page', () => {
      render(<QRCodeCard qrCode={makeQRCode()} />);
      const previewLink = screen.getAllByTestId('qr-preview')[0].closest('a');
      expect(previewLink).toHaveAttribute('href', '/qr-codes/$id/qr-1');
    });
  });
});
