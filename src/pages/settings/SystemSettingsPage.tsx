import { useMemo } from 'react';
import { useThemeStore } from '@/stores/themeStore';
import type { ThemeMode, ResolvedTheme, AutoSchedule } from '@/stores/themeStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { Sun, CloudSun, Moon, Clock, Save } from 'lucide-react';
import { cn } from '@/utils/cn';

// ============================================================================
// Main Component
// ============================================================================

export function SystemSettingsContent() {
  const { theme, resolvedTheme, autoSchedule, setTheme, setAutoSchedule } = useThemeStore();
  const autosaveEnabled = useSettingsStore((s) => s.autosaveEnabled);
  const setAutosaveEnabled = useSettingsStore((s) => s.setAutosaveEnabled);

  return (
    <div className="max-w-4xl space-y-6">
      {/* Appearance */}
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

      {/* QR Code Autosave */}
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

          <TimelineBar schedule={autoSchedule} />

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

          <div className="grid grid-cols-2 gap-3">
            <HourSelect label="Morning Warm" color="text-amber-600" value={autoSchedule.morningWarm} onChange={(v) => onScheduleChange({ morningWarm: v })} />
            <HourSelect label="Daytime Cool" color="text-blue-600" value={autoSchedule.dayCool} onChange={(v) => onScheduleChange({ dayCool: v })} />
            <HourSelect label="Evening Warm" color="text-orange-600" value={autoSchedule.eveningWarm} onChange={(v) => onScheduleChange({ eveningWarm: v })} />
            <HourSelect label="Night Dark" color="text-indigo-600" value={autoSchedule.nightDark} onChange={(v) => onScheduleChange({ nightDark: v })} />
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

export default function SystemSettingsPage() {
  return <SystemSettingsContent />;
}
