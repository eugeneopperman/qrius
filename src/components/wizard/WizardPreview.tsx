import { forwardRef } from 'react';
import { QRPreview, type QRPreviewHandle } from '../QRPreview';
import { ScannabilityScore } from '../features/ScannabilityScore';
import { useWizardStore } from '../../stores/wizardStore';

interface WizardPreviewProps {
  className?: string;
}

export const WizardPreview = forwardRef<QRPreviewHandle, WizardPreviewProps>(
  function WizardPreview({ className }, ref) {
    const { currentStep } = useWizardStore();

    // Don't show preview on Step 1 (Type selection) or Step 4 (Download has its own preview)
    if (currentStep === 1 || currentStep === 4) {
      return null;
    }

    return (
      <div className={className}>
        <div className="lg:sticky lg:top-8 space-y-6">
          {/* QR Preview */}
          <div className="card">
            <h3 className="section-title mb-4 text-center">Preview</h3>
            <QRPreview ref={ref} />
          </div>

          {/* Scannability Score - Show on customize step */}
          {currentStep === 3 && (
            <div className="hidden sm:block">
              <ScannabilityScore />
            </div>
          )}
        </div>
      </div>
    );
  }
);
