import { lazy, Suspense } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ScanLine, Loader2 } from 'lucide-react';

const QRReader = lazy(() => import('@/components/features/QRReader').then(m => ({ default: m.QRReader })));

export default function ReaderPage() {
  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto animate-slide-up-page">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">QR Code Reader</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Scan or upload a QR code to decode its contents
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
          <Suspense
            fallback={
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-orange-500 mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Loading reader...</p>
              </div>
            }
          >
            <QRReader />
          </Suspense>
        </div>

        {/* Empty state hint when no scan has been started */}
        <div className="mt-6 text-center">
          <ScanLine className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Use your camera or upload an image to scan a QR code
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
