import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSession } from '@/lib/supabase';
import { toast } from '@/stores/toastStore';
import { useAuthStore } from '@/stores/authStore';
import type { QRCode } from '@/types/database';

interface UseOrganizationQRCodesOptions {
  limit?: number;
}

interface APIQRCode {
  id: string;
  short_code: string;
  tracking_url: string;
  destination_url: string;
  qr_type: string;
  original_data: unknown;
  is_active: boolean;
  total_scans: number;
  user_id: string | null;
  organization_id: string | null;
  name: string | null;
  description: string | null;
  tags: string[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface APIResponse {
  qrCodes: APIQRCode[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  stats: {
    monthlyScans: number;
  };
}

/** Map API response to frontend QRCode type */
function mapAPIToQRCode(api: APIQRCode): QRCode {
  return {
    id: api.id,
    short_code: api.short_code,
    destination_url: api.destination_url,
    qr_type: api.qr_type,
    original_data: api.original_data,
    is_active: api.is_active,
    total_scans: api.total_scans,
    user_id: api.user_id,
    organization_id: api.organization_id,
    name: api.name,
    description: api.description,
    tags: api.tags || [],
    metadata: api.metadata || {},
    created_at: api.created_at,
    updated_at: api.updated_at,
  };
}

async function fetchQRCodes(limit?: number): Promise<{ qrCodes: QRCode[]; totalCount: number; monthlyScans: number }> {
  const session = await getSession();
  if (!session?.access_token) {
    return { qrCodes: [], totalCount: 0, monthlyScans: 0 };
  }

  const params = new URLSearchParams();
  if (limit) params.set('limit', String(limit));

  const response = await fetch(`/api/qr-codes?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch QR codes');
  }

  const data: APIResponse = await response.json();

  return {
    qrCodes: data.qrCodes.map(mapAPIToQRCode),
    totalCount: data.pagination.total,
    monthlyScans: data.stats.monthlyScans,
  };
}

export function useOrganizationQRCodes({ limit }: UseOrganizationQRCodesOptions = {}) {
  const currentOrganization = useAuthStore((s) => s.currentOrganization);
  const queryClient = useQueryClient();

  const queryKey = ['qr-codes', currentOrganization?.id, limit] as const;

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => fetchQRCodes(limit),
    enabled: !!currentOrganization,
  });

  const qrCodes = data?.qrCodes ?? [];
  const totalCount = data?.totalCount ?? 0;
  const monthlyScans = data?.monthlyScans ?? 0;

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Use API endpoint for deletion (handles cache cleanup, scan events, etc.)
      const session = await getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/qr-codes/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.error || 'Failed to delete');
      }

      return id;
    },
    onSuccess: (deletedId) => {
      // Optimistically remove from cache
      queryClient.setQueryData(queryKey, (old: typeof data) =>
        old ? { ...old, qrCodes: old.qrCodes.filter((qr) => qr.id !== deletedId), totalCount: old.totalCount - 1 } : old
      );
      // Also invalidate any other qr-codes queries (different limits)
      queryClient.invalidateQueries({ queryKey: ['qr-codes'] });
    },
    onError: () => {
      toast.error('Failed to delete QR code. Please try again.');
    },
  });

  const deleteQRCode = async (id: string): Promise<boolean> => {
    try {
      await deleteMutation.mutateAsync(id);
      return true;
    } catch {
      return false;
    }
  };

  return {
    qrCodes,
    totalCount,
    monthlyScans,
    isLoading,
    deleteQRCode,
    refetch: () => queryClient.invalidateQueries({ queryKey }),
  };
}
