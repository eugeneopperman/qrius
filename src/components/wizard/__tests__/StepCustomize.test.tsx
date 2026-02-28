import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { StepCustomize } from '../steps/StepCustomize';

// Mock stores
const mockNextStep = vi.fn();
const mockPrevStep = vi.fn();

vi.mock('@/stores/wizardStore', () => ({
  useWizardStore: () => ({
    nextStep: mockNextStep,
    prevStep: mockPrevStep,
  }),
}));

// Mock all section components to be lightweight
vi.mock('@/components/customization/ColorSection', () => ({
  ColorSection: () => <div data-testid="color-section">ColorSection</div>,
}));

vi.mock('@/components/customization/LogoSection', () => ({
  LogoSection: () => <div data-testid="logo-section">LogoSection</div>,
}));

vi.mock('@/components/customization/StyleSection', () => ({
  StyleSection: () => <div data-testid="style-section">StyleSection</div>,
}));

vi.mock('@/components/customization/FrameSection', () => ({
  FrameSection: () => <div data-testid="frame-section">FrameSection</div>,
}));

vi.mock('@/components/customization/MoreSection', () => ({
  MoreSection: () => <div data-testid="more-section">MoreSection</div>,
}));

vi.mock('@/components/customization/TemplatePickerSection', () => ({
  TemplatePickerSection: () => <div data-testid="template-picker-section">TemplatePickerSection</div>,
}));

describe('StepCustomize', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders heading "Customize your QR code"', () => {
      render(<StepCustomize />);
      expect(screen.getByText('Customize your QR code')).toBeInTheDocument();
    });

    it('renders subtitle text', () => {
      render(<StepCustomize />);
      expect(screen.getByText('Make it unique with colors, logos, and styles')).toBeInTheDocument();
    });

    it('renders 6 tab labels', () => {
      render(<StepCustomize />);
      expect(screen.getByText('Templates')).toBeInTheDocument();
      expect(screen.getByText('Colors')).toBeInTheDocument();
      expect(screen.getByText('Logo')).toBeInTheDocument();
      expect(screen.getByText('Style')).toBeInTheDocument();
      expect(screen.getByText('Frame')).toBeInTheDocument();
      expect(screen.getByText('More')).toBeInTheDocument();
    });

    it('renders Back button', () => {
      render(<StepCustomize />);
      expect(screen.getByRole('button', { name: /Back/ })).toBeInTheDocument();
    });

    it('renders Complete button', () => {
      render(<StepCustomize />);
      expect(screen.getByRole('button', { name: /Complete/ })).toBeInTheDocument();
    });

    it('renders Templates section by default (first tab)', () => {
      render(<StepCustomize />);
      expect(screen.getByTestId('template-picker-section')).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    it('calls prevStep when Back button is clicked', async () => {
      const { user } = render(<StepCustomize />);
      await user.click(screen.getByRole('button', { name: /Back/ }));
      expect(mockPrevStep).toHaveBeenCalledTimes(1);
    });

    it('calls nextStep when Complete button is clicked', async () => {
      const { user } = render(<StepCustomize />);
      await user.click(screen.getByRole('button', { name: /Complete/ }));
      expect(mockNextStep).toHaveBeenCalledTimes(1);
    });
  });

  describe('tab switching', () => {
    it('shows Colors section when Colors tab is clicked', async () => {
      const { user } = render(<StepCustomize />);
      await user.click(screen.getByText('Colors'));
      expect(screen.getByTestId('color-section')).toBeInTheDocument();
    });

    it('shows Logo section when Logo tab is clicked', async () => {
      const { user } = render(<StepCustomize />);
      await user.click(screen.getByText('Logo'));
      expect(screen.getByTestId('logo-section')).toBeInTheDocument();
    });

    it('shows Style section when Style tab is clicked', async () => {
      const { user } = render(<StepCustomize />);
      await user.click(screen.getByText('Style'));
      expect(screen.getByTestId('style-section')).toBeInTheDocument();
    });

    it('shows Frame section when Frame tab is clicked', async () => {
      const { user } = render(<StepCustomize />);
      await user.click(screen.getByText('Frame'));
      expect(screen.getByTestId('frame-section')).toBeInTheDocument();
    });

    it('shows More section when More tab is clicked', async () => {
      const { user } = render(<StepCustomize />);
      await user.click(screen.getByText('More'));
      expect(screen.getByTestId('more-section')).toBeInTheDocument();
    });
  });
});
