import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { StepContent } from '../steps/StepContent';
import type { QRCodeType } from '@/types';

// Mock stores
const mockNextStep = vi.fn();
const mockPrevStep = vi.fn();
const mockSkipToDownload = vi.fn();
const mockSetCampaignName = vi.fn();
let mockActiveType: QRCodeType = 'url';
let mockCampaignName = '';
const mockGetQRValue = vi.fn().mockReturnValue('https://example.com');

vi.mock('@/stores/qrStore', () => ({
  useQRStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      activeType: mockActiveType,
      getQRValue: mockGetQRValue,
      campaignName: mockCampaignName,
      setCampaignName: mockSetCampaignName,
    }),
}));

vi.mock('@/stores/wizardStore', () => ({
  useWizardStore: () => ({
    nextStep: mockNextStep,
    prevStep: mockPrevStep,
    skipToDownload: mockSkipToDownload,
  }),
}));

// Mock form components — render placeholders
vi.mock('@/components/qr-types', () => ({
  UrlForm: () => <div data-testid="url-form">UrlForm</div>,
  TextForm: () => <div data-testid="text-form">TextForm</div>,
  EmailForm: () => <div data-testid="email-form">EmailForm</div>,
  PhoneForm: () => <div data-testid="phone-form">PhoneForm</div>,
  SmsForm: () => <div data-testid="sms-form">SmsForm</div>,
  WifiForm: () => <div data-testid="wifi-form">WifiForm</div>,
  VCardForm: () => <div data-testid="vcard-form">VCardForm</div>,
  EventForm: () => <div data-testid="event-form">EventForm</div>,
  LocationForm: () => <div data-testid="location-form">LocationForm</div>,
}));

describe('StepContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockActiveType = 'url';
    mockCampaignName = '';
    mockGetQRValue.mockReturnValue('https://example.com');
  });

  describe('type header', () => {
    it('shows URL header for url type', () => {
      render(<StepContent />);
      expect(screen.getByText('URL')).toBeInTheDocument();
    });

    it('shows Plain Text header for text type', () => {
      mockActiveType = 'text';
      render(<StepContent />);
      expect(screen.getByText('Plain Text')).toBeInTheDocument();
    });

    it('shows Email header for email type', () => {
      mockActiveType = 'email';
      render(<StepContent />);
      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('shows WiFi Network header for wifi type', () => {
      mockActiveType = 'wifi';
      render(<StepContent />);
      expect(screen.getByText('WiFi Network')).toBeInTheDocument();
    });

    it('shows Contact Card header for vcard type', () => {
      mockActiveType = 'vcard';
      render(<StepContent />);
      expect(screen.getByText('Contact Card')).toBeInTheDocument();
    });

    it('shows Calendar Event header for event type', () => {
      mockActiveType = 'event';
      render(<StepContent />);
      expect(screen.getByText('Calendar Event')).toBeInTheDocument();
    });

    it('shows step indicator', () => {
      render(<StepContent />);
      expect(screen.getByText('Step 2 of 4')).toBeInTheDocument();
    });
  });

  describe('form rendering', () => {
    const typeFormMap: [QRCodeType, string][] = [
      ['url', 'url-form'],
      ['text', 'text-form'],
      ['email', 'email-form'],
      ['phone', 'phone-form'],
      ['sms', 'sms-form'],
      ['wifi', 'wifi-form'],
      ['vcard', 'vcard-form'],
      ['event', 'event-form'],
      ['location', 'location-form'],
    ];

    it.each(typeFormMap)('renders %s form for %s type', (type, testId) => {
      mockActiveType = type;
      render(<StepContent />);
      expect(screen.getByTestId(testId)).toBeInTheDocument();
    });
  });

  describe('campaign name', () => {
    it('renders campaign name input', () => {
      render(<StepContent />);
      expect(screen.getByLabelText('Campaign Name')).toBeInTheDocument();
    });

    it('shows campaign name value from store', () => {
      mockCampaignName = 'Summer Sale';
      render(<StepContent />);
      expect(screen.getByDisplayValue('Summer Sale')).toBeInTheDocument();
    });

    it('calls setCampaignName on input change', async () => {
      const { user } = render(<StepContent />);
      const input = screen.getByLabelText('Campaign Name');
      await user.type(input, 'A');
      expect(mockSetCampaignName).toHaveBeenCalled();
    });

    it('shows helper text', () => {
      render(<StepContent />);
      expect(screen.getByText(/Optional — give your QR code a memorable name/)).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    it('renders Back button', () => {
      render(<StepContent />);
      expect(screen.getByRole('button', { name: /Back/ })).toBeInTheDocument();
    });

    it('calls prevStep on Back click', async () => {
      const { user } = render(<StepContent />);
      await user.click(screen.getByRole('button', { name: /Back/ }));
      expect(mockPrevStep).toHaveBeenCalledTimes(1);
    });

    it('renders Customize button', () => {
      render(<StepContent />);
      expect(screen.getByRole('button', { name: /Customize/ })).toBeInTheDocument();
    });

    it('calls nextStep on Customize click', async () => {
      const { user } = render(<StepContent />);
      await user.click(screen.getByRole('button', { name: /Customize/ }));
      expect(mockNextStep).toHaveBeenCalledTimes(1);
    });

    it('renders Quick Download button', () => {
      render(<StepContent />);
      expect(screen.getByRole('button', { name: /Quick Download/ })).toBeInTheDocument();
    });

    it('calls skipToDownload on Quick Download click', async () => {
      const { user } = render(<StepContent />);
      await user.click(screen.getByRole('button', { name: /Quick Download/ }));
      expect(mockSkipToDownload).toHaveBeenCalledTimes(1);
    });
  });

  describe('button states', () => {
    it('disables Customize when no content', () => {
      mockGetQRValue.mockReturnValue('');
      render(<StepContent />);
      expect(screen.getByRole('button', { name: /Customize/ })).toBeDisabled();
    });

    it('enables Customize when content exists', () => {
      mockGetQRValue.mockReturnValue('https://example.com');
      render(<StepContent />);
      expect(screen.getByRole('button', { name: /Customize/ })).not.toBeDisabled();
    });

    it('disables Quick Download when no content', () => {
      mockGetQRValue.mockReturnValue('');
      render(<StepContent />);
      expect(screen.getByRole('button', { name: /Quick Download/ })).toBeDisabled();
    });
  });
});
