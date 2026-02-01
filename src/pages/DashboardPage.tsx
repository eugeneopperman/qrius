import { Link } from '@tanstack/react-router';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { QuickStats } from '../components/dashboard/QuickStats';
import { QRCodeList } from '../components/dashboard/QRCodeList';
import { UpgradePrompt, UsageLimitWarning } from '../components/dashboard/UpgradePrompt';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/Button';
import { Plus, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { QRCode } from '../types/database';

export default function DashboardPage() {
  const { currentOrganization, planLimits, profile } = useAuthStore();
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    qrCodesCount: 0,
    scansToday: 0,
    scansThisMonth: 0,
    teamMembers: 1,
  });

  // Fetch QR codes and stats
  useEffect(() => {
    async function fetchData() {
      if (!currentOrganization) return;

      setIsLoading(true);

      try {
        // Fetch QR codes for the organization
        const { data: qrData, error: qrError } = await supabase
          .from('qr_codes')
          .select('*')
          .eq('organization_id', currentOrganization.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (qrError) {
          console.error('Error fetching QR codes:', qrError);
        } else {
          setQrCodes(qrData || []);
        }

        // Get QR code count
        const { count: qrCount } = await supabase
          .from('qr_codes')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', currentOrganization.id);

        // Get team member count
        const { count: memberCount } = await supabase
          .from('organization_members')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', currentOrganization.id);

        // Calculate scan stats (simplified - in production you'd query scan_events)
        const totalScans = (qrData || []).reduce((sum: number, qr: { total_scans: number }) => sum + (qr.total_scans || 0), 0);

        setStats({
          qrCodesCount: qrCount || 0,
          scansToday: Math.round(totalScans * 0.05), // Placeholder
          scansThisMonth: totalScans,
          teamMembers: memberCount || 1,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [currentOrganization]);

  const handleDeleteQR = async (id: string) => {
    // TODO: Implement delete confirmation and API call
    setQrCodes(qrCodes.filter((qr) => qr.id !== id));
  };

  const showUpgradePrompt = currentOrganization?.plan === 'free';

  return (
    <DashboardLayout>
      <div className="space-y-6">
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
        {planLimits && planLimits.qr_codes_limit > 0 && (
          <UsageLimitWarning
            current={stats.qrCodesCount}
            limit={planLimits.qr_codes_limit}
            type="qr_codes"
          />
        )}

        {/* Quick stats */}
        <QuickStats
          qrCodesCount={stats.qrCodesCount}
          scansToday={stats.scansToday}
          scansThisMonth={stats.scansThisMonth}
          teamMembers={stats.teamMembers}
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
          <QRCodeList qrCodes={qrCodes} isLoading={isLoading} onDelete={handleDeleteQR} />
        </div>
      </div>
    </DashboardLayout>
  );
}
