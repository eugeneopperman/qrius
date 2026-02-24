import { useRef, useCallback, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { useTemplateStore, selectIsEditing } from '@/stores/templateStore';
import { toast } from '@/stores/toastStore';
import { Button } from '../ui/Button';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { cn } from '@/utils/cn';
import { TemplateWizardProgress } from './TemplateWizardProgress';
import { TemplateWizardPreview } from './TemplateWizardPreview';
import { StepBasicInfo } from './steps/StepBasicInfo';
import { StepColorsStyle } from './steps/StepColorsStyle';
import { StepFrameTypography } from './steps/StepFrameTypography';
import { StepLogoSave } from './steps/StepLogoSave';
import type { BrandTemplateStyle } from '@/types';

// Default values for required BrandTemplateStyle fields
const DEFAULT_TEMPLATE_STYLE: BrandTemplateStyle = {
  dotsColor: '#000000',
  backgroundColor: '#ffffff',
  dotsType: 'rounded',
  cornersSquareType: 'extra-rounded',
  cornersDotType: 'dot',
  errorCorrectionLevel: 'M',
  frameStyle: 'none',
  qrRoundness: 50,
};

/**
 * Ensures draft.style has all required fields with proper defaults
 */
function ensureValidStyle(style: Partial<BrandTemplateStyle> | undefined): BrandTemplateStyle {
  if (!style) return { ...DEFAULT_TEMPLATE_STYLE };

  return {
    ...DEFAULT_TEMPLATE_STYLE,
    ...style,
  };
}

export function TemplateWizardModal() {
  const dialogRef = useRef<HTMLDivElement>(null);

  const {
    isOpen,
    currentStep,
    draft,
    closeWizard,
    nextStep,
    prevStep,
    goToStep,
    saveTemplate,
    updateDraft,
    updateDraftStyle,
  } = useTemplateStore();

  const isEditing = useTemplateStore(selectIsEditing);

  // Focus trap for accessibility
  useFocusTrap(isOpen, dialogRef, {
    onEscape: closeWizard,
  });

  // Handle save
  const handleSave = useCallback(() => {
    if (!draft.name?.trim()) {
      toast.error('Please enter a template name');
      goToStep(1);
      return;
    }

    saveTemplate();
    closeWizard();
    toast.success(isEditing ? 'Template updated!' : 'Template created!');
  }, [draft.name, saveTemplate, closeWizard, goToStep, isEditing]);

  // Handle next with validation
  const handleNext = useCallback(() => {
    if (currentStep === 1 && !draft.name?.trim()) {
      toast.error('Please enter a template name');
      return;
    }
    nextStep();
  }, [currentStep, draft.name, nextStep]);

  // Check if can proceed
  const canProceed = currentStep !== 1 || (draft.name?.trim()?.length ?? 0) > 0;

  // Memoize the validated style to prevent unnecessary re-renders
  const draftStyle = useMemo(
    () => ensureValidStyle(draft.style as Partial<BrandTemplateStyle> | undefined),
    [draft.style]
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="template-wizard-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-md"
        onClick={closeWizard}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={dialogRef}
        className={cn(
          'relative w-full max-w-4xl max-h-[90vh] flex flex-col',
          'glass-heavy rounded-2xl shadow-2xl',
          'overflow-hidden'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-divider">
          <div>
            <h2
              id="template-wizard-title"
              className="text-xl font-semibold text-gray-900 dark:text-white"
            >
              {isEditing ? 'Edit Template' : 'Create Template'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isEditing ? 'Update your brand template settings' : 'Design a reusable style template for your QR codes'}
            </p>
          </div>
          <button
            onClick={closeWizard}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label="Close wizard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 py-4 border-b border-divider bg-black/5 dark:bg-white/5">
          <TemplateWizardProgress
            currentStep={currentStep}
            onStepClick={goToStep}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col lg:flex-row min-h-[400px]">
            {/* Step Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {currentStep === 1 && (
                <StepBasicInfo
                  name={draft.name || ''}
                  onNameChange={(name) => updateDraft({ name })}
                />
              )}
              {currentStep === 2 && (
                <StepColorsStyle
                  style={draftStyle}
                  onStyleChange={updateDraftStyle}
                />
              )}
              {currentStep === 3 && (
                <StepFrameTypography
                  style={draftStyle}
                  onStyleChange={updateDraftStyle}
                />
              )}
              {currentStep === 4 && (
                <StepLogoSave
                  style={draftStyle}
                  onStyleChange={updateDraftStyle}
                  templateName={draft.name || ''}
                  isEditing={isEditing}
                />
              )}
            </div>

            {/* Preview Sidebar */}
            <div className="lg:w-72 p-6 bg-black/5 dark:bg-white/5 border-t lg:border-t-0 lg:border-l border-divider flex items-center justify-center">
              <TemplateWizardPreview style={draftStyle} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-divider bg-black/5 dark:bg-white/5">
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={currentStep === 1}
            className={cn(currentStep === 1 && 'invisible')}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={closeWizard}>
              Cancel
            </Button>

            {currentStep < 4 ? (
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={!canProceed}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button variant="primary" onClick={handleSave}>
                <Save className="w-4 h-4" />
                {isEditing ? 'Update Template' : 'Save Template'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

TemplateWizardModal.displayName = 'TemplateWizardModal';
