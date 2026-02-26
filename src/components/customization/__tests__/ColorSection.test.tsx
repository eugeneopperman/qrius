import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { ColorSection } from '../ColorSection';

// ── Store mock ──────────────────────────────────────────────────────────────
const mockSetStyleOptions = vi.fn();
let mockStyleOptions: Record<string, unknown> = {
  dotsColor: '#000000',
  backgroundColor: '#FFFFFF',
  useGradient: false,
  gradient: null,
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

// ── Utility mock ────────────────────────────────────────────────────────────
vi.mock('@/utils/gradientUtils', () => ({
  getGradientPreview: () => 'linear-gradient(45deg, #6366F1, #EC4899)',
}));

describe('ColorSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStyleOptions = {
      dotsColor: '#000000',
      backgroundColor: '#FFFFFF',
      useGradient: false,
      gradient: null,
    };
  });

  // ── Solid mode (default) ────────────────────────────────────────────────
  describe('solid color mode', () => {
    it('renders "Use Gradient" toggle', () => {
      render(<ColorSection />);
      expect(screen.getByText('Use Gradient')).toBeInTheDocument();
    });

    it('renders the toggle as a switch element', () => {
      render(<ColorSection />);
      const toggle = screen.getByRole('switch', { name: 'Use Gradient' });
      expect(toggle).toBeInTheDocument();
      expect(toggle).toHaveAttribute('aria-checked', 'false');
    });

    it('renders "QR Code Color" label', () => {
      render(<ColorSection />);
      expect(screen.getByText('QR Code Color')).toBeInTheDocument();
    });

    it('renders "Background Color" label', () => {
      render(<ColorSection />);
      expect(screen.getByText('Background Color')).toBeInTheDocument();
    });

    it('renders "Color Palettes" label', () => {
      render(<ColorSection />);
      expect(screen.getByText('Color Palettes')).toBeInTheDocument();
    });

    it('renders all 8 palette preset buttons', () => {
      render(<ColorSection />);
      // Each palette has a title attribute with its name
      expect(screen.getByTitle('Classic')).toBeInTheDocument();
      expect(screen.getByTitle('Indigo')).toBeInTheDocument();
      expect(screen.getByTitle('Ocean')).toBeInTheDocument();
      expect(screen.getByTitle('Forest')).toBeInTheDocument();
      expect(screen.getByTitle('Sunset')).toBeInTheDocument();
      expect(screen.getByTitle('Berry')).toBeInTheDocument();
      expect(screen.getByTitle('Slate')).toBeInTheDocument();
      expect(screen.getByTitle('Inverted')).toBeInTheDocument();
    });

    it('clicking a palette preset calls setStyleOptions with qrColor and bgColor', async () => {
      const { user } = render(<ColorSection />);
      await user.click(screen.getByTitle('Ocean'));
      expect(mockSetStyleOptions).toHaveBeenCalledWith({
        dotsColor: '#0369A1',
        backgroundColor: '#F0F9FF',
      });
    });

    it('renders contrast tip text', () => {
      render(<ColorSection />);
      expect(
        screen.getByText(/Ensure good contrast between colors/)
      ).toBeInTheDocument();
    });
  });

  // ── Toggling gradient on ────────────────────────────────────────────────
  describe('toggling gradient', () => {
    it('toggling gradient calls setStyleOptions with useGradient true and default gradient', async () => {
      const { user } = render(<ColorSection />);
      const toggle = screen.getByRole('switch', { name: 'Use Gradient' });
      await user.click(toggle);
      expect(mockSetStyleOptions).toHaveBeenCalledWith(
        expect.objectContaining({ useGradient: true })
      );
    });
  });

  // ── Gradient mode ──────────────────────────────────────────────────────
  describe('gradient mode', () => {
    beforeEach(() => {
      mockStyleOptions = {
        dotsColor: '#000000',
        backgroundColor: '#FFFFFF',
        useGradient: true,
        gradient: {
          type: 'linear',
          rotation: 45,
          colorStops: [
            { offset: 0, color: '#6366F1' },
            { offset: 1, color: '#EC4899' },
          ],
        },
      };
    });

    it('renders gradient type label', () => {
      render(<ColorSection />);
      expect(screen.getByText('Gradient Type')).toBeInTheDocument();
    });

    it('renders Linear and Radial type buttons (capitalized)', () => {
      render(<ColorSection />);
      expect(screen.getByRole('button', { name: 'linear' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'radial' })).toBeInTheDocument();
    });

    it('renders color stop labels Start and End', () => {
      render(<ColorSection />);
      expect(screen.getByText('Start')).toBeInTheDocument();
      expect(screen.getByText('End')).toBeInTheDocument();
    });

    it('renders "Colors" label for gradient color stops', () => {
      render(<ColorSection />);
      expect(screen.getByText('Colors')).toBeInTheDocument();
    });

    it('renders "Preview" label for gradient preview', () => {
      render(<ColorSection />);
      expect(screen.getByText('Preview')).toBeInTheDocument();
    });

    it('renders "Presets" label for gradient presets', () => {
      render(<ColorSection />);
      expect(screen.getByText('Presets')).toBeInTheDocument();
    });

    it('renders 6 gradient preset buttons', () => {
      render(<ColorSection />);
      expect(screen.getByTitle('Indigo to Pink')).toBeInTheDocument();
      expect(screen.getByTitle('Blue to Cyan')).toBeInTheDocument();
      expect(screen.getByTitle('Green to Yellow')).toBeInTheDocument();
      expect(screen.getByTitle('Purple to Orange')).toBeInTheDocument();
      expect(screen.getByTitle('Red to Pink')).toBeInTheDocument();
      expect(screen.getByTitle('Teal Radial')).toBeInTheDocument();
    });

    it('clicking a gradient preset calls setStyleOptions with gradient', async () => {
      const { user } = render(<ColorSection />);
      await user.click(screen.getByTitle('Blue to Cyan'));
      expect(mockSetStyleOptions).toHaveBeenCalledWith({
        gradient: {
          type: 'linear',
          rotation: 90,
          colorStops: [
            { offset: 0, color: '#3B82F6' },
            { offset: 1, color: '#06B6D4' },
          ],
        },
      });
    });

    it('does not render "Color Palettes" in gradient mode', () => {
      render(<ColorSection />);
      expect(screen.queryByText('Color Palettes')).not.toBeInTheDocument();
    });

    it('still renders "Background Color" label in gradient mode', () => {
      render(<ColorSection />);
      expect(screen.getByText('Background Color')).toBeInTheDocument();
    });
  });
});
