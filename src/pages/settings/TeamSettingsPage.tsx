import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/stores/authStore';
import { useShallow } from 'zustand/react/shallow';
import { toast } from '@/stores/toastStore';
import { UsageLimitWarning } from '@/components/dashboard/UpgradePrompt';
import { useTeamMembers, useInviteMember } from '@/hooks/queries/useTeamMembers';
import type { OrgRole } from '@/types/database';
import { QueryError } from '@/components/ui/QueryError';
import {
  Loader2,
  UserPlus,
  MoreVertical,
  Mail,
  Shield,
  X,
} from 'lucide-react';

const roleLabels: Record<OrgRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  editor: 'Editor',
  viewer: 'Viewer',
};

const roleColors: Record<OrgRole, string> = {
  owner: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  admin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  editor: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  viewer: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};

export function TeamSettingsContent() {
  const { currentOrganization, currentRole, user, planLimits } = useAuthStore(useShallow((s) => ({ currentOrganization: s.currentOrganization, currentRole: s.currentRole, user: s.user, planLimits: s.planLimits })));
  const { data: members = [], isLoading, error, refetch } = useTeamMembers();
  const [showInviteModal, setShowInviteModal] = useState(false);

  const canManageTeam = currentRole === 'owner' || currentRole === 'admin';
  const teamLimit = planLimits?.team_members ?? 1;
  const isAtLimit = teamLimit !== -1 && members.length >= teamLimit;

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Manage team members for {currentOrganization?.name}
            </p>
          </div>
          {canManageTeam && (
            <Button onClick={() => setShowInviteModal(true)} disabled={isAtLimit} title={isAtLimit ? `Team member limit reached (${teamLimit})` : undefined}>
              <UserPlus className="w-4 h-4" />
              Invite member
            </Button>
          )}
        </div>
      </div>

      {/* Team member limit warning */}
      {planLimits && teamLimit > 0 && members.length > 0 && (
        <UsageLimitWarning
          current={members.length}
          limit={teamLimit}
          type="team_members"
        />
      )}

      {/* Members list */}
      <div className="glass rounded-2xl overflow-hidden">
        {error ? (
          <QueryError message="Failed to load team members." retry={() => refetch()} />
        ) : isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-12 px-6">
            <UserPlus className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No team members yet
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Invite colleagues to collaborate on QR codes and share analytics.
            </p>
            {canManageTeam && (
              <Button onClick={() => setShowInviteModal(true)}>
                <UserPlus className="w-4 h-4" />
                Invite your first member
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-divider">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 hover:bg-black/5 dark:hover:bg-white/5"
              >
                <div className="flex items-center gap-3">
                  {member.user.avatar_url ? (
                    <img
                      src={member.user.avatar_url}
                      alt={member.user.name || 'Avatar'}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-orange-500/12 dark:bg-orange-400/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                        {(member.user.name || member.user.email || 'U')
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {member.user.name || 'Unnamed'}
                      {member.user_id === user?.id && (
                        <span className="ml-2 text-xs text-gray-500">(you)</span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {member.user.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${roleColors[member.role]}`}
                  >
                    {roleLabels[member.role]}
                  </span>

                  {canManageTeam && member.role !== 'owner' && member.user_id !== user?.id && (
                    <button className="btn-icon" aria-label="Team member options">
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Role descriptions */}
      <div className="mt-8 glass rounded-2xl p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Role Permissions
        </h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-purple-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Owner</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Full access. Can delete organization, manage billing, and all members.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Admin</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Can manage members, API keys, and all QR codes.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Editor</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Can create, edit, and delete QR codes. Cannot manage team.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-gray-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Viewer</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                View-only access. Can see QR codes and analytics.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Invite modal */}
      {showInviteModal && (
        <InviteMemberModal onClose={() => setShowInviteModal(false)} />
      )}
    </div>
  );
}

export default function TeamSettingsPage() {
  return <TeamSettingsContent />;
}

function InviteMemberModal({ onClose }: { onClose: () => void }) {
  const user = useAuthStore((s) => s.user);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<OrgRole>('editor');
  const inviteMember = useInviteMember();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Not authenticated');
      return;
    }

    try {
      await inviteMember.mutateAsync({ email, role, invitedBy: user.id });
      toast.success(`Invitation sent to ${email}`);
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send invitation');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-md" onClick={onClose} />
      <div className="relative glass-heavy rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Invite team member
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as OrgRole)}
              className="w-full px-3 py-2 bg-white/70 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>

          <div className="flex gap-3 mt-6">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={inviteMember.isPending} className="flex-1">
              {inviteMember.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send invitation'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
