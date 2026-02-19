import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { WizardContainer } from '@/components/wizard';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function CreateQRPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
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
