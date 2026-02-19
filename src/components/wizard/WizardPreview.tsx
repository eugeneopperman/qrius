import { forwardRef } from 'react';
import { QRPreview, type QRPreviewHandle } from '../QRPreview';
import { ScannabilityScore } from '../features/ScannabilityScore';
import { useWizardStore } from '@/stores/wizardStore';
import { useQRStore } from '@/stores/qrStore';

const typeLabels: Record<string, string> = {
  url: 'URL QR',
  text: 'Text QR',
  email: 'Email QR',
  phone: 'Phone QR',
  sms: 'SMS QR',
  wifi: 'WiFi QR',
  vcard: 'vCard QR',
  event: 'Event QR',
  location: 'Location QR',
};

interface WizardPreviewProps {
  className?: string;
  compact?: boolean;
}

export const WizardPreview = forwardRef<QRPreviewHandle, WizardPreviewProps>(
  function WizardPreview({ className, compact }, ref) {
    const { currentStep } = useWizardStore();
    const activeType = useQRStore((s) => s.activeType);

    // Don't show preview on Step 1 (Type selection) or Step 4 (Download has its own preview)
    if (currentStep === 1 || currentStep === 4) {
      return null;
    }

    // Compact mode: mobile preview with card wrapper
    if (compact) {
      return (
        <div className={className}>
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Live Preview</p>
            <QRPreview ref={ref} hideActions displaySize={160} />
          </div>
        </div>
      );
    }

    return (
      <div className={className}>
        <div className="lg:sticky lg:top-8 space-y-6">
          {/* QR Preview */}
          <div className="card">
            <QRPreview ref={ref} hideActions displaySize={220} />
            <p className="text-center text-xs font-medium text-gray-400 dark:text-gray-500 mt-3">
              {typeLabels[activeType] || 'QR Code'}
            </p>
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
