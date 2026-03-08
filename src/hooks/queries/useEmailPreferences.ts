import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { useShallow } from 'zustand/react/shallow';

export interface EmailPreferences {
  scan_milestones: boolean;
  weekly_digest: boolean;
  monthly_digest: boolean;
  product_updates: boolean;
  upgrade_prompts: boolean;
  usage_warnings: boolean;
  security_alerts: boolean;
  unsubscribed_all: boolean;
}

const DEFAULT_PREFS: EmailPreferences = {
  scan_milestones: true,
  weekly_digest: true,
  monthly_digest: true,
  product_updates: true,
  upgrade_prompts: true,
  usage_warnings: true,
  security_alerts: true,
  unsubscribed_all: false,
};

async function fetchPreferences(token: string): Promise<EmailPreferences> {
  const res = await fetch('/api/email-preferences', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch email preferences');
  return res.json();
}

async function updatePreferences(token: string, updates: Partial<EmailPreferences>): Promise<void> {
  const res = await fetch('/api/email-preferences', {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update email preferences');
}

export function useEmailPreferences() {
  const { session } = useAuthStore(useShallow((s) => ({ session: s.session })));
  const token = session?.access_token;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['email-preferences'],
    queryFn: () => fetchPreferences(token!),
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: DEFAULT_PREFS,
  });

  const mutation = useMutation({
    mutationFn: (updates: Partial<EmailPreferences>) => updatePreferences(token!, updates),
    onMutate: async (updates) => {
      await queryClient.cancelQueries({ queryKey: ['email-preferences'] });
      const previous = queryClient.getQueryData<EmailPreferences>(['email-preferences']);
      queryClient.setQueryData<EmailPreferences>(['email-preferences'], (old) => ({
        ...(old || DEFAULT_PREFS),
        ...updates,
      }));
      return { previous };
    },
    onError: (_err, _updates, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['email-preferences'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['email-preferences'] });
    },
  });

  return {
    preferences: query.data || DEFAULT_PREFS,
    isLoading: query.isLoading,
    updatePreference: (key: keyof EmailPreferences, value: boolean) => {
      mutation.mutate({ [key]: value });
    },
    updatePreferences: mutation.mutate,
    isUpdating: mutation.isPending,
  };
}
