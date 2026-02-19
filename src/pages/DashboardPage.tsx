import { Link } from '@tanstack/react-router';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { QuickStats } from '../components/dashboard/QuickStats';
import { QRCodeList } from '../components/dashboard/QRCodeList';
import { UpgradePrompt, UsageLimitWarning } from '../components/dashboard/UpgradePrompt';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/Button';
import { Plus, ArrowRight, AlertTriangle } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useOrganizationQRCodes } from '../hooks/useOrganizationQRCodes';
import { useDashboardStats } from '../hooks/queries/useDashboardStats';
import { useQueryClient } from '@tanstack/react-query';

export default function DashboardPage() {
  const { currentOrganization, planLimits, profile } = useAuthStore();
  const { qrCodes, isLoading, deleteQRCode } = useOrganizationQRCodes({ limit: 10 });
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string | null } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const { data: stats } = useDashboardStats(qrCodes);

  const handleDeleteClick = useCallback((id: string) => {
    const qrCode = qrCodes.find((qr) => qr.id === id);
    setDeleteConfirm({ id, name: qrCode?.name || null });
  }, [qrCodes]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteConfirm) return;

    setIsDeleting(true);
    const success = await deleteQRCode(deleteConfirm.id);
    if (success) {
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    }
    setIsDeleting(false);
    setDeleteConfirm(null);
  }, [deleteConfirm, deleteQRCode, queryClient]);

  const showUpgradePrompt = currentOrganization?.plan === 'free';

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-slide-up-page">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome back{profile?.name ? `, ${profile.name.split(' ')[0]}` : ''}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Here's what's happening with your QR codes
            </p>
          </div>
          <Link to="/create">
            <Button>
              <Plus className="w-4 h-4" />
              Create QR Code
            </Button>
          </Link>
        </div>

        {/* Upgrade prompt for free users */}
        {showUpgradePrompt && (
          <UpgradePrompt
            title="Unlock more features"
            description="Upgrade to Pro for unlimited QR codes, advanced analytics, and team collaboration."
          />
        )}

        {/* Usage warning */}
        {planLimits && planLimits.qr_codes_limit > 0 && stats && (
          <UsageLimitWarning
            current={stats.qrCodesCount}
            limit={planLimits.qr_codes_limit}
            type="qr_codes"
          />
        )}

        {/* Quick stats */}
        <QuickStats
          qrCodesCount={stats?.qrCodesCount ?? 0}
          scansToday={stats?.scansToday ?? 0}
          scansThisMonth={stats?.scansThisMonth ?? 0}
          teamMembers={stats?.teamMembers ?? 1}
        />

        {/* Recent QR codes */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent QR Codes
            </h2>
            <Link
              to="/qr-codes"
              className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 flex items-center gap-1"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <QRCodeList qrCodes={qrCodes} isLoading={isLoading} onDelete={handleDeleteClick} />
        </div>

        {/* Delete confirmation modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 max-w-md mx-4 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 id="delete-dialog-title" className="text-lg font-semibold text-gray-900 dark:text-white">
                  Delete QR Code
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to delete{' '}
                <span className="font-medium">
                  {deleteConfirm.name || 'this QR code'}
                </span>
                ? This action cannot be undone and all scan history will be lost.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setDeleteConfirm(null)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
