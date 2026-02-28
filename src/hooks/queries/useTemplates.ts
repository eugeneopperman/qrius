import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSession } from '@/lib/supabase';
import { toast } from '@/stores/toastStore';
import { useAuthStore } from '@/stores/authStore';
import type { BrandTemplate, BrandTemplateStyle } from '@/types';

interface APITemplate {
  id: string;
  name: string;
  style: BrandTemplateStyle;
  created_at: string;
  updated_at: string;
}

interface APITemplatesResponse {
  templates: APITemplate[];
}

interface MigrateResponse {
  imported: number;
  skipped: number;
}

function mapAPIToTemplate(api: APITemplate): BrandTemplate {
  return {
    id: api.id,
    name: api.name,
    style: api.style,
    createdAt: new Date(api.created_at).getTime(),
    updatedAt: new Date(api.updated_at).getTime(),
  };
}

async function fetchTemplates(): Promise<BrandTemplate[]> {
  const session = await getSession();
  if (!session?.access_token) return [];

  const response = await fetch('/api/templates', {
    headers: { Authorization: `Bearer ${session.access_token}` },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch templates');
  }

  const data: APITemplatesResponse = await response.json();
  return data.templates.map(mapAPIToTemplate);
}

export function useTemplates() {
  const user = useAuthStore((s) => s.user);
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const currentOrganization = useAuthStore((s) => s.currentOrganization);
  const queryClient = useQueryClient();

  const ownerId = currentOrganization?.id ?? user?.id ?? 'anon';
  const queryKey = ['brand-templates', ownerId] as const;

  const { data: templates = [], isLoading, error } = useQuery({
    queryKey,
    queryFn: fetchTemplates,
    enabled: isInitialized && !!user,
    refetchOnMount: 'always',
  });

  const createMutation = useMutation({
    mutationFn: async (params: { name: string; style: BrandTemplateStyle }): Promise<APITemplate> => {
      const session = await getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create template');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-templates'] });
    },
    onError: (error: Error) => {
      if (error.message.includes('limit reached')) {
        toast.info('Template limit reached. Upgrade to Pro for unlimited templates.');
      } else {
        toast.error('Failed to create template');
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (params: { id: string; name?: string; style?: BrandTemplateStyle }): Promise<APITemplate> => {
      const session = await getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      const { id, ...body } = params;
      const response = await fetch(`/api/templates?id=${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update template');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-templates'] });
    },
    onError: () => {
      toast.error('Failed to update template');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const session = await getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      const response = await fetch(`/api/templates?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete template');
      }

      return id;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData(queryKey, (old: BrandTemplate[] | undefined) =>
        old ? old.filter((t) => t.id !== deletedId) : old
      );
      queryClient.invalidateQueries({ queryKey: ['brand-templates'] });
    },
    onError: () => {
      toast.error('Failed to delete template');
    },
  });

  const migrateMutation = useMutation({
    mutationFn: async (templates: Array<{ name: string; style: BrandTemplateStyle }>): Promise<MigrateResponse> => {
      const session = await getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      const response = await fetch('/api/templates?action=migrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ templates }),
      });

      if (!response.ok) {
        throw new Error('Failed to migrate templates');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-templates'] });
    },
  });

  return {
    templates,
    isLoading,
    error,
    createTemplate: createMutation.mutateAsync,
    updateTemplate: updateMutation.mutateAsync,
    deleteTemplate: deleteMutation.mutateAsync,
    migrateFromLocalStorage: migrateMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}
