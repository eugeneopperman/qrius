import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { WizardPreview } from '../WizardPreview';
import type { WizardStep } from '@/stores/wizardStore';

// Mock store state
let mockCurrentStep: WizardStep = 2;
let mockActiveType = 'url';

vi.mock('@/stores/wizardStore', () => ({
  useWizardStore: () => ({
    currentStep: mockCurrentStep,
  }),
}));

vi.mock('@/stores/qrStore', () => ({
  useQRStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      activeType: mockActiveType,
    }),
}));

// Mock QRPreview — named export with forwardRef
vi.mock('../../QRPreview', () => ({
  QRPreview: React.forwardRef(function QRPreviewMock(
    _props: Record<string, unknown>,
    ref: React.Ref<unknown>
  ) {
    return <div data-testid="qr-preview" ref={ref as React.Ref<HTMLDivElement>}>QR Preview</div>;
  }),
}));

// Mock ScannabilityScore — named export
vi.mock('../../features/ScannabilityScore', () => ({
  ScannabilityScore: () => <div data-testid="scannability-score">ScannabilityScore</div>,
}));

describe('WizardPreview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCurrentStep = 2;
    mockActiveType = 'url';
  });

  describe('visibility by step', () => {
    it('returns null on step 1 (Type selection)', () => {
      mockCurrentStep = 1;
      const { container } = render(<WizardPreview />);
      expect(container.innerHTML).toBe('');
    });

    it('returns null on step 4 (Download)', () => {
      mockCurrentStep = 4;
      const { container } = render(<WizardPreview />);
      expect(container.innerHTML).toBe('');
    });

    it('renders QR preview on step 2 (Content)', () => {
      mockCurrentStep = 2;
      render(<WizardPreview />);
      expect(screen.getByTestId('qr-preview')).toBeInTheDocument();
    });

    it('renders QR preview on step 3 (Customize)', () => {
      mockCurrentStep = 3;
      render(<WizardPreview />);
      expect(screen.getByTestId('qr-preview')).toBeInTheDocument();
    });
  });

  describe('type label', () => {
    it('shows "URL QR" label for url type', () => {
      mockActiveType = 'url';
      render(<WizardPreview />);
      expect(screen.getByText('URL QR')).toBeInTheDocument();
    });

    it('shows "Text QR" label for text type', () => {
      mockActiveType = 'text';
      render(<WizardPreview />);
      expect(screen.getByText('Text QR')).toBeInTheDocument();
    });

    it('shows "Email QR" label for email type', () => {
      mockActiveType = 'email';
      render(<WizardPreview />);
      expect(screen.getByText('Email QR')).toBeInTheDocument();
    });

    it('shows "WiFi QR" label for wifi type', () => {
      mockActiveType = 'wifi';
      render(<WizardPreview />);
      expect(screen.getByText('WiFi QR')).toBeInTheDocument();
    });

    it('shows "vCard QR" label for vcard type', () => {
      mockActiveType = 'vcard';
      render(<WizardPreview />);
      expect(screen.getByText('vCard QR')).toBeInTheDocument();
    });

    it('shows "Event QR" label for event type', () => {
      mockActiveType = 'event';
      render(<WizardPreview />);
      expect(screen.getByText('Event QR')).toBeInTheDocument();
    });

    it('shows "Location QR" label for location type', () => {
      mockActiveType = 'location';
      render(<WizardPreview />);
      expect(screen.getByText('Location QR')).toBeInTheDocument();
    });
  });

  describe('ScannabilityScore', () => {
    it('shows ScannabilityScore on step 3 (Customize)', () => {
      mockCurrentStep = 3;
      render(<WizardPreview />);
      expect(screen.getByTestId('scannability-score')).toBeInTheDocument();
    });

    it('does not show ScannabilityScore on step 2 (Content)', () => {
      mockCurrentStep = 2;
      render(<WizardPreview />);
      expect(screen.queryByTestId('scannability-score')).not.toBeInTheDocument();
    });
  });

  describe('compact mode', () => {
    it('shows "Live Preview" label in compact mode', () => {
      mockCurrentStep = 2;
      render(<WizardPreview compact />);
      expect(screen.getByText('Live Preview')).toBeInTheDocument();
    });

    it('does not show type label in compact mode', () => {
      mockCurrentStep = 2;
      mockActiveType = 'url';
      render(<WizardPreview compact />);
      expect(screen.queryByText('URL QR')).not.toBeInTheDocument();
    });

    it('renders QR preview in compact mode', () => {
      mockCurrentStep = 2;
      render(<WizardPreview compact />);
      expect(screen.getByTestId('qr-preview')).toBeInTheDocument();
    });
  });
});
