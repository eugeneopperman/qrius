import { useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';

export interface UsageStats {
  scansUsed: number;
  scansLimit: number;
  qrCodesUsed: number;
  qrCodesLimit: number;
}

interface UseUsageStatsInput {
  totalQRCodes: number;
  monthlyScans: number;
}

export function useUsageStats({ totalQRCodes, monthlyScans }: UseUsageStatsInput): { data: UsageStats | undefined } {
  const planLimits = useAuthStore((s) => s.planLimits);

  const data = useMemo<UsageStats | undefined>(() => {
    if (!planLimits) return undefined;

    return {
      scansUsed: monthlyScans,
      scansLimit: planLimits.scans_per_month,
      qrCodesUsed: totalQRCodes,
      qrCodesLimit: planLimits.qr_codes_limit,
    };
  }, [planLimits, totalQRCodes, monthlyScans]);

  return { data };
}
