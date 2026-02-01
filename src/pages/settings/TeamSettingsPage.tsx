import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';
import { toast } from '../../stores/toastStore';
import type { OrganizationMember, User, OrgRole } from '../../types/database';
import {
  ArrowLeft,
  Loader2,
  UserPlus,
  MoreVertical,
  Mail,
  Shield,
  X,
} from 'lucide-react';

interface MemberWithUser extends OrganizationMember {
  user: User;
}

export default function TeamSettingsPage() {
  const { currentOrganization, currentRole, user } = useAuthStore();
  const [members, setMembers] = useState<MemberWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    async function fetchMembers() {
      if (!currentOrganization) return;

      setIsLoading(true);

      try {
        const { data, error } = await supabase
          .from('organization_members')
          .select(`
            *,
            user:users(*)
          `)
          .eq('organization_id', currentOrganization.id);

        if (error) {
          console.error('Error fetching members:', error);
        } else {
          setMembers(data as MemberWithUser[]);
        }
      } catch (error) {
        console.error('Error fetching members:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMembers();
  }, [currentOrganization]);

  const canManageTeam = currentRole === 'owner' || currentRole === 'admin';

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

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/settings"
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Settings
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team</h1>
              <p className="text-gray-500 dark:text-gray-400">
                Manage team members for {currentOrganization?.name}
              </p>
            </div>
            {canManageTeam && (
              <Button onClick={() => setShowInviteModal(true)}>
                <UserPlus className="w-4 h-4" />
                Invite member
              </Button>
            )}
          </div>
        </div>

        {/* Members list */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No team members yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <div className="flex items-center gap-3">
                    {member.user.avatar_url ? (
                      <img
                        src={member.user.avatar_url}
                        alt={member.user.name || 'Avatar'}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
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
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
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
        <div className="mt-8 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
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
    </DashboardLayout>
  );
}

function InviteMemberModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<OrgRole>('editor');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // TODO: Implement invitation API
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success(`Invitation sent to ${email}`);
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
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
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
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
