import { Link } from '@tanstack/react-router';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { QRCodeList } from '@/components/dashboard/QRCodeList';
import { UpgradePrompt, UsageLimitWarning } from '@/components/dashboard/UpgradePrompt';
import { useAuthStore } from '@/stores/authStore';
import { useShallow } from 'zustand/react/shallow';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Plus, ArrowRight } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useOrganizationQRCodes } from '@/hooks/useOrganizationQRCodes';
import { useDashboardStats } from '@/hooks/queries/useDashboardStats';
import { useUsageStats } from '@/hooks/queries/useUsageStats';
import { useQueryClient } from '@tanstack/react-query';

function UsageBar({ label, used, limit }: { label: string; used: number; limit: number }) {
  const isUnlimited = limit === -1;
  const percentage = isUnlimited ? 0 : Math.min((used / limit) * 100, 100);
  const isWarning = !isUnlimited && percentage >= 80;
  const isCritical = !isUnlimited && percentage >= 95;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {used.toLocaleString()} / {isUnlimited ? 'Unlimited' : limit.toLocaleString()}
        </span>
      </div>
      {!isUnlimited && (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              isCritical
                ? 'bg-red-500'
                : isWarning
                ? 'bg-amber-500'
                : 'bg-orange-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { currentOrganization, planLimits, profile } = useAuthStore(useShallow((s) => ({ currentOrganization: s.currentOrganization, planLimits: s.planLimits, profile: s.profile })));
  const { qrCodes, totalCount, monthlyScans, isLoading, deleteQRCode } = useOrganizationQRCodes({ limit: 10 });
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string | null } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const { data: stats } = useDashboardStats({ qrCodes, totalCount, monthlyScans });
  const { data: usageStats } = useUsageStats({ totalQRCodes: totalCount, monthlyScans });

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
          <UpgradePrompt title="Unlock more features" />
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

        {/* Usage overview */}
        {usageStats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UsageBar
              label="Scans this month"
              used={usageStats.scansUsed}
              limit={usageStats.scansLimit}
            />
            <UsageBar
              label="Dynamic QR codes"
              used={usageStats.qrCodesUsed}
              limit={usageStats.qrCodesLimit}
            />
          </div>
        )}

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

        {/* Delete confirmation dialog */}
        <ConfirmDialog
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete QR Code"
          message={`Are you sure you want to delete ${deleteConfirm?.name || 'this QR code'}? This action cannot be undone and all scan history will be lost.`}
          confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
          cancelLabel="Cancel"
          variant="danger"
        />
      </div>
    </DashboardLayout>
  );
}
