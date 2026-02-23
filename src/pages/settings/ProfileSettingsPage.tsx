import { useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/stores/authStore';
import { useShallow } from 'zustand/react/shallow';
import { toast } from '@/stores/toastStore';
import { supabase } from '@/lib/supabase';
import { Camera, Loader2, Trash2 } from 'lucide-react';

const AVATAR_MAX_SIZE = 2 * 1024 * 1024; // 2MB
const AVATAR_ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export function ProfileSettingsContent() {
  const { user, profile, updateProfile } = useAuthStore(useShallow((s) => ({ user: s.user, profile: s.profile, updateProfile: s.updateProfile })));
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [name, setName] = useState(profile?.name || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!AVATAR_ACCEPTED_TYPES.includes(file.type)) {
      toast.error('Please upload a JPEG, PNG, GIF, or WebP image');
      return;
    }
    if (file.size > AVATAR_MAX_SIZE) {
      toast.error('Image must be smaller than 2MB');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const filePath = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        toast.error(`Upload failed: ${uploadError.message}`);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Append cache-buster so the browser fetches the new image
      const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      const { error: profileError } = await updateProfile({ avatar_url: avatarUrl });

      if (profileError) {
        toast.error(profileError.message);
      } else {
        toast.success('Avatar updated');
      }
    } catch {
      toast.error('Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
      // Reset file input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAvatarRemove = async () => {
    if (!user || !profile?.avatar_url) return;

    setIsUploadingAvatar(true);
    try {
      // List and remove all files in the user's avatar folder
      const { data: files } = await supabase.storage
        .from('avatars')
        .list(user.id);

      if (files && files.length > 0) {
        const paths = files.map((f) => `${user.id}/${f.name}`);
        await supabase.storage.from('avatars').remove(paths);
      }

      const { error } = await updateProfile({ avatar_url: null });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Avatar removed');
      }
    } catch {
      toast.error('Failed to remove avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const { error } = await updateProfile({ display_name: displayName || null, name });
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
            <button
              type="button"
              className="relative group w-20 h-20 rounded-full overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
            >
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
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                {isUploadingAvatar ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Camera className="w-5 h-5 text-white" />
                )}
              </div>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={handleAvatarUpload}
            />

            <div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                >
                  {isUploadingAvatar ? 'Uploading...' : 'Change photo'}
                </Button>
                {profile?.avatar_url && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleAvatarRemove}
                    disabled={isUploadingAvatar}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </Button>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                JPG, PNG, GIF or WebP. Max 2MB.
              </p>
            </div>
          </div>
        </div>

        {/* Personal information */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Personal Information
          </h2>

          <div className="space-y-4">
            <Input
              label="Display Name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Johnny"
              hint="Shown in the header and to teammates"
              maxLength={100}
            />

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
