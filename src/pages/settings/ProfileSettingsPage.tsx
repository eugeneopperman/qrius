import { useRef, useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/stores/authStore';
import { useShallow } from 'zustand/react/shallow';
import { useThemeStore } from '@/stores/themeStore';
import type { ThemeMode, ResolvedTheme, AutoSchedule } from '@/stores/themeStore';
import { toast } from '@/stores/toastStore';
import { supabase } from '@/lib/supabase';
import {
  Camera, Loader2, Trash2, Sun, CloudSun, Moon, Clock, Save,
  Shield, Lock, Eye, EyeOff, ArrowRight, Building2, Globe,
} from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { useOrganizationQRCodes } from '@/hooks/useOrganizationQRCodes';
import { useUsageStats } from '@/hooks/queries/useUsageStats';
import { cn } from '@/utils/cn';
import type { Plan, OrgRole } from '@/types/database';

// ============================================================================
// Constants
// ============================================================================

const AVATAR_MAX_SIZE = 2 * 1024 * 1024; // 2MB
const AVATAR_ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const PLAN_BADGE: Record<Plan, { label: string; className: string }> = {
  free: { label: 'Free', className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  pro: { label: 'Pro', className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  business: { label: 'Business', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
};

const ROLE_COLORS: Record<OrgRole, string> = {
  owner: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  admin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  editor: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  viewer: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

function relativeTime(iso: string | null | undefined): string {
  if (!iso) return 'Unknown';
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays} days ago`;
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }
  const years = Math.floor(diffDays / 365);
  return `${years} year${years > 1 ? 's' : ''} ago`;
}

const COUNTRY_LIST = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia',
  'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados',
  'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina',
  'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia',
  'Cameroon', 'Canada', 'Cape Verde', 'Central African Republic', 'Chad', 'Chile',
  'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus',
  'Czech Republic', 'Denmark', 'Djibouti', 'Dominican Republic', 'Ecuador', 'Egypt',
  'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia',
  'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana',
  'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guyana', 'Haiti', 'Honduras', 'Hungary',
  'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy',
  'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kuwait', 'Kyrgyzstan', 'Laos',
  'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania',
  'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta',
  'Mauritania', 'Mauritius', 'Mexico', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro',
  'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nepal', 'Netherlands', 'New Zealand',
  'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman',
  'Pakistan', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines',
  'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saudi Arabia', 'Senegal',
  'Serbia', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Somalia', 'South Africa',
  'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden',
  'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Togo',
  'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Uganda', 'Ukraine',
  'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan',
  'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe',
];

// ============================================================================
// Sub-components
// ============================================================================

function CompactUsageBar({ label, used, limit }: { label: string; used: number; limit: number }) {
  const isUnlimited = limit === -1;
  const pct = isUnlimited ? 0 : limit === 0 ? 0 : Math.min((used / limit) * 100, 100);
  const isWarning = !isUnlimited && pct >= 80;
  const isCritical = !isUnlimited && pct >= 95;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="font-medium text-gray-900 dark:text-white">
          {used.toLocaleString()} / {isUnlimited ? 'Unlimited' : limit.toLocaleString()}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-orange-500'
          )}
          style={{ width: isUnlimited ? '0%' : `${pct}%` }}
        />
      </div>
    </div>
  );
}

function AccountOverviewCard({
  memberSince,
  plan,
  role,
  workspaceName,
  usageStats,
  planLimits,
  teamMembers,
}: {
  memberSince: string | null | undefined;
  plan: Plan;
  role: OrgRole | null;
  workspaceName: string | undefined;
  usageStats: { scansUsed: number; scansLimit: number; qrCodesUsed: number; qrCodesLimit: number } | undefined;
  planLimits: { team_members: number } | null;
  teamMembers: number;
}) {
  const badge = PLAN_BADGE[plan] || PLAN_BADGE.free;
  const roleBadge = role ? ROLE_COLORS[role] : ROLE_COLORS.viewer;

  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Account Overview
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Left: Account info */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500 dark:text-gray-400 w-24">Member since</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {memberSince ? new Date(memberSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Unknown'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500 dark:text-gray-400 w-24">Plan</span>
            <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold', badge.className)}>
              {badge.label}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500 dark:text-gray-400 w-24">Role</span>
            <span className={cn('px-2 py-0.5 rounded-full text-xs font-semibold capitalize', roleBadge)}>
              {role || 'viewer'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500 dark:text-gray-400 w-24">Workspace</span>
            <span className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-gray-400" />
              {workspaceName || 'Personal'}
            </span>
          </div>
        </div>

        {/* Right: Usage bars */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Usage This Month
          </p>
          {usageStats ? (
            <>
              <CompactUsageBar label="Dynamic QR Codes" used={usageStats.qrCodesUsed} limit={usageStats.qrCodesLimit} />
              <CompactUsageBar label="Monthly Scans" used={usageStats.scansUsed} limit={usageStats.scansLimit} />
              <CompactUsageBar label="Team Members" used={teamMembers} limit={planLimits?.team_members ?? 1} />
            </>
          ) : (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-1">
                  <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                  <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="flex items-center gap-4 mt-5 pt-4 border-t border-black/[0.04] dark:border-white/[0.04]">
        {plan === 'free' && (
          <Link
            to="/settings"
            search={{ tab: 'billing' }}
            className="text-sm text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
          >
            Upgrade plan <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
        <Link
          to="/settings"
          search={{ tab: 'team' }}
          className="text-sm text-gray-600 dark:text-gray-400 hover:underline flex items-center gap-1"
        >
          Manage team <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

function SecurityCard({
  provider,
  lastSignIn,
  updatePassword,
}: {
  provider: string | undefined;
  lastSignIn: string | null | undefined;
  updatePassword: (pw: string) => Promise<{ error: Error | null }>;
}) {
  const isEmailAuth = !provider || provider === 'email';
  const providerLabel = provider === 'google' ? 'Google' : provider === 'github' ? 'GitHub' : 'Email & Password';

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const passwordValid = newPassword.length >= 8;
  const passwordsMatch = newPassword === confirmPassword;

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordValid || !passwordsMatch) return;

    setIsChangingPassword(true);
    const { error } = await updatePassword(newPassword);
    setIsChangingPassword(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password updated successfully');
      setNewPassword('');
      setConfirmPassword('');
      setShowChangePassword(false);
    }
  };

  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Shield className="w-5 h-5 text-gray-500" />
        Security
      </h2>

      <div className="space-y-4">
        {/* Login method */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Login method</span>
          <span className="font-medium text-gray-900 dark:text-white flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-gray-400" />
            {providerLabel}
          </span>
        </div>

        {/* Last sign-in */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Last sign-in</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {relativeTime(lastSignIn)}
          </span>
        </div>

        {/* Change password */}
        {isEmailAuth ? (
          <div className="pt-2 border-t border-black/[0.04] dark:border-white/[0.04]">
            {!showChangePassword ? (
              <button
                type="button"
                onClick={() => setShowChangePassword(true)}
                className="text-sm text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1"
              >
                Change password <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <form onSubmit={handlePasswordChange} className="space-y-3 animate-fade-in">
                <div className="relative">
                  <Input
                    label="New password"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <Input
                  label="Confirm password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  error={confirmPassword && !passwordsMatch ? 'Passwords do not match' : undefined}
                />
                <div className="flex items-center gap-2">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!passwordValid || !passwordsMatch || isChangingPassword}
                  >
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update password'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setShowChangePassword(false);
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <p className="text-xs text-gray-400 dark:text-gray-500 pt-2 border-t border-black/[0.04] dark:border-white/[0.04]">
            Password changes are managed by your {providerLabel} account.
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function ProfileSettingsContent() {
  const {
    user, profile, updateProfile, updatePassword,
    currentOrganization, currentRole, planLimits,
  } = useAuthStore(useShallow((s) => ({
    user: s.user,
    profile: s.profile,
    updateProfile: s.updateProfile,
    updatePassword: s.updatePassword,
    currentOrganization: s.currentOrganization,
    currentRole: s.currentRole,
    planLimits: s.planLimits,
  })));

  const { theme, resolvedTheme, autoSchedule, setTheme, setAutoSchedule } = useThemeStore();
  const autosaveEnabled = useSettingsStore((s) => s.autosaveEnabled);
  const setAutosaveEnabled = useSettingsStore((s) => s.setAutosaveEnabled);

  // Usage data
  const { totalCount, monthlyScans, teamMembers } = useOrganizationQRCodes({ limit: 1 });
  const { data: usageStats } = useUsageStats({ totalQRCodes: totalCount, monthlyScans });

  // Profile form state
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [company, setCompany] = useState(profile?.company || '');
  const [street, setStreet] = useState(profile?.street || '');
  const [city, setCity] = useState(profile?.city || '');
  const [zip, setZip] = useState(profile?.zip || '');
  const [country, setCountry] = useState(profile?.country || '');
  const [website, setWebsite] = useState(profile?.website || '');
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
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAvatarRemove = async () => {
    if (!user || !profile?.avatar_url) return;

    setIsUploadingAvatar(true);
    try {
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

    const { error } = await updateProfile({
      display_name: displayName || null,
      name,
      phone: phone || null,
      company: company || null,
      street: street || null,
      city: city || null,
      zip: zip || null,
      country: country || null,
      website: website || null,
    });
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

  const plan = planLimits?.plan || profile?.plan || 'free';
  const provider = user?.app_metadata?.provider as string | undefined;

  return (
    <div className="max-w-2xl space-y-6">
      {/* 1. Account Overview */}
      <AccountOverviewCard
        memberSince={profile?.created_at}
        plan={plan}
        role={currentRole}
        workspaceName={currentOrganization?.name}
        usageStats={usageStats}
        planLimits={planLimits}
        teamMembers={teamMembers}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 2. Profile Picture */}
        <div className="glass rounded-2xl p-6">
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
                <div className="w-20 h-20 rounded-full bg-orange-500/12 dark:bg-orange-400/10 flex items-center justify-center">
                  <span className="text-2xl font-medium text-orange-600 dark:text-orange-400">
                    {initials}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
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

        {/* 3. Personal Information (expanded) */}
        <div className="glass rounded-2xl p-6">
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
              className="bg-black/5 dark:bg-white/5"
              hint="Email cannot be changed"
            />

            {/* Divider */}
            <div className="border-t border-black/[0.04] dark:border-white/[0.04] pt-4 mt-4">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                Contact & Business
              </p>
            </div>

            <Input
              label="Phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              maxLength={30}
            />

            <Input
              label="Company"
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Acme Inc."
              maxLength={200}
            />

            <div className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-gray-400 mt-5" />
              <div className="flex-1">
                <Input
                  label="Website"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                  maxLength={500}
                />
              </div>
            </div>

            {/* Address sub-section */}
            <div className="border-t border-black/[0.04] dark:border-white/[0.04] pt-4 mt-4">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                Address
              </p>
            </div>

            <Input
              label="Street"
              type="text"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="123 Main St"
              maxLength={200}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="City"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="San Francisco"
                maxLength={100}
              />
              <Input
                label="ZIP / Postal code"
                type="text"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                placeholder="94107"
                maxLength={20}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Country
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="input text-sm py-2.5"
              >
                <option value="">Select a country</option>
                {COUNTRY_LIST.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
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

      {/* 4. Security */}
      <SecurityCard
        provider={provider}
        lastSignIn={user?.last_sign_in_at}
        updatePassword={updatePassword}
      />

      {/* 5. Appearance */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Appearance
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Choose a theme for the app
        </p>
        <ThemeSelector
          theme={theme}
          resolvedTheme={resolvedTheme}
          autoSchedule={autoSchedule}
          onThemeChange={setTheme}
          onScheduleChange={setAutoSchedule}
        />
      </div>

      {/* 6. QR Code Autosave */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          <Save className="w-5 h-5 inline-block mr-2 -mt-0.5" />
          QR Code Autosave
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Auto-save drafts</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Automatically save your QR code every 2 minutes while creating
            </p>
          </div>
          <button
            role="switch"
            aria-checked={autosaveEnabled}
            onClick={() => setAutosaveEnabled(!autosaveEnabled)}
            className={cn(
              'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2',
              autosaveEnabled ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'
            )}
          >
            <span
              className={cn(
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out',
                autosaveEnabled ? 'translate-x-5' : 'translate-x-0'
              )}
            />
          </button>
        </div>
      </div>

      {/* 7. Danger zone */}
      <div className="glass rounded-2xl border-red-200/50 dark:border-red-900/30 p-6">
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

// ============================================================================
// Theme Selector Component
// ============================================================================

const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: typeof Sun; swatch: string; desc: string }[] = [
  { mode: 'warm', label: 'Warm', icon: Sun, swatch: '#f9f6f1', desc: 'Warm beige tones' },
  { mode: 'cool', label: 'Cool', icon: CloudSun, swatch: '#eef2f7', desc: 'Cool blue-gray' },
  { mode: 'dark', label: 'Dark', icon: Moon, swatch: '#141413', desc: 'Dark mode' },
  { mode: 'auto', label: 'Auto', icon: Clock, swatch: '', desc: 'Time-based switching' },
];

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function formatHour(h: number): string {
  if (h === 0) return '12 AM';
  if (h < 12) return `${h} AM`;
  if (h === 12) return '12 PM';
  return `${h - 12} PM`;
}

function ThemeSelector({
  theme,
  resolvedTheme,
  autoSchedule,
  onThemeChange,
  onScheduleChange,
}: {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  autoSchedule: AutoSchedule;
  onThemeChange: (t: ThemeMode) => void;
  onScheduleChange: (p: Partial<AutoSchedule>) => void;
}) {
  const timezones = useMemo(() => {
    try {
      return Intl.supportedValuesOf('timeZone');
    } catch {
      return [autoSchedule.timezone];
    }
  }, [autoSchedule.timezone]);

  return (
    <div className="space-y-4">
      {/* 4 radio cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {THEME_OPTIONS.map(({ mode, label, icon: Icon, swatch, desc }) => {
          const isSelected = theme === mode;
          return (
            <button
              key={mode}
              type="button"
              onClick={() => onThemeChange(mode)}
              className={cn(
                'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center',
                isSelected
                  ? 'border-orange-500 bg-orange-500/8'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              )}
              aria-pressed={isSelected}
            >
              {/* Swatch */}
              {mode === 'auto' ? (
                <div className="w-10 h-10 rounded-full overflow-hidden flex">
                  <div className="w-1/3 bg-[#f9f6f1]" />
                  <div className="w-1/3 bg-[#eef2f7]" />
                  <div className="w-1/3 bg-[#141413]" />
                </div>
              ) : (
                <div
                  className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-600"
                  style={{ background: swatch }}
                />
              )}
              <Icon className={cn('w-5 h-5', isSelected ? 'text-orange-500' : 'text-gray-500 dark:text-gray-400')} />
              <span className={cn('text-sm font-medium', isSelected ? 'text-orange-600 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300')}>
                {label}
              </span>
              <span className="text-[11px] text-gray-400 dark:text-gray-500">{desc}</span>
            </button>
          );
        })}
      </div>

      {/* Auto schedule panel */}
      {theme === 'auto' && (
        <div className="glass rounded-xl p-4 space-y-4 animate-fade-in">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Clock className="w-4 h-4 text-orange-500" />
            Auto Schedule
            <span className="ml-auto text-xs text-gray-400">
              Currently: <span className="capitalize font-semibold text-gray-600 dark:text-gray-300">{resolvedTheme}</span>
            </span>
          </div>

          {/* Timeline bar */}
          <TimelineBar schedule={autoSchedule} />

          {/* Timezone */}
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Timezone</label>
            <select
              value={autoSchedule.timezone}
              onChange={(e) => onScheduleChange({ timezone: e.target.value })}
              className="input text-sm py-2"
            >
              {timezones.map((tz) => (
                <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          {/* Time selectors */}
          <div className="grid grid-cols-2 gap-3">
            <HourSelect
              label="Morning Warm"
              color="text-amber-600"
              value={autoSchedule.morningWarm}
              onChange={(v) => onScheduleChange({ morningWarm: v })}
            />
            <HourSelect
              label="Daytime Cool"
              color="text-blue-600"
              value={autoSchedule.dayCool}
              onChange={(v) => onScheduleChange({ dayCool: v })}
            />
            <HourSelect
              label="Evening Warm"
              color="text-orange-600"
              value={autoSchedule.eveningWarm}
              onChange={(v) => onScheduleChange({ eveningWarm: v })}
            />
            <HourSelect
              label="Night Dark"
              color="text-indigo-600"
              value={autoSchedule.nightDark}
              onChange={(v) => onScheduleChange({ nightDark: v })}
            />
          </div>

          <p className="text-xs text-gray-400 dark:text-gray-500">
            Theme switches automatically based on your local time. Checked every 60 seconds.
          </p>
        </div>
      )}
    </div>
  );
}

function HourSelect({ label, color, value, onChange }: { label: string; color: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className={cn('text-xs font-medium mb-1 block', color)}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="input text-sm py-2"
      >
        {HOURS.map((h) => (
          <option key={h} value={h}>{formatHour(h)}</option>
        ))}
      </select>
    </div>
  );
}

function TimelineBar({ schedule }: { schedule: AutoSchedule }) {
  const { morningWarm, dayCool, eveningWarm, nightDark } = schedule;
  const segments = [
    { start: 0, end: morningWarm, color: 'bg-indigo-900', label: 'Dark' },
    { start: morningWarm, end: dayCool, color: 'bg-amber-400', label: 'Warm' },
    { start: dayCool, end: eveningWarm, color: 'bg-blue-400', label: 'Cool' },
    { start: eveningWarm, end: nightDark, color: 'bg-orange-400', label: 'Warm' },
    { start: nightDark, end: 24, color: 'bg-indigo-900', label: 'Dark' },
  ];

  return (
    <div className="space-y-1">
      <div className="flex h-6 rounded-full overflow-hidden">
        {segments.map((seg, i) => {
          const width = ((seg.end - seg.start) / 24) * 100;
          if (width <= 0) return null;
          return (
            <div
              key={i}
              className={cn(seg.color, 'flex items-center justify-center')}
              style={{ width: `${width}%` }}
            >
              {width > 8 && (
                <span className="text-[9px] font-semibold text-white/80 truncate px-1">{seg.label}</span>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between text-[9px] text-gray-400 px-0.5">
        <span>12AM</span>
        <span>6AM</span>
        <span>12PM</span>
        <span>6PM</span>
        <span>12AM</span>
      </div>
    </div>
  );
}

// Keep default export for backward compatibility (redirects)
export default function ProfileSettingsPage() {
  return <ProfileSettingsContent />;
}
