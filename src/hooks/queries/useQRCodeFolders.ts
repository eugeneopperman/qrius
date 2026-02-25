import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSession } from '@/lib/supabase';
import { toast } from '@/stores/toastStore';
import { useAuthStore } from '@/stores/authStore';

export interface QRCodeFolder {
  id: string;
  name: string;
  color: string;
  qrCodeCount: number;
  created_at: string;
}

interface FoldersAPIResponse {
  folders: QRCodeFolder[];
}

async function fetchFolders(): Promise<QRCodeFolder[]> {
  const session = await getSession();
  if (!session?.access_token) return [];

  const response = await fetch('/api/folders', {
    headers: { Authorization: `Bearer ${session.access_token}` },
  });

  if (!response.ok) throw new Error('Failed to fetch folders');

  const data: FoldersAPIResponse = await response.json();
  return data.folders;
}

export function useQRCodeFolders() {
  const currentOrganization = useAuthStore((s) => s.currentOrganization);
  const queryClient = useQueryClient();

  const queryKey = ['qr-code-folders', currentOrganization?.id] as const;

  const { data: folders = [], isLoading } = useQuery({
    queryKey,
    queryFn: fetchFolders,
    enabled: !!currentOrganization,
  });

  const createMutation = useMutation({
    mutationFn: async (params: { name: string; color?: string }) => {
      const session = await getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create folder');
      }

      return response.json() as Promise<QRCodeFolder>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (params: { id: string; name?: string; color?: string }) => {
      const session = await getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      const { id, ...body } = params;
      const response = await fetch(`/api/folders?id=${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update folder');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const session = await getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      const response = await fetch(`/api/folders?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete folder');
      }

      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['qr-codes'] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    folders,
    isLoading,
    createFolder: createMutation.mutateAsync,
    updateFolder: updateMutation.mutateAsync,
    deleteFolder: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
  };
}
