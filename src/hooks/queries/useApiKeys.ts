import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import type { ApiKey } from '@/types/database';

async function fetchApiKeys(orgId: string): Promise<ApiKey[]> {
  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching API keys:', error);
    return [];
  }

  return data || [];
}

async function createApiKey(params: {
  orgId: string;
  name: string;
  rateLimit: number;
}): Promise<{ apiKey: ApiKey; fullKey: string }> {
  const prefix = crypto.randomUUID().replace(/-/g, '').substring(0, 8);
  const secret = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
  const fullKey = `qr_${prefix}_${secret}`;

  const encoder = new TextEncoder();
  const data = encoder.encode(fullKey);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const keyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  const { data: newApiKey, error } = await supabase
    .from('api_keys')
    .insert({
      organization_id: params.orgId,
      name: params.name,
      key_hash: keyHash,
      key_prefix: `qr_${prefix}`,
      scopes: ['qr:read', 'qr:write'],
      rate_limit_per_day: params.rateLimit,
    })
    .select()
    .single();

  if (error) {
    throw new Error('Failed to create API key');
  }

  return { apiKey: newApiKey, fullKey };
}

async function deleteApiKey(keyId: string): Promise<void> {
  const { error } = await supabase.from('api_keys').delete().eq('id', keyId);
  if (error) {
    throw new Error('Failed to delete API key');
  }
}

export function useApiKeys() {
  const currentOrganization = useAuthStore((s) => s.currentOrganization);

  return useQuery({
    queryKey: ['api-keys', currentOrganization?.id],
    queryFn: () => fetchApiKeys(currentOrganization!.id),
    enabled: !!currentOrganization,
  });
}

export function useCreateApiKey() {
  const queryClient = useQueryClient();
  const currentOrganization = useAuthStore((s) => s.currentOrganization);
  const planLimits = useAuthStore((s) => s.planLimits);

  return useMutation({
    mutationFn: (name: string) =>
      createApiKey({
        orgId: currentOrganization!.id,
        name,
        rateLimit: planLimits?.api_requests_per_day || 1000,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys', currentOrganization?.id] });
    },
  });
}

export function useDeleteApiKey() {
  const queryClient = useQueryClient();
  const currentOrganization = useAuthStore((s) => s.currentOrganization);

  return useMutation({
    mutationFn: deleteApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys', currentOrganization?.id] });
    },
  });
}
