import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { StyleSection } from '../StyleSection';

// ── Store mock ──────────────────────────────────────────────────────────────
const mockSetStyleOptions = vi.fn();
let mockStyleOptions: Record<string, unknown> = {
  dotsType: 'rounded',
  cornersSquareType: 'extra-rounded',
  cornersDotType: 'dot',
  showFallbackUrl: false,
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

describe('StyleSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStyleOptions = {
      dotsType: 'rounded',
      cornersSquareType: 'extra-rounded',
      cornersDotType: 'dot',
      showFallbackUrl: false,
    };
  });

  // ── QR Style options ──────────────────────────────────────────────────
  describe('QR style rendering', () => {
    it('renders "QR Style" label', () => {
      render(<StyleSection />);
      expect(screen.getByText('QR Style')).toBeInTheDocument();
    });

    it('renders all 6 dot style options', () => {
      render(<StyleSection />);
      expect(screen.getByTitle('Square')).toBeInTheDocument();
      expect(screen.getByTitle('Dots')).toBeInTheDocument();
      expect(screen.getByTitle('Rounded')).toBeInTheDocument();
      expect(screen.getByTitle('Extra Rounded')).toBeInTheDocument();
      expect(screen.getByTitle('Classy')).toBeInTheDocument();
      expect(screen.getByTitle('Classy Rounded')).toBeInTheDocument();
    });

    it('renders style labels inside the buttons', () => {
      render(<StyleSection />);
      // The labels are rendered as small text below the SVG preview
      expect(screen.getByText('Square')).toBeInTheDocument();
      expect(screen.getByText('Dots')).toBeInTheDocument();
      expect(screen.getByText('Rounded')).toBeInTheDocument();
      expect(screen.getByText('Extra Rounded')).toBeInTheDocument();
      expect(screen.getByText('Classy')).toBeInTheDocument();
      expect(screen.getByText('Classy Rounded')).toBeInTheDocument();
    });
  });

  describe('style selection', () => {
    it('clicking Square style calls setStyleOptions with square dot/corner types', async () => {
      const { user } = render(<StyleSection />);
      await user.click(screen.getByTitle('Square'));
      expect(mockSetStyleOptions).toHaveBeenCalledWith({
        dotsType: 'square',
        cornersSquareType: 'square',
        cornersDotType: 'square',
      });
    });

    it('clicking Dots style calls setStyleOptions with dots/dot types', async () => {
      const { user } = render(<StyleSection />);
      await user.click(screen.getByTitle('Dots'));
      expect(mockSetStyleOptions).toHaveBeenCalledWith({
        dotsType: 'dots',
        cornersSquareType: 'dot',
        cornersDotType: 'dot',
      });
    });

    it('clicking Extra Rounded style calls setStyleOptions with extra-rounded types', async () => {
      const { user } = render(<StyleSection />);
      await user.click(screen.getByTitle('Extra Rounded'));
      expect(mockSetStyleOptions).toHaveBeenCalledWith({
        dotsType: 'extra-rounded',
        cornersSquareType: 'extra-rounded',
        cornersDotType: 'extra-rounded',
      });
    });

    it('clicking Classy style calls setStyleOptions with classy/square types', async () => {
      const { user } = render(<StyleSection />);
      await user.click(screen.getByTitle('Classy'));
      expect(mockSetStyleOptions).toHaveBeenCalledWith({
        dotsType: 'classy',
        cornersSquareType: 'square',
        cornersDotType: 'square',
      });
    });
  });

  // ── Fallback URL toggle ───────────────────────────────────────────────
  describe('fallback URL toggle', () => {
    it('renders "Show Fallback Text" label', () => {
      render(<StyleSection />);
      expect(screen.getByText('Show Fallback Text')).toBeInTheDocument();
    });

    it('renders fallback toggle as a switch element', () => {
      render(<StyleSection />);
      const toggle = screen.getByRole('switch', { name: 'Show Fallback Text' });
      expect(toggle).toBeInTheDocument();
      expect(toggle).toHaveAttribute('aria-checked', 'false');
    });

    it('clicking fallback toggle calls setStyleOptions with showFallbackUrl: true', async () => {
      const { user } = render(<StyleSection />);
      const toggle = screen.getByRole('switch', { name: 'Show Fallback Text' });
      await user.click(toggle);
      expect(mockSetStyleOptions).toHaveBeenCalledWith({ showFallbackUrl: true });
    });

    it('shows checked state when showFallbackUrl is true', () => {
      mockStyleOptions = { ...mockStyleOptions, showFallbackUrl: true };
      render(<StyleSection />);
      const toggle = screen.getByRole('switch', { name: 'Show Fallback Text' });
      expect(toggle).toHaveAttribute('aria-checked', 'true');
    });
  });
});
