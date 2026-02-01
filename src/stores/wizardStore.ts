import { create } from 'zustand';

export type WizardStep = 1 | 2 | 3 | 4;

interface WizardState {
  currentStep: WizardStep;
  completedSteps: Set<WizardStep>;

  // Navigation
  goToStep: (step: WizardStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipToDownload: () => void;
  reset: () => void;

  // Step completion
  markCompleted: (step: WizardStep) => void;
  isStepAccessible: (step: WizardStep) => boolean;
}

export const useWizardStore = create<WizardState>((set, get) => ({
  currentStep: 1,
  completedSteps: new Set(),

  goToStep: (step) => {
    const { isStepAccessible } = get();
    if (isStepAccessible(step)) {
      set({ currentStep: step });
    }
  },

  nextStep: () => {
    const { currentStep, markCompleted } = get();
    if (currentStep < 4) {
      markCompleted(currentStep);
      set({ currentStep: (currentStep + 1) as WizardStep });
    }
  },

  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 1) {
      set({ currentStep: (currentStep - 1) as WizardStep });
    }
  },

  skipToDownload: () => {
    const { markCompleted } = get();
    // Mark steps 1 and 2 as completed (required), skip 3
    markCompleted(1);
    markCompleted(2);
    set({ currentStep: 4 });
  },

  reset: () => {
    set({
      currentStep: 1,
      completedSteps: new Set(),
    });
  },

  markCompleted: (step) => {
    set((state) => ({
      completedSteps: new Set([...state.completedSteps, step]),
    }));
  },

  isStepAccessible: (step) => {
    const { currentStep, completedSteps } = get();
    // Can always go to current step
    if (step === currentStep) return true;
    // Can go to any completed step
    if (completedSteps.has(step)) return true;
    // Can go to next step if current is completed
    if (step === currentStep + 1 && completedSteps.has(currentStep)) return true;
    // Step 1 is always accessible
    if (step === 1) return true;
    return false;
  },
}));
