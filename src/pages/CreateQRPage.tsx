import { useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { WizardContainer } from '@/components/wizard';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useQRStore } from '@/stores/qrStore';
import { useWizardStore } from '@/stores/wizardStore';
import type { QRCodeType } from '@/types';

export default function CreateQRPage() {
  // Safety-net: apply pending type from sessionStorage (covers edge cases)
  useEffect(() => {
    const pendingType = sessionStorage.getItem('pendingQRType') as QRCodeType | null;
    if (pendingType) {
      sessionStorage.removeItem('pendingQRType');
      const { currentStep } = useWizardStore.getState();
      if (currentStep === 1) {
        useQRStore.getState().setActiveType(pendingType);
        useWizardStore.getState().markCompleted(1);
        useWizardStore.getState().goToStep(2);
      }
    }
  }, []);
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto animate-slide-up-page">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create QR Code
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Generate a trackable QR code with custom styling
          </p>
        </div>

        <ErrorBoundary>
          <WizardContainer />
        </ErrorBoundary>
      </div>
    </DashboardLayout>
  );
}
