import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { StepType } from '../steps/StepType';
import type { QRCodeType } from '@/types';

// Mock stores
const mockSetActiveType = vi.fn();
const mockNextStep = vi.fn();
let mockActiveType: QRCodeType = 'url';

vi.mock('@/stores/qrStore', () => ({
  useQRStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      activeType: mockActiveType,
      setActiveType: mockSetActiveType,
    }),
}));

vi.mock('zustand/react/shallow', () => ({
  useShallow: (selector: (state: Record<string, unknown>) => unknown) => selector,
}));

vi.mock('@/stores/wizardStore', () => ({
  useWizardStore: () => ({
    nextStep: mockNextStep,
  }),
}));

describe('StepType', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockActiveType = 'url';
  });

  describe('rendering', () => {
    it('renders heading "What would you like to create?"', () => {
      render(<StepType />);
      expect(screen.getByText('What would you like to create?')).toBeInTheDocument();
    });

    it('renders subtitle text', () => {
      render(<StepType />);
      expect(screen.getByText('Choose the type of QR code you want to generate')).toBeInTheDocument();
    });

    it('renders all 9 type option labels', () => {
      render(<StepType />);
      const expectedLabels = ['URL', 'Text', 'Email', 'Phone', 'SMS', 'WiFi', 'vCard', 'Event', 'Location'];
      for (const label of expectedLabels) {
        expect(screen.getByText(label)).toBeInTheDocument();
      }
    });

    it('renders 9 clickable buttons', () => {
      render(<StepType />);
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(9);
    });

    it('renders description for each type', () => {
      render(<StepType />);
      expect(screen.getByText('Website link')).toBeInTheDocument();
      expect(screen.getByText('Plain text message')).toBeInTheDocument();
      expect(screen.getByText('Email address')).toBeInTheDocument();
      expect(screen.getByText('Phone number')).toBeInTheDocument();
      expect(screen.getByText('Text message')).toBeInTheDocument();
      expect(screen.getByText('Network credentials')).toBeInTheDocument();
      expect(screen.getByText('Contact card')).toBeInTheDocument();
      expect(screen.getByText('Calendar event')).toBeInTheDocument();
      expect(screen.getByText('Map coordinates')).toBeInTheDocument();
    });

    it('renders example hint for each type', () => {
      render(<StepType />);
      expect(screen.getByText('https://example.com')).toBeInTheDocument();
      expect(screen.getByText('Hello world!')).toBeInTheDocument();
      expect(screen.getByText('hello@example.com')).toBeInTheDocument();
      expect(screen.getByText('+1 234 567 8900')).toBeInTheDocument();
      expect(screen.getByText('Send a message')).toBeInTheDocument();
      expect(screen.getByText('Join network')).toBeInTheDocument();
      expect(screen.getByText('Save contact')).toBeInTheDocument();
      expect(screen.getByText('Add to calendar')).toBeInTheDocument();
      expect(screen.getByText('Open in maps')).toBeInTheDocument();
    });
  });

  describe('selection', () => {
    it('clicking a type calls setActiveType with the type id', async () => {
      const { user } = render(<StepType />);
      await user.click(screen.getByText('Email'));
      expect(mockSetActiveType).toHaveBeenCalledWith('email');
    });

    it('clicking a type calls nextStep to advance', async () => {
      const { user } = render(<StepType />);
      await user.click(screen.getByText('WiFi'));
      expect(mockNextStep).toHaveBeenCalledTimes(1);
    });

    it('clicking URL calls setActiveType with url', async () => {
      const { user } = render(<StepType />);
      await user.click(screen.getByText('URL'));
      expect(mockSetActiveType).toHaveBeenCalledWith('url');
    });

    it('clicking Phone calls setActiveType with phone', async () => {
      const { user } = render(<StepType />);
      await user.click(screen.getByText('Phone'));
      expect(mockSetActiveType).toHaveBeenCalledWith('phone');
    });

    it('clicking Location calls setActiveType with location', async () => {
      const { user } = render(<StepType />);
      await user.click(screen.getByText('Location'));
      expect(mockSetActiveType).toHaveBeenCalledWith('location');
    });
  });

  describe('selected state', () => {
    it('URL type has selected border when activeType is url', () => {
      render(<StepType />);
      // The URL button should have border-orange-500/70 class
      const urlButton = screen.getByText('URL').closest('button')!;
      expect(urlButton.className).toContain('border-orange-500');
    });

    it('selected type shows orange dot indicator', () => {
      render(<StepType />);
      const urlButton = screen.getByText('URL').closest('button')!;
      // The selected indicator is a div with bg-orange-500 rounded-full
      const indicator = urlButton.querySelector('.bg-orange-500.rounded-full');
      expect(indicator).toBeInTheDocument();
    });

    it('non-selected types do not have selected border', () => {
      render(<StepType />);
      const emailButton = screen.getByText('Email').closest('button')!;
      expect(emailButton.className).not.toContain('border-orange-500');
    });

    it('different activeType highlights correct option', () => {
      mockActiveType = 'event';
      render(<StepType />);
      const eventButton = screen.getByText('Event').closest('button')!;
      expect(eventButton.className).toContain('border-orange-500');
      const urlButton = screen.getByText('URL').closest('button')!;
      expect(urlButton.className).not.toContain('border-orange-500');
    });
  });
});
