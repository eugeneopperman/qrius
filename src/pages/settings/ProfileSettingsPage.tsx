import { useRef, useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/stores/authStore';
import { useShallow } from 'zustand/react/shallow';
import { useThemeStore } from '@/stores/themeStore';
import type { ThemeMode, ResolvedTheme, AutoSchedule } from '@/stores/themeStore';
import { toast } from '@/stores/toastStore';
import { supabase } from '@/lib/supabase';
import { Camera, Loader2, Trash2, Sun, CloudSun, Moon, Clock, Save } from 'lucide-react';
import { useSettingsStore } from '@/stores/settingsStore';
import { cn } from '@/utils/cn';

const AVATAR_MAX_SIZE = 2 * 1024 * 1024; // 2MB
const AVATAR_ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export function ProfileSettingsContent() {
  const { user, profile, updateProfile } = useAuthStore(useShallow((s) => ({ user: s.user, profile: s.profile, updateProfile: s.updateProfile })));
  const { theme, resolvedTheme, autoSchedule, setTheme, setAutoSchedule } = useThemeStore();
  const autosaveEnabled = useSettingsStore((s) => s.autosaveEnabled);
  const setAutosaveEnabled = useSettingsStore((s) => s.setAutosaveEnabled);
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

        {/* Personal information */}
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

      {/* Appearance */}
      <div className="mt-6 glass rounded-2xl p-6">
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

      {/* QR Code Autosave */}
      <div className="mt-6 glass rounded-2xl p-6">
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

      {/* Danger zone */}
      <div className="mt-8 glass rounded-2xl border-red-200/50 dark:border-red-900/30 p-6">
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

// ---- Theme Selector Component ----

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
  // Build 4 segments as percentages of 24 hours
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
