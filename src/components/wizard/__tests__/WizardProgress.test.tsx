import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { WizardProgress } from '../WizardProgress';
import type { WizardStep } from '@/stores/wizardStore';

// Mock store state
let mockCurrentStep: WizardStep = 1;
let mockCompletedSteps = new Set<WizardStep>();
const mockGoToStep = vi.fn();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let mockIsStepAccessible = (_step: WizardStep): boolean => true;

vi.mock('@/stores/wizardStore', () => ({
  useWizardStore: () => ({
    currentStep: mockCurrentStep,
    completedSteps: mockCompletedSteps,
    goToStep: mockGoToStep,
    isStepAccessible: (step: WizardStep) => mockIsStepAccessible(step),
  }),
}));

describe('WizardProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCurrentStep = 1;
    mockCompletedSteps = new Set();
    mockIsStepAccessible = () => true;
  });

  describe('rendering', () => {
    it('renders all 4 step labels in desktop view', () => {
      render(<WizardProgress />);
      // Desktop renders all 4 labels; mobile also shows current step label
      // "Type" appears in both desktop and mobile when currentStep=1
      const typeElements = screen.getAllByText('Type');
      expect(typeElements.length).toBeGreaterThanOrEqual(1);
      // Content, Style, Complete appear only in desktop
      expect(screen.getByText('Content')).toBeInTheDocument();
      expect(screen.getByText('Style')).toBeInTheDocument();
      expect(screen.getByText('Complete')).toBeInTheDocument();
    });

    it('renders mobile step indicator with step number', () => {
      render(<WizardProgress />);
      // Mobile view renders "Step {n} of 4" — use regex since text spans multiple nodes
      expect(screen.getByText(/Step/)).toBeInTheDocument();
    });

    it('renders step 4 buttons', () => {
      render(<WizardProgress />);
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(4);
    });

    it('shows current step label in mobile view', () => {
      mockCurrentStep = 3;
      render(<WizardProgress />);
      // "Style" appears in both desktop (always) and mobile (when current)
      const styleElements = screen.getAllByText('Style');
      expect(styleElements.length).toBe(2);
    });

    it('shows different mobile label when step changes', () => {
      mockCurrentStep = 4;
      render(<WizardProgress />);
      // "Complete" appears in desktop view and in mobile current-step label
      const downloadElements = screen.getAllByText('Complete');
      expect(downloadElements.length).toBe(2);
    });
  });

  describe('step states', () => {
    it('shows step number for non-completed non-current steps', () => {
      mockCurrentStep = 1;
      render(<WizardProgress />);
      // Steps 2, 3, 4 should show their numbers in the circle
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
    });

    it('shows step number for current step', () => {
      mockCurrentStep = 2;
      render(<WizardProgress />);
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('completed non-current steps show checkmark instead of number', () => {
      mockCurrentStep = 2;
      mockCompletedSteps = new Set<WizardStep>([1]);
      render(<WizardProgress />);
      // Step 1 is completed and not current, so its button shows a Check SVG
      const buttons = screen.getAllByRole('button');
      const typeButton = buttons.find(btn => btn.textContent?.includes('Type'));
      expect(typeButton).toBeDefined();
      // The number "1" should not appear since it's replaced by checkmark
      expect(typeButton!.textContent).not.toContain('1');
    });

    it('current step circle has orange background', () => {
      mockCurrentStep = 2;
      render(<WizardProgress />);
      const buttons = screen.getAllByRole('button');
      const contentButton = buttons.find(btn => btn.textContent?.includes('Content'));
      expect(contentButton).toBeDefined();
      const circle = contentButton!.querySelector('.bg-orange-500');
      expect(circle).toBeInTheDocument();
    });

    it('completed non-current step circle has green background', () => {
      mockCurrentStep = 3;
      mockCompletedSteps = new Set<WizardStep>([1, 2]);
      render(<WizardProgress />);
      const buttons = screen.getAllByRole('button');
      const contentButton = buttons.find(btn => btn.textContent?.includes('Content'));
      expect(contentButton).toBeDefined();
      const circle = contentButton!.querySelector('.bg-green-500');
      expect(circle).toBeInTheDocument();
    });
  });

  describe('step navigation', () => {
    it('calls goToStep when accessible step button is clicked', async () => {
      mockCurrentStep = 2;
      mockCompletedSteps = new Set<WizardStep>([1]);
      const { user } = render(<WizardProgress />);
      const buttons = screen.getAllByRole('button');
      const typeButton = buttons.find(btn => btn.textContent?.includes('Type'));
      expect(typeButton).toBeDefined();
      await user.click(typeButton!);
      expect(mockGoToStep).toHaveBeenCalledWith(1);
    });

    it('does not call goToStep when inaccessible step is clicked', async () => {
      mockCurrentStep = 1;
      mockIsStepAccessible = (step: WizardStep) => step === 1;
      const { user } = render(<WizardProgress />);
      const buttons = screen.getAllByRole('button');
      const downloadButton = buttons.find(btn => btn.textContent?.includes('Complete'));
      expect(downloadButton).toBeDefined();
      await user.click(downloadButton!);
      expect(mockGoToStep).not.toHaveBeenCalled();
    });

    it('inaccessible steps have disabled attribute', () => {
      mockIsStepAccessible = (step: WizardStep) => step <= 2;
      render(<WizardProgress />);
      const buttons = screen.getAllByRole('button');
      const downloadButton = buttons.find(btn => btn.textContent?.includes('Complete'));
      expect(downloadButton).toBeDisabled();
    });

    it('accessible non-current steps are not disabled', () => {
      mockCurrentStep = 2;
      mockCompletedSteps = new Set<WizardStep>([1]);
      render(<WizardProgress />);
      const buttons = screen.getAllByRole('button');
      const typeButton = buttons.find(btn => btn.textContent?.includes('Type'));
      expect(typeButton).not.toBeDisabled();
    });
  });

  describe('save indicator', () => {
    it('does not show save indicator by default', () => {
      render(<WizardProgress />);
      expect(screen.queryByText(/Saving/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Saved/)).not.toBeInTheDocument();
    });

    it('shows "Saving..." when isSaving is true', () => {
      render(<WizardProgress isSaving={true} />);
      // Renders in both desktop and mobile save indicator spots
      const savingElements = screen.getAllByText('Saving...');
      expect(savingElements.length).toBeGreaterThanOrEqual(1);
    });

    it('shows relative time when lastSavedAt is recent', () => {
      const recentDate = new Date(Date.now() - 5000); // 5 seconds ago
      render(<WizardProgress lastSavedAt={recentDate} />);
      const savedElements = screen.getAllByText('Saved just now');
      expect(savedElements.length).toBeGreaterThanOrEqual(1);
    });

    it('shows seconds ago for times between 10-60s', () => {
      const date = new Date(Date.now() - 30_000); // 30 seconds ago
      render(<WizardProgress lastSavedAt={date} />);
      const savedElements = screen.getAllByText('Saved 30s ago');
      expect(savedElements.length).toBeGreaterThanOrEqual(1);
    });

    it('shows minutes ago for times over 60s', () => {
      const date = new Date(Date.now() - 120_000); // 2 minutes ago
      render(<WizardProgress lastSavedAt={date} />);
      const savedElements = screen.getAllByText('Saved 2m ago');
      expect(savedElements.length).toBeGreaterThanOrEqual(1);
    });

    it('prefers Saving... over saved time when both provided', () => {
      const date = new Date(Date.now() - 5000);
      render(<WizardProgress isSaving={true} lastSavedAt={date} />);
      const savingElements = screen.getAllByText('Saving...');
      expect(savingElements.length).toBeGreaterThanOrEqual(1);
      expect(screen.queryByText('Saved just now')).not.toBeInTheDocument();
    });
  });
});
