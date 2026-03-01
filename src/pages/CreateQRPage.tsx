import { useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { WizardContainer } from '@/components/wizard';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useQRStore } from '@/stores/qrStore';
import { useWizardStore } from '@/stores/wizardStore';
import type { QRCodeType } from '@/types';

export default function CreateQRPage() {
  // Apply pending type from URL param (cross-subdomain redirect) or sessionStorage (same-origin)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlPendingType = params.get('pendingType') as QRCodeType | null;
    const storagePendingType = sessionStorage.getItem('pendingQRType') as QRCodeType | null;
    const pendingType = urlPendingType || storagePendingType;

    if (pendingType) {
      // Clean up: remove URL param and sessionStorage entry
      if (urlPendingType) {
        params.delete('pendingType');
        const newUrl = params.toString()
          ? `${window.location.pathname}?${params}`
          : window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
      if (storagePendingType) {
        sessionStorage.removeItem('pendingQRType');
      }

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
