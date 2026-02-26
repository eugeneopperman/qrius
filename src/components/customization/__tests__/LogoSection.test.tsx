import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { LogoSection } from '../LogoSection';

// ── Store mock ──────────────────────────────────────────────────────────────
const mockSetStyleOptions = vi.fn();
let mockStyleOptions: Record<string, unknown> = {
  logoUrl: '',
  logoSize: 0.3,
  logoShape: 'square',
  logoMargin: 5,
  logoSvgContent: '',
};

vi.mock('@/stores/qrStore', () => ({
  useQRStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      styleOptions: mockStyleOptions,
      setStyleOptions: mockSetStyleOptions,
    }),
}));

vi.mock('zustand/react/shallow', () => ({
  useShallow: (fn: unknown) => fn,
}));

describe('LogoSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStyleOptions = {
      logoUrl: '',
      logoSize: 0.3,
      logoShape: 'square',
      logoMargin: 5,
      logoSvgContent: '',
    };
  });

  // ── Upload area (no logo) ─────────────────────────────────────────────
  describe('upload area (no logo)', () => {
    it('renders drop zone upload area', () => {
      render(<LogoSection />);
      expect(
        screen.getByText('Drop an image here or click to upload')
      ).toBeInTheDocument();
    });

    it('renders file type and size limit text', () => {
      render(<LogoSection />);
      expect(screen.getByText('PNG, JPG, or SVG (max 2MB)')).toBeInTheDocument();
    });

    it('renders a hidden file input', () => {
      const { container } = render(<LogoSection />);
      const fileInput = container.querySelector('input[type="file"]');
      expect(fileInput).toBeInTheDocument();
      expect(fileInput).toHaveClass('hidden');
    });

    it('does not render logo preview or remove button', () => {
      render(<LogoSection />);
      expect(screen.queryByAltText('Logo preview')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Remove logo')).not.toBeInTheDocument();
    });

    it('does not render shape, size, or padding options', () => {
      render(<LogoSection />);
      expect(screen.queryByText('Logo Size')).not.toBeInTheDocument();
      expect(screen.queryByText('Logo Shape')).not.toBeInTheDocument();
      expect(screen.queryByText('Logo Padding')).not.toBeInTheDocument();
    });
  });

  // ── Logo preview (logo set) ───────────────────────────────────────────
  describe('logo preview (logo set)', () => {
    beforeEach(() => {
      mockStyleOptions = {
        logoUrl: 'data:image/png;base64,abc123',
        logoSize: 0.3,
        logoShape: 'square',
        logoMargin: 5,
        logoSvgContent: '',
      };
    });

    it('renders logo preview image', () => {
      render(<LogoSection />);
      const img = screen.getByAltText('Logo preview');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'data:image/png;base64,abc123');
    });

    it('renders remove logo button', () => {
      render(<LogoSection />);
      expect(screen.getByLabelText('Remove logo')).toBeInTheDocument();
    });

    it('clicking remove logo calls setStyleOptions with empty logoUrl', async () => {
      const { user } = render(<LogoSection />);
      await user.click(screen.getByLabelText('Remove logo'));
      expect(mockSetStyleOptions).toHaveBeenCalledWith({
        logoUrl: undefined,
        logoSvgContent: undefined,
        logoSize: 0.3,
      });
    });

    it('renders "Logo Size" label', () => {
      render(<LogoSection />);
      expect(screen.getByText('Logo Size')).toBeInTheDocument();
    });

    it('renders size option buttons', () => {
      render(<LogoSection />);
      expect(screen.getByTitle('Small (20%)')).toBeInTheDocument();
      expect(screen.getByTitle('Medium (30%)')).toBeInTheDocument();
      expect(screen.getByTitle('Large (35%)')).toBeInTheDocument();
      expect(screen.getByTitle('Extra Large (40%)')).toBeInTheDocument();
    });

    it('renders "Logo Shape" label', () => {
      render(<LogoSection />);
      expect(screen.getByText('Logo Shape')).toBeInTheDocument();
    });

    it('renders shape option buttons (Square, Rounded, Circle)', () => {
      render(<LogoSection />);
      expect(screen.getByTitle('Square')).toBeInTheDocument();
      expect(screen.getByTitle('Rounded')).toBeInTheDocument();
      expect(screen.getByTitle('Circle')).toBeInTheDocument();
    });

    it('renders "Logo Padding" label', () => {
      render(<LogoSection />);
      expect(screen.getByText('Logo Padding')).toBeInTheDocument();
    });

    it('renders padding option buttons (None, Small, Medium)', () => {
      render(<LogoSection />);
      expect(screen.getByTitle('None')).toBeInTheDocument();
      expect(screen.getByTitle('Small')).toBeInTheDocument();
      expect(screen.getByTitle('Medium')).toBeInTheDocument();
    });

    it('renders "Change Logo" button', () => {
      render(<LogoSection />);
      expect(
        screen.getByRole('button', { name: 'Change Logo' })
      ).toBeInTheDocument();
    });

    it('renders error correction note', () => {
      render(<LogoSection />);
      expect(
        screen.getByText(/Larger logos require higher error correction/)
      ).toBeInTheDocument();
    });

    it('does not render the upload drop zone', () => {
      render(<LogoSection />);
      expect(
        screen.queryByText('Drop an image here or click to upload')
      ).not.toBeInTheDocument();
    });
  });
});
