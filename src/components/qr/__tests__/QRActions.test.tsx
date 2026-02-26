import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { QRActions } from '../QRActions';

vi.mock('@/hooks/usePlanGate', () => ({
  usePlanGate: () => ({ canUse: () => true }),
}));

vi.mock('@/stores/toastStore', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('@/utils/qrSvgGenerator', () => ({
  generateIllustratorSVG: vi.fn(),
  downloadSVG: vi.fn(),
}));

vi.mock('@/utils/qrDownloadHelper', () => ({
  rasterizeQRToBlob: vi.fn().mockResolvedValue(new Blob(['test'], { type: 'image/png' })),
  downloadBlob: vi.fn(),
}));

vi.mock('../../../components/ui/ProBadge', () => ({
  ProBadge: () => <span>Pro</span>,
}));

describe('QRActions', () => {
  const mockQrCodeRef = { current: null };
  const defaultProps = {
    qrCodeRef: mockQrCodeRef as React.MutableRefObject<null>,
    styleOptions: {
      dotsColor: '#000000',
      backgroundColor: '#ffffff',
      dotsType: 'square' as const,
      cornersSquareType: 'square' as const,
      cornersDotType: 'square' as const,
      errorCorrectionLevel: 'M' as const,
    },
    processedLogoUrl: undefined,
    onSaveToHistory: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Download button', () => {
    render(<QRActions {...defaultProps} />);
    expect(screen.getByText('Download')).toBeInTheDocument();
  });

  it('renders Copy button', () => {
    render(<QRActions {...defaultProps} />);
    expect(screen.getByText('Copy')).toBeInTheDocument();
  });

  it('Download button has aria-haspopup="menu"', () => {
    render(<QRActions {...defaultProps} />);
    const downloadButton = screen.getByText('Download').closest('button')!;
    expect(downloadButton).toHaveAttribute('aria-haspopup', 'menu');
  });

  it('Download button opens format menu on click', async () => {
    const { user } = render(<QRActions {...defaultProps} />);
    const downloadButton = screen.getByText('Download').closest('button')!;
    await user.click(downloadButton);

    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('format menu shows PNG, SVG, JPEG, PDF options', async () => {
    const { user } = render(<QRActions {...defaultProps} />);
    const downloadButton = screen.getByText('Download').closest('button')!;
    await user.click(downloadButton);

    expect(screen.getByText('PNG (High Quality)')).toBeInTheDocument();
    expect(screen.getByText('SVG (Illustrator Ready)')).toBeInTheDocument();
    expect(screen.getByText('JPEG (Compressed)')).toBeInTheDocument();
    expect(screen.getByText('PDF (Print Ready)')).toBeInTheDocument();
  });

  it('Copy button shows "Copy" text initially', () => {
    render(<QRActions {...defaultProps} />);
    expect(screen.getByText('Copy')).toBeInTheDocument();
  });

  it('format menu has proper role="menu" and aria-label', async () => {
    const { user } = render(<QRActions {...defaultProps} />);
    const downloadButton = screen.getByText('Download').closest('button')!;
    await user.click(downloadButton);

    const menu = screen.getByRole('menu');
    expect(menu).toHaveAttribute('aria-label', 'Download format options');
  });

  it('format menu items have role="menuitem"', async () => {
    const { user } = render(<QRActions {...defaultProps} />);
    const downloadButton = screen.getByText('Download').closest('button')!;
    await user.click(downloadButton);

    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems).toHaveLength(4);
  });

  it('Copy button has correct aria-label', () => {
    render(<QRActions {...defaultProps} />);
    expect(screen.getByLabelText('Copy QR code to clipboard')).toBeInTheDocument();
  });
});
