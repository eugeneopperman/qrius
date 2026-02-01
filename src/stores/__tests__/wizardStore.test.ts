import { describe, it, expect, beforeEach } from 'vitest';
import { useWizardStore } from '../wizardStore';

describe('wizardStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useWizardStore.setState({
      currentStep: 1,
      completedSteps: new Set(),
    });
  });

  describe('initial state', () => {
    it('starts at step 1', () => {
      expect(useWizardStore.getState().currentStep).toBe(1);
    });

    it('has no completed steps', () => {
      expect(useWizardStore.getState().completedSteps.size).toBe(0);
    });
  });

  describe('goToStep', () => {
    it('navigates to accessible step', () => {
      // Mark step 1 as completed so step 2 is accessible
      useWizardStore.getState().markCompleted(1);

      useWizardStore.getState().goToStep(2);

      expect(useWizardStore.getState().currentStep).toBe(2);
    });

    it('does not navigate to inaccessible step', () => {
      // Try to go to step 3 without completing previous steps
      useWizardStore.getState().goToStep(3);

      expect(useWizardStore.getState().currentStep).toBe(1);
    });

    it('can always navigate to step 1', () => {
      useWizardStore.setState({ currentStep: 3 });

      useWizardStore.getState().goToStep(1);

      expect(useWizardStore.getState().currentStep).toBe(1);
    });
  });

  describe('nextStep', () => {
    it('advances to the next step', () => {
      useWizardStore.getState().nextStep();

      expect(useWizardStore.getState().currentStep).toBe(2);
    });

    it('marks current step as completed', () => {
      useWizardStore.getState().nextStep();

      expect(useWizardStore.getState().completedSteps.has(1)).toBe(true);
    });

    it('does not advance past step 4', () => {
      useWizardStore.setState({ currentStep: 4 });

      useWizardStore.getState().nextStep();

      expect(useWizardStore.getState().currentStep).toBe(4);
    });
  });

  describe('prevStep', () => {
    it('goes back to the previous step', () => {
      useWizardStore.setState({ currentStep: 3 });

      useWizardStore.getState().prevStep();

      expect(useWizardStore.getState().currentStep).toBe(2);
    });

    it('does not go back from step 1', () => {
      useWizardStore.getState().prevStep();

      expect(useWizardStore.getState().currentStep).toBe(1);
    });
  });

  describe('skipToDownload', () => {
    it('skips to step 4', () => {
      useWizardStore.getState().skipToDownload();

      expect(useWizardStore.getState().currentStep).toBe(4);
    });

    it('marks steps 1 and 2 as completed', () => {
      useWizardStore.getState().skipToDownload();

      const { completedSteps } = useWizardStore.getState();
      expect(completedSteps.has(1)).toBe(true);
      expect(completedSteps.has(2)).toBe(true);
    });
  });

  describe('reset', () => {
    it('resets to step 1', () => {
      useWizardStore.setState({ currentStep: 4 });

      useWizardStore.getState().reset();

      expect(useWizardStore.getState().currentStep).toBe(1);
    });

    it('clears completed steps', () => {
      useWizardStore.setState({
        completedSteps: new Set([1, 2, 3]),
      });

      useWizardStore.getState().reset();

      expect(useWizardStore.getState().completedSteps.size).toBe(0);
    });
  });

  describe('markCompleted', () => {
    it('marks a step as completed', () => {
      useWizardStore.getState().markCompleted(2);

      expect(useWizardStore.getState().completedSteps.has(2)).toBe(true);
    });

    it('preserves previously completed steps', () => {
      useWizardStore.getState().markCompleted(1);
      useWizardStore.getState().markCompleted(2);

      const { completedSteps } = useWizardStore.getState();
      expect(completedSteps.has(1)).toBe(true);
      expect(completedSteps.has(2)).toBe(true);
    });
  });

  describe('isStepAccessible', () => {
    it('current step is always accessible', () => {
      expect(useWizardStore.getState().isStepAccessible(1)).toBe(true);
    });

    it('step 1 is always accessible', () => {
      useWizardStore.setState({ currentStep: 4 });

      expect(useWizardStore.getState().isStepAccessible(1)).toBe(true);
    });

    it('completed step is accessible', () => {
      useWizardStore.getState().markCompleted(2);

      expect(useWizardStore.getState().isStepAccessible(2)).toBe(true);
    });

    it('next step is accessible if current is completed', () => {
      useWizardStore.getState().markCompleted(1);

      expect(useWizardStore.getState().isStepAccessible(2)).toBe(true);
    });

    it('uncompleted future step is not accessible', () => {
      expect(useWizardStore.getState().isStepAccessible(3)).toBe(false);
      expect(useWizardStore.getState().isStepAccessible(4)).toBe(false);
    });
  });
});
