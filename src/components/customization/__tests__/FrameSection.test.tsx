import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { FrameSection } from '../FrameSection';

// ── Store mock ──────────────────────────────────────────────────────────────
const mockSetStyleOptions = vi.fn();
let mockStyleOptions: Record<string, unknown> = {
  frameStyle: 'none',
  frameLabel: 'Scan Me',
  frameBorderColor: '#000000',
  frameBgColor: '#FFFFFF',
  frameBorderRadius: 8,
  framePadding: 16,
  frameFontSize: 'base',
  frameFontFamily: 'sans',
  frameIcon: 'none',
  frameIconPosition: 'left',
  frameSpeechPointer: 'bottom',
  frameGradientColors: ['#F97316', '#EC4899'],
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

describe('FrameSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStyleOptions = {
      frameStyle: 'none',
      frameLabel: 'Scan Me',
      frameBorderColor: '#000000',
      frameBgColor: '#FFFFFF',
      frameBorderRadius: 8,
      framePadding: 16,
      frameFontSize: 'base',
      frameFontFamily: 'sans',
      frameIcon: 'none',
      frameIconPosition: 'left',
      frameSpeechPointer: 'bottom',
      frameGradientColors: ['#F97316', '#EC4899'],
    };
  });

  // ── Frame style rendering ─────────────────────────────────────────────
  describe('frame style rendering', () => {
    it('renders "Frame Style" label', () => {
      render(<FrameSection />);
      expect(screen.getByText('Frame Style')).toBeInTheDocument();
    });

    it('renders category headings', () => {
      render(<FrameSection />);
      expect(screen.getByText('Basic')).toBeInTheDocument();
      expect(screen.getByText('Label')).toBeInTheDocument();
      expect(screen.getByText('Decorative')).toBeInTheDocument();
      expect(screen.getByText('Shaped & Effects')).toBeInTheDocument();
    });

    it('renders "None" frame option in Basic category', () => {
      render(<FrameSection />);
      expect(screen.getByText('None')).toBeInTheDocument();
    });

    it('renders all basic frame options', () => {
      render(<FrameSection />);
      expect(screen.getByText('Simple')).toBeInTheDocument();
      expect(screen.getByText('Rounded')).toBeInTheDocument();
      expect(screen.getByText('Minimal Line')).toBeInTheDocument();
    });

    it('renders all label frame options', () => {
      render(<FrameSection />);
      expect(screen.getByText('Bottom Label')).toBeInTheDocument();
      expect(screen.getByText('Top Label')).toBeInTheDocument();
      expect(screen.getByText('Badge')).toBeInTheDocument();
      expect(screen.getByText('Bottom Banner')).toBeInTheDocument();
      expect(screen.getByText('Top Banner')).toBeInTheDocument();
    });

    it('renders all decorative frame options', () => {
      render(<FrameSection />);
      expect(screen.getByText('Speech Bubble')).toBeInTheDocument();
      expect(screen.getByText('Ribbon')).toBeInTheDocument();
      expect(screen.getByText('Sticker')).toBeInTheDocument();
      expect(screen.getByText('Corners')).toBeInTheDocument();
    });

    it('renders all shaped/effects frame options', () => {
      render(<FrameSection />);
      expect(screen.getByText('Circular')).toBeInTheDocument();
      expect(screen.getByText('Gradient')).toBeInTheDocument();
      expect(screen.getByText('3D Shadow')).toBeInTheDocument();
    });
  });

  // ── Frame selection ───────────────────────────────────────────────────
  describe('frame selection', () => {
    it('clicking a frame option calls setStyleOptions with frameStyle', async () => {
      const { user } = render(<FrameSection />);
      await user.click(screen.getByText('Simple'));
      expect(mockSetStyleOptions).toHaveBeenCalledWith({ frameStyle: 'simple' });
    });

    it('clicking Bottom Label calls setStyleOptions with bottom-label', async () => {
      const { user } = render(<FrameSection />);
      await user.click(screen.getByText('Bottom Label'));
      expect(mockSetStyleOptions).toHaveBeenCalledWith({ frameStyle: 'bottom-label' });
    });

    it('selected frame has aria-pressed true', () => {
      render(<FrameSection />);
      // "none" is the selected frame style
      const noneButton = screen.getByText('None').closest('button');
      expect(noneButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('non-selected frame has aria-pressed false', () => {
      render(<FrameSection />);
      const simpleButton = screen.getByText('Simple').closest('button');
      expect(simpleButton).toHaveAttribute('aria-pressed', 'false');
    });
  });

  // ── Label input (hidden when frameStyle is 'none') ────────────────────
  describe('label input visibility', () => {
    it('does not render label input when frame is "none"', () => {
      render(<FrameSection />);
      expect(screen.queryByText('Label Text')).not.toBeInTheDocument();
      expect(screen.queryByPlaceholderText('Enter label text...')).not.toBeInTheDocument();
    });

    it('does not render quick suggestions when frame is "none"', () => {
      render(<FrameSection />);
      expect(screen.queryByText('Quick suggestions:')).not.toBeInTheDocument();
    });

    it('does not render border radius/padding sliders when frame is "none"', () => {
      render(<FrameSection />);
      expect(screen.queryByText('Border Radius')).not.toBeInTheDocument();
      expect(screen.queryByText('Padding')).not.toBeInTheDocument();
    });
  });

  // ── Label input (shown for label frames) ──────────────────────────────
  describe('label input for label frames', () => {
    beforeEach(() => {
      mockStyleOptions = {
        ...mockStyleOptions,
        frameStyle: 'bottom-label',
        frameLabel: 'Scan Me',
      };
    });

    it('renders "Label Text" heading', () => {
      render(<FrameSection />);
      expect(screen.getByText('Label Text')).toBeInTheDocument();
    });

    it('renders label input with placeholder', () => {
      render(<FrameSection />);
      expect(screen.getByPlaceholderText('Enter label text...')).toBeInTheDocument();
    });

    it('renders label input with current value', () => {
      render(<FrameSection />);
      const input = screen.getByPlaceholderText('Enter label text...');
      expect(input).toHaveValue('Scan Me');
    });

    it('renders "Quick suggestions:" text', () => {
      render(<FrameSection />);
      expect(screen.getByText('Quick suggestions:')).toBeInTheDocument();
    });

    it('renders all 12 quick label buttons', () => {
      render(<FrameSection />);
      expect(screen.getByRole('button', { name: 'Scan Me' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Learn More' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Visit Us' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Download App' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Get Coupon' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Follow Us' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Order Now' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Shop Now' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Book Now' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Free Trial' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Watch Video' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
    });

    it('clicking a quick label button calls setStyleOptions with that label', async () => {
      const { user } = render(<FrameSection />);
      await user.click(screen.getByRole('button', { name: 'Learn More' }));
      expect(mockSetStyleOptions).toHaveBeenCalledWith({ frameLabel: 'Learn More' });
    });

    it('renders character count', () => {
      render(<FrameSection />);
      expect(screen.getByText('7/30 characters')).toBeInTheDocument();
    });

    it('renders "Text Options" collapsible button', () => {
      render(<FrameSection />);
      expect(screen.getByText('Text Options')).toBeInTheDocument();
    });

    it('renders border radius and padding sliders', () => {
      render(<FrameSection />);
      expect(screen.getByText('Border Radius')).toBeInTheDocument();
      expect(screen.getByText('Padding')).toBeInTheDocument();
    });
  });

  // ── Non-label frame shows sliders but not label input ─────────────────
  describe('non-label frame (e.g. simple)', () => {
    beforeEach(() => {
      mockStyleOptions = {
        ...mockStyleOptions,
        frameStyle: 'simple',
      };
    });

    it('does not render label input', () => {
      render(<FrameSection />);
      expect(screen.queryByText('Label Text')).not.toBeInTheDocument();
    });

    it('renders border radius and padding sliders for non-none frame', () => {
      render(<FrameSection />);
      expect(screen.getByText('Border Radius')).toBeInTheDocument();
      expect(screen.getByText('Padding')).toBeInTheDocument();
    });
  });
});
