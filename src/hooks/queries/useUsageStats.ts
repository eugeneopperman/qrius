import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import type { Plan } from '@/types/database';

export interface UsageStats {
  scansUsed: number;
  scansLimit: number;
  qrCodesUsed: number;
  qrCodesLimit: number;
}

async function fetchUsageStats(
  orgId: string,
  plan: Plan
): Promise<UsageStats> {
  // Fetch current month's usage
  const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
  const { data: usage } = await supabase
    .from('usage_records')
    .select('scans_count')
    .eq('organization_id', orgId)
    .eq('month', currentMonth)
    .single();

  // Fetch plan limits
  const { data: limits } = await supabase
    .from('plan_limits')
    .select('scans_per_month, qr_codes_limit')
    .eq('plan', plan)
    .single();

  // Fetch QR code count
  const { count: qrCount } = await supabase
    .from('qr_codes')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', orgId);

  return {
    scansUsed: usage?.scans_count ?? 0,
    scansLimit: limits?.scans_per_month ?? 5000,
    qrCodesUsed: qrCount ?? 0,
    qrCodesLimit: limits?.qr_codes_limit ?? 15,
  };
}

export function useUsageStats() {
  const currentOrganization = useAuthStore((s) => s.currentOrganization);

  return useQuery({
    queryKey: ['usage-stats', currentOrganization?.id],
    queryFn: () =>
      fetchUsageStats(currentOrganization!.id, currentOrganization!.plan),
    enabled: !!currentOrganization,
    staleTime: 60_000, // 1 minute
  });
}
