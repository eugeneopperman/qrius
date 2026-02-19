import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from '@/stores/toastStore';
import { useAuthStore } from '@/stores/authStore';
import type { QRCode } from '@/types/database';

interface UseOrganizationQRCodesOptions {
  limit?: number;
}

async function fetchQRCodes(orgId: string, limit?: number): Promise<QRCode[]> {
  let query = supabase
    .from('qr_codes')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data || [];
}

export function useOrganizationQRCodes({ limit }: UseOrganizationQRCodesOptions = {}) {
  const currentOrganization = useAuthStore((s) => s.currentOrganization);
  const queryClient = useQueryClient();

  const queryKey = ['qr-codes', currentOrganization?.id, limit] as const;

  const { data: qrCodes = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => fetchQRCodes(currentOrganization!.id, limit),
    enabled: !!currentOrganization,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('qr_codes').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: (deletedId) => {
      // Optimistically remove from cache
      queryClient.setQueryData<QRCode[]>(queryKey, (old) =>
        old ? old.filter((qr) => qr.id !== deletedId) : []
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
    isLoading,
    deleteQRCode,
    refetch: () => queryClient.invalidateQueries({ queryKey }),
  };
}
