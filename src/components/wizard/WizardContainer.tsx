import { useRef, useEffect } from 'react';
import { useWizardStore } from '@/stores/wizardStore';
import { WizardProgress } from './WizardProgress';
import { WizardPreview } from './WizardPreview';
import { StepType } from './steps/StepType';
import { StepContent } from './steps/StepContent';
import { StepCustomize } from './steps/StepCustomize';
import { StepDownload } from './steps/StepDownload';
import type { QRPreviewHandle } from '../QRPreview';
import { cn } from '@/utils/cn';
import { useAutosave } from '@/hooks/useAutosave';

interface WizardContainerProps {
  onPreviewRef?: (ref: React.RefObject<QRPreviewHandle | null>) => void;
}

export function WizardContainer({ onPreviewRef }: WizardContainerProps) {
  const { currentStep } = useWizardStore();
  const previewRef = useRef<QRPreviewHandle>(null);
  const autosave = useAutosave();

  // Pass the preview ref up for keyboard shortcuts
  useEffect(() => {
    if (onPreviewRef) {
      onPreviewRef(previewRef);
    }
  }, [onPreviewRef]);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepType />;
      case 2:
        return <StepContent />;
      case 3:
        return <StepCustomize />;
      case 4:
        return <StepDownload autosave={autosave} />;
      default:
        return <StepType />;
    }
  };

  // Step 1 and 4 are full-width, Steps 2 and 3 have side preview
  const showSidePreview = currentStep === 2 || currentStep === 3;

  return (
    <div className="w-full">
      {/* Progress indicator */}
      <div className="relative mb-6 py-3 glass rounded-2xl">
        <WizardProgress lastSavedAt={autosave.lastSavedAt} isSaving={autosave.isSaving} />
      </div>

      {/* Step content with optional side preview */}
      <div
        className={cn(
          'transition-all duration-300',
          showSidePreview && 'lg:grid lg:grid-cols-[1fr_360px] lg:gap-8 lg:items-start'
        )}
      >
        {/* Main content area */}
        <div className="min-w-0">
          {/* Step content with animation */}
          <div
            key={currentStep}
            className="animate-fade-in"
          >
            {renderStep()}
          </div>

          {/* Mobile preview - below form content */}
          {showSidePreview && (
            <div className="lg:hidden mt-6">
              <WizardPreview ref={previewRef} compact />
            </div>
          )}
        </div>

        {/* Desktop side preview */}
        {showSidePreview && (
          <WizardPreview
            ref={previewRef}
            className="hidden lg:block"
          />
        )}
      </div>
    </div>
  );
}
