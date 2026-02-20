import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
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
}

async function fetchDashboardStats(
  orgId: string,
  { qrCodes, totalCount, monthlyScans }: DashboardStatsInput
): Promise<DashboardStats> {
  // Team members count comes from Supabase (correct database for org data)
  const { count: memberCount } = await supabase
    .from('organization_members')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', orgId);

  // Total scans across all QR codes (all-time)
  const totalScans = qrCodes.reduce((sum, qr) => sum + (qr.total_scans || 0), 0);

  return {
    qrCodesCount: totalCount,
    scansToday: 0, // Requires scan_events query from Neon — deferred
    scansThisMonth: monthlyScans || totalScans,
    teamMembers: memberCount || 1,
  };
}

export function useDashboardStats(input: DashboardStatsInput) {
  const currentOrganization = useAuthStore((s) => s.currentOrganization);

  return useQuery({
    queryKey: ['dashboard-stats', currentOrganization?.id, input.totalCount],
    queryFn: () => fetchDashboardStats(currentOrganization!.id, input),
    enabled: !!currentOrganization,
    placeholderData: {
      qrCodesCount: 0,
      scansToday: 0,
      scansThisMonth: 0,
      teamMembers: 1,
    },
  });
}
