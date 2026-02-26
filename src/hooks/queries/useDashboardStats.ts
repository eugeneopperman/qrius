import { useMemo } from 'react';
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

export function useDashboardStats(input: DashboardStatsInput): { data: DashboardStats } {
  const { qrCodes, totalCount, monthlyScans, teamMembers } = input;

  const data = useMemo(() => {
    const totalScans = qrCodes.reduce((sum, qr) => sum + (qr.total_scans || 0), 0);

    return {
      qrCodesCount: totalCount,
      scansToday: 0, // Requires scan_events query from Neon — deferred
      scansThisMonth: monthlyScans || totalScans,
      teamMembers,
    };
  }, [qrCodes, totalCount, monthlyScans, teamMembers]);

  return { data };
}
