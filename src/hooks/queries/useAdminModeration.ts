import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSession } from '@/lib/supabase';

export interface ModerationReport {
  id: string;
  qr_code_id: string | null;
  short_code: string;
  reported_url: string;
  reason: string;
  description: string | null;
  reporter_email: string | null;
  source: string;
  status: string;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  qr_moderation_status?: string;
  qr_is_active?: boolean;
  qr_user_id?: string | null;
  qr_destination_url?: string;
}

export interface ModerationCounts {
  pending: number;
  reviewed: number;
  actioned: number;
  dismissed: number;
}

interface ModerationResponse {
  reports: ModerationReport[];
  counts: ModerationCounts;
}

async function fetchModeration(status: string): Promise<ModerationResponse> {
  const session = await getSession();
  if (!session) throw new Error('Not authenticated');
  const res = await fetch(`/api/admin/moderation?status=${status}`, {
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Failed: ${res.status}`);
  }
  return res.json();
}

export function useAdminModeration(status: string) {
  return useQuery({
    queryKey: ['admin-moderation', status],
    queryFn: () => fetchModeration(status),
    refetchInterval: 30_000,
  });
}

type ModerationAction = 'approve' | 'suspend_qr' | 'suspend_user' | 'dismiss';

export function useModerationAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reportId, action, adminNotes }: { reportId: string; action: ModerationAction; adminNotes?: string }) => {
      const session = await getSession();
      if (!session) throw new Error('Not authenticated');
      const res = await fetch('/api/admin/moderation', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ report_id: reportId, action, admin_notes: adminNotes }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Action failed: ${res.status}`);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-moderation'] });
    },
  });
}
