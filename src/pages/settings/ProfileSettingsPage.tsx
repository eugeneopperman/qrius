import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/stores/authStore';
import { useShallow } from 'zustand/react/shallow';
import { toast } from '@/stores/toastStore';
import { Loader2 } from 'lucide-react';

export function ProfileSettingsContent() {
  const { user, profile, updateProfile } = useAuthStore(useShallow((s) => ({ user: s.user, profile: s.profile, updateProfile: s.updateProfile })));
  const [name, setName] = useState(profile?.name || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const { error } = await updateProfile({ name });
    setIsSaving(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Profile updated successfully');
    }
  };

  const initials = (profile?.name || user?.email || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar section */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Profile Picture
          </h2>

          <div className="flex items-center gap-6">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.name || 'Avatar'}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <span className="text-2xl font-medium text-orange-600 dark:text-orange-400">
                  {initials}
                </span>
              </div>
            )}

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Avatar upload coming soon
            </p>
          </div>
        </div>

        {/* Personal information */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Personal Information
          </h2>

          <div className="space-y-4">
            <Input
              label="Full name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
            />

            <Input
              label="Email address"
              type="email"
              value={user?.email || ''}
              disabled
              className="bg-gray-50 dark:bg-gray-800"
              hint="Email cannot be changed"
            />
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save changes'
            )}
          </Button>
        </div>
      </form>

      {/* Danger zone */}
      <div className="mt-8 bg-white dark:bg-gray-900 rounded-2xl border border-red-200 dark:border-red-900 shadow-sm p-6">
        <h2 className="text-lg font-medium text-red-600 dark:text-red-400 mb-2">
          Danger Zone
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          To delete your account, please contact support at support@qrius.app.
        </p>
      </div>
    </div>
  );
}

// Keep default export for backward compatibility (redirects)
export default function ProfileSettingsPage() {
  return <ProfileSettingsContent />;
}
