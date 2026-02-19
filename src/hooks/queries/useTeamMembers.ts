import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/authStore';
import type { OrganizationMember, User, OrgRole } from '@/types/database';

export interface MemberWithUser extends OrganizationMember {
  user: User;
}

async function fetchTeamMembers(orgId: string): Promise<MemberWithUser[]> {
  const { data, error } = await supabase
    .from('organization_members')
    .select(`
      *,
      user:users(*)
    `)
    .eq('organization_id', orgId);

  if (error) {
    console.error('Error fetching members:', error);
    return [];
  }

  return data as MemberWithUser[];
}

async function createInvitation(params: {
  orgId: string;
  email: string;
  role: OrgRole;
  invitedBy: string;
}): Promise<void> {
  // Check if user is already a member
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', params.email.toLowerCase())
    .single();

  if (existingUser) {
    const { data: existingMember } = await supabase
      .from('organization_members')
      .select('id')
      .eq('organization_id', params.orgId)
      .eq('user_id', existingUser.id)
      .single();

    if (existingMember) {
      throw new Error('This user is already a member of the organization');
    }
  }

  // Check if invitation already exists
  const { data: existingInvite } = await supabase
    .from('organization_invitations')
    .select('id')
    .eq('organization_id', params.orgId)
    .eq('email', params.email.toLowerCase())
    .is('accepted_at', null)
    .single();

  if (existingInvite) {
    throw new Error('An invitation has already been sent to this email');
  }

  const token = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const { error } = await supabase
    .from('organization_invitations')
    .insert({
      organization_id: params.orgId,
      email: params.email.toLowerCase(),
      role: params.role,
      token,
      invited_by: params.invitedBy,
      expires_at: expiresAt.toISOString(),
    });

  if (error) {
    throw new Error('Failed to send invitation');
  }
}

export function useTeamMembers() {
  const currentOrganization = useAuthStore((s) => s.currentOrganization);

  return useQuery({
    queryKey: ['team-members', currentOrganization?.id],
    queryFn: () => fetchTeamMembers(currentOrganization!.id),
    enabled: !!currentOrganization,
  });
}

export function useInviteMember() {
  const queryClient = useQueryClient();
  const currentOrganization = useAuthStore((s) => s.currentOrganization);

  return useMutation({
    mutationFn: (params: { email: string; role: OrgRole; invitedBy: string }) =>
      createInvitation({ orgId: currentOrganization!.id, ...params }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', currentOrganization?.id] });
    },
  });
}
