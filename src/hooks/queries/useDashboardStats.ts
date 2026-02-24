import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import type { QRCode } from '@/types/database';

interface DashboardStats {
  qrCodesCount: number;
  scansToday: number;
  scansThisMonth: number;
  teamMembers: number;
}

interface DashboardStatsInput {
  qrCodes: QRCode[];
  totalCount: number;
  monthlyScans: number;
  teamMembers: number;
}

function computeDashboardStats(
  { qrCodes, totalCount, monthlyScans, teamMembers }: DashboardStatsInput
): DashboardStats {
  // Total scans across all QR codes (all-time)
  const totalScans = qrCodes.reduce((sum, qr) => sum + (qr.total_scans || 0), 0);

  return {
    qrCodesCount: totalCount,
    scansToday: 0, // Requires scan_events query from Neon — deferred
    scansThisMonth: monthlyScans || totalScans,
    teamMembers,
  };
}

export function useDashboardStats(input: DashboardStatsInput) {
  const currentOrganization = useAuthStore((s) => s.currentOrganization);

  return useQuery({
    queryKey: ['dashboard-stats', currentOrganization?.id],
    queryFn: () => computeDashboardStats(input),
    enabled: !!currentOrganization,
    placeholderData: {
      qrCodesCount: 0,
      scansToday: 0,
      scansThisMonth: 0,
      teamMembers: 1,
    },
  });
}
