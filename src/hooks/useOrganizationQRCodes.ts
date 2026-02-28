import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSession } from '@/lib/supabase';
import { toast } from '@/stores/toastStore';
import { useAuthStore } from '@/stores/authStore';
import type { QRCode } from '@/types/database';

export interface UseOrganizationQRCodesOptions {
  limit?: number;
  status?: 'all' | 'active' | 'paused' | 'draft';
  folderId?: string | null;
  search?: string;
  sort?: 'created_at' | 'total_scans' | 'name';
  order?: 'asc' | 'desc';
}

interface APIQRCode {
  id: string;
  short_code: string;
  tracking_url: string;
  destination_url: string;
  qr_type: string;
  original_data: unknown;
  status: 'draft' | 'active' | 'paused';
  is_active: boolean;
  total_scans: number;
  user_id: string | null;
  organization_id: string | null;
  folder_id: string | null;
  name: string | null;
  description: string | null;
  tags: string[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface StatusCounts {
  all: number;
  active: number;
  paused: number;
  draft: number;
}

interface APIResponse {
  qrCodes: APIQRCode[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  counts?: StatusCounts;
  stats: {
    monthlyScans: number;
    teamMembers: number;
  };
}

/** Map API response to frontend QRCode type */
function mapAPIToQRCode(api: APIQRCode): QRCode {
  return {
    id: api.id,
    short_code: api.short_code,
    destination_url: api.destination_url,
    qr_type: api.qr_type,
    original_data: api.original_data as QRCode['original_data'],
    status: api.status || (api.is_active ? 'active' : 'paused'),
    is_active: api.is_active,
    total_scans: api.total_scans,
    user_id: api.user_id,
    organization_id: api.organization_id,
    folder_id: api.folder_id,
    name: api.name,
    description: api.description,
    tags: api.tags || [],
    metadata: (api.metadata || {}) as QRCode['metadata'],
    tracking_url: api.tracking_url,
    created_at: api.created_at,
    updated_at: api.updated_at,
  };
}

async function fetchQRCodes(options: UseOrganizationQRCodesOptions = {}): Promise<{
  qrCodes: QRCode[];
  totalCount: number;
  counts: StatusCounts;
  monthlyScans: number;
  teamMembers: number;
}> {
  const session = await getSession();
  if (!session?.access_token) {
    return { qrCodes: [], totalCount: 0, counts: { all: 0, active: 0, paused: 0, draft: 0 }, monthlyScans: 0, teamMembers: 1 };
  }

  const params = new URLSearchParams();
  if (options.limit) params.set('limit', String(options.limit));
  if (options.status && options.status !== 'all') params.set('status', options.status);
  if (options.folderId !== undefined) {
    params.set('folder_id', options.folderId === null ? 'none' : options.folderId);
  }
  if (options.search) params.set('search', options.search);
  if (options.sort) params.set('sort', options.sort);
  if (options.order) params.set('order', options.order);

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
    counts: data.counts || { all: data.pagination.total, active: 0, paused: 0, draft: 0 },
    monthlyScans: data.stats.monthlyScans,
    teamMembers: data.stats.teamMembers ?? 1,
  };
}

export function useOrganizationQRCodes(options: UseOrganizationQRCodesOptions = {}) {
  const { limit, status, folderId, search, sort, order } = options;
  const currentOrganization = useAuthStore((s) => s.currentOrganization);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  // Use org ID as stable cache key; fall back to user ID only when org isn't available
  const ownerId = currentOrganization?.id ?? user?.id ?? 'anon';
  const queryKey = ['qr-codes', ownerId, { limit, status, folderId, search, sort, order }] as const;

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: () => fetchQRCodes(options),
    // Wait for auth to initialize and at least user to be available
    enabled: isInitialized && !!user,
    // Refetch when navigating back to the page
    refetchOnMount: 'always',
  });

  const qrCodes = data?.qrCodes ?? [];
  const totalCount = data?.totalCount ?? 0;
  const counts = data?.counts ?? { all: 0, active: 0, paused: 0, draft: 0 };
  const monthlyScans = data?.monthlyScans ?? 0;
  const teamMembers = data?.teamMembers ?? 1;

  const patchMutation = useMutation({
    mutationFn: async (params: { id: string; destination_url?: string; name?: string; is_active?: boolean; folder_id?: string | null }) => {
      const session = await getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      const { id, ...body } = params;
      const response = await fetch(`/api/qr-codes/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.error || 'Failed to update');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qr-codes'] });
      queryClient.invalidateQueries({ queryKey: ['qr-code-folders'] });
    },
    onError: () => {
      toast.error('Failed to update QR code. Please try again.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const session = await getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

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
      queryClient.setQueryData(queryKey, (old: typeof data) =>
        old ? { ...old, qrCodes: old.qrCodes.filter((qr) => qr.id !== deletedId), totalCount: old.totalCount - 1 } : old
      );
      queryClient.invalidateQueries({ queryKey: ['qr-codes'] });
      queryClient.invalidateQueries({ queryKey: ['qr-code-folders'] });
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

  const patchQRCode = async (params: { id: string; destination_url?: string; name?: string; is_active?: boolean; folder_id?: string | null }): Promise<boolean> => {
    try {
      await patchMutation.mutateAsync(params);
      return true;
    } catch {
      return false;
    }
  };

  return {
    qrCodes,
    totalCount,
    counts,
    monthlyScans,
    teamMembers,
    isLoading,
    error,
    patchQRCode,
    deleteQRCode,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['qr-codes'] }),
  };
}
