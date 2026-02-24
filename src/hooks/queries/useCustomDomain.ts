import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSession } from '@/lib/supabase';
import type { CustomDomain } from '@/types/database';

interface DomainResponse {
  domain: CustomDomain | null;
}

interface AddDomainResponse {
  domain: CustomDomain;
  instructions: {
    type: string;
    host: string;
    value: string;
    fullRecord: string;
  };
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const session = await getSession();
  if (!session?.access_token) throw new Error('Not authenticated');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.access_token}`,
  };
}

async function fetchCustomDomain(): Promise<DomainResponse> {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/domains', { headers });
  if (!res.ok) throw new Error('Failed to fetch domain');
  return res.json();
}

type AddDomainParams =
  | { type: 'subdomain'; subdomain: string }
  | { type: 'custom'; domain: string };

async function addCustomDomain(params: AddDomainParams): Promise<AddDomainResponse> {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/domains', {
    method: 'POST',
    headers,
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to add domain');
  return data;
}

async function verifyCustomDomain(): Promise<{ domain: CustomDomain }> {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/domains/verify', {
    method: 'POST',
    headers,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to verify domain');
  return data;
}

async function removeCustomDomain(): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch('/api/domains', {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to remove domain');
  }
}

export function useCustomDomain() {
  const queryClient = useQueryClient();
  const queryKey = ['custom-domain'];

  const query = useQuery({
    queryKey,
    queryFn: fetchCustomDomain,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const invalidateDomainAndQRCodes = () => {
    queryClient.invalidateQueries({ queryKey });
    // Tracking URLs change when domain changes — refetch QR codes
    queryClient.invalidateQueries({ queryKey: ['qr-codes'] });
    queryClient.invalidateQueries({ queryKey: ['qr-code-detail'] });
  };

  const addMutation = useMutation({
    mutationFn: addCustomDomain,
    onSuccess: invalidateDomainAndQRCodes,
  });

  const verifyMutation = useMutation({
    mutationFn: verifyCustomDomain,
    onSuccess: invalidateDomainAndQRCodes,
  });

  const removeMutation = useMutation({
    mutationFn: removeCustomDomain,
    onSuccess: invalidateDomainAndQRCodes,
  });

  return {
    domain: query.data?.domain ?? null,
    isLoading: query.isLoading,
    error: query.error,
    addDomain: addMutation.mutateAsync,
    isAdding: addMutation.isPending,
    addError: addMutation.error,
    verifyDomain: verifyMutation.mutateAsync,
    isVerifying: verifyMutation.isPending,
    removeDomain: removeMutation.mutateAsync,
    isRemoving: removeMutation.isPending,
  };
}
