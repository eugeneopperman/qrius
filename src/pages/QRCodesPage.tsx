import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { QRCodeList } from '@/components/dashboard/QRCodeList';
import { useOrganizationQRCodes } from '@/hooks/useOrganizationQRCodes';

export default function QRCodesPage() {
  const { qrCodes, isLoading, deleteQRCode } = useOrganizationQRCodes();

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-slide-up-page">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">QR Codes</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage and track all your QR codes
          </p>
        </div>

        {/* QR Code list */}
        <QRCodeList qrCodes={qrCodes} isLoading={isLoading} onDelete={deleteQRCode} />
      </div>
    </DashboardLayout>
  );
}
