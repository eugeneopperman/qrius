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
  scansToday: number;
}

export function useDashboardStats(input: DashboardStatsInput): { data: DashboardStats } {
  const { qrCodes, totalCount, monthlyScans, teamMembers, scansToday } = input;

  const data = useMemo(() => {
    const totalScans = qrCodes.reduce((sum, qr) => sum + (qr.total_scans || 0), 0);

    return {
      qrCodesCount: totalCount,
      scansToday,
      scansThisMonth: monthlyScans || totalScans,
      teamMembers,
    };
  }, [qrCodes, totalCount, monthlyScans, teamMembers, scansToday]);

  return { data };
}
