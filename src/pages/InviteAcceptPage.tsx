import { useState, useEffect, useCallback } from 'react';
import { useSearch, Link, useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/authStore';
import { getSession } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { toast } from '@/stores/toastStore';
import { Loader2, Users, Check, X, LogIn } from 'lucide-react';

interface InvitationDetails {
  id: string;
  email: string;
  role: string;
  expiresAt: string;
  organization: { id: string; name: string; slug: string };
}

export default function InviteAcceptPage() {
  const search = useSearch({ strict: false }) as { token?: string };
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const fetchOrganizations = useAuthStore((s) => s.fetchOrganizations);

  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);

  const token = search.token;

  // Fetch invitation details
  useEffect(() => {
    if (!token) {
      setError('Missing invitation token');
      setIsLoading(false);
      return;
    }

    async function fetchInvite() {
      try {
        const response = await fetch(`/api/organizations/invite/accept?token=${encodeURIComponent(token!)}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Invalid invitation');
          return;
        }

        setInvitation(data.invitation);
      } catch {
        setError('Failed to load invitation details');
      } finally {
        setIsLoading(false);
      }
    }

    fetchInvite();
  }, [token]);

  const handleAccept = useCallback(async () => {
    if (!token) return;

    setIsAccepting(true);
    try {
      const session = await getSession();
      if (!session?.access_token) {
        toast.error('Please sign in to accept this invitation');
        return;
      }

      const response = await fetch('/api/organizations/invite/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept invitation');
      }

      // Refresh organizations in auth store
      await fetchOrganizations();
      toast.success(`Joined ${data.organization?.name || 'the organization'}`);
      navigate({ to: '/dashboard' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to accept invitation');
    } finally {
      setIsAccepting(false);
    }
  }, [token, fetchOrganizations, navigate]);

  const handleDecline = useCallback(() => {
    navigate({ to: user ? '/dashboard' : '/' });
  }, [navigate, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-6">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Invalid Invitation
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
          <Link to="/">
            <Button variant="secondary">Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!invitation) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Logo size="md" className="mx-auto mb-4" />
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-8">
          <div className="text-center mb-6">
            <div className="mx-auto w-14 h-14 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-4">
              <Users className="w-7 h-7 text-orange-600 dark:text-orange-400" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
              Team Invitation
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              You've been invited to join
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6 space-y-2">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Organization</span>
              <p className="font-medium text-gray-900 dark:text-white">
                {invitation.organization.name}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Role</span>
              <p className="font-medium text-gray-900 dark:text-white capitalize">
                {invitation.role}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Invited as</span>
              <p className="font-medium text-gray-900 dark:text-white">
                {invitation.email}
              </p>
            </div>
          </div>

          {!user ? (
            // Not authenticated — prompt to sign in
            <div className="space-y-3">
              <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-4">
                Please sign in to accept this invitation
              </p>
              <Link
                to="/signin"
                search={{ redirect: `/invite/accept?token=${token}` }}
              >
                <Button className="w-full">
                  <LogIn className="w-4 h-4" />
                  Sign In to Accept
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="secondary" className="w-full">
                  Create Account
                </Button>
              </Link>
            </div>
          ) : (
            // Authenticated — accept or decline
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={handleDecline}
              >
                Decline
              </Button>
              <Button
                className="flex-1"
                onClick={handleAccept}
                disabled={isAccepting}
              >
                {isAccepting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Accept Invitation
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
