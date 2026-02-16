import { useRef, useEffect } from 'react';
import { useWizardStore } from '../../stores/wizardStore';
import { WizardProgress } from './WizardProgress';
import { WizardPreview } from './WizardPreview';
import { StepType } from './steps/StepType';
import { StepContent } from './steps/StepContent';
import { StepCustomize } from './steps/StepCustomize';
import { StepDownload } from './steps/StepDownload';
import type { QRPreviewHandle } from '../QRPreview';
import { cn } from '../../utils/cn';

interface WizardContainerProps {
  onPreviewRef?: (ref: React.RefObject<QRPreviewHandle | null>) => void;
}

export function WizardContainer({ onPreviewRef }: WizardContainerProps) {
  const { currentStep } = useWizardStore();
  const previewRef = useRef<QRPreviewHandle>(null);

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
        return <StepDownload />;
      default:
        return <StepType />;
    }
  };

  // Step 1 and 4 are full-width, Steps 2 and 3 have side preview
  const showSidePreview = currentStep === 2 || currentStep === 3;

  return (
    <div className="w-full">
      {/* Progress indicator */}
      <div className="relative mb-10 py-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl">
        <WizardProgress />
      </div>

      {/* Step content with optional side preview */}
      <div
        className={cn(
          'transition-all duration-300',
          showSidePreview && 'lg:grid lg:grid-cols-[1fr_320px] lg:gap-8'
        )}
      >
        {/* Main content area */}
        <div className="min-w-0">
          {/* Mobile preview - top position for steps 2 and 3 */}
          {showSidePreview && (
            <div className="lg:hidden mb-6">
              <WizardPreview ref={previewRef} />
            </div>
          )}

          {/* Step content with animation */}
          <div
            key={currentStep}
            className="animate-fade-in"
          >
            {renderStep()}
          </div>
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
