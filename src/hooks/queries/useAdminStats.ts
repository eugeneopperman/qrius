import { useQuery } from '@tanstack/react-query';
import { getSession } from '@/lib/supabase';

export interface AdminStats {
  users: {
    total: number;
    activeToday: number;
    signupsToday: number;
    signupsThisWeek: number;
    signupsThisMonth: number;
    planDistribution: Array<{ plan: string; count: number }>;
  };
  qrCodes: {
    total: number;
    createdToday: number;
    createdThisWeek: number;
    statusDistribution: Array<{ status: string; count: number }>;
    topScanned: Array<{ id: string; name: string; totalScans: number }>;
  };
  scans: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
    topCountries: Array<{ countryCode: string; count: number }>;
    deviceBreakdown: Array<{ deviceType: string; count: number }>;
  };
}

async function fetchAdminStats(): Promise<AdminStats> {
  const session = await getSession();
  if (!session) throw new Error('Not authenticated');
  const res = await fetch('/api/admin/stats', {
    headers: { Authorization: `Bearer ${session.access_token}` },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Admin stats failed: ${res.status}`);
  }

  return res.json();
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: fetchAdminStats,
    refetchInterval: 60_000,
  });
}
