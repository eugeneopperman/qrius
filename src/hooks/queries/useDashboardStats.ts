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

async function fetchDashboardStats(orgId: string, qrCodes: QRCode[]): Promise<DashboardStats> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // Get QR code IDs for this org to query scans (scan_events has no organization_id column)
  const qrCodeIds = qrCodes.map((qr) => qr.id);

  const [qrCountResult, memberCountResult, scansTodayResult] = await Promise.all([
    supabase
      .from('qr_codes')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId),
    supabase
      .from('organization_members')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId),
    qrCodeIds.length > 0
      ? supabase
          .from('scan_events')
          .select('*', { count: 'exact', head: true })
          .in('qr_code_id', qrCodeIds)
          .gte('scanned_at', todayStart.toISOString())
      : Promise.resolve({ count: 0 }),
  ]);

  const totalScans = qrCodes.reduce((sum, qr) => sum + (qr.total_scans || 0), 0);

  return {
    qrCodesCount: qrCountResult.count || 0,
    scansToday: scansTodayResult.count ?? 0,
    scansThisMonth: totalScans,
    teamMembers: memberCountResult.count || 1,
  };
}

export function useDashboardStats(qrCodes: QRCode[]) {
  const currentOrganization = useAuthStore((s) => s.currentOrganization);

  return useQuery({
    queryKey: ['dashboard-stats', currentOrganization?.id, qrCodes.map((q) => q.id).join(',')],
    queryFn: () => fetchDashboardStats(currentOrganization!.id, qrCodes),
    enabled: !!currentOrganization,
    placeholderData: {
      qrCodesCount: 0,
      scansToday: 0,
      scansThisMonth: 0,
      teamMembers: 1,
    },
  });
}
