import { useEmailPreferences, type EmailPreferences } from '@/hooks/queries/useEmailPreferences';
import { Loader2, Mail, BarChart3, FileText, TrendingUp, AlertTriangle, Shield, BellOff } from 'lucide-react';

interface ToggleRowProps {
  icon: React.ElementType;
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

function ToggleRow({ icon: Icon, label, description, checked, onChange, disabled }: ToggleRowProps) {
  return (
    <div className="flex items-start gap-4 py-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div className="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-orange-500" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">{label}</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:after:border-gray-600 peer-checked:bg-orange-500 peer-disabled:opacity-50" />
      </label>
    </div>
  );
}

const PREFERENCE_CONFIG: Array<{
  key: keyof EmailPreferences;
  icon: React.ElementType;
  label: string;
  description: string;
  category: 'engagement' | 'system';
}> = [
  {
    key: 'weekly_digest',
    icon: FileText,
    label: 'Weekly digest',
    description: 'Weekly summary of your QR code scan performance every Monday',
    category: 'engagement',
  },
  {
    key: 'monthly_digest',
    icon: BarChart3,
    label: 'Monthly digest',
    description: 'Monthly recap with top performers and trend analysis',
    category: 'engagement',
  },
  {
    key: 'scan_milestones',
    icon: TrendingUp,
    label: 'Scan milestones',
    description: 'Celebrate when your QR codes hit 10, 50, 100, 500, 1K, 5K, or 10K scans',
    category: 'engagement',
  },
  {
    key: 'product_updates',
    icon: Mail,
    label: 'Product updates',
    description: 'New features, tips, and announcements',
    category: 'engagement',
  },
  {
    key: 'upgrade_prompts',
    icon: TrendingUp,
    label: 'Upgrade suggestions',
    description: 'Get notified when you might benefit from a plan upgrade',
    category: 'engagement',
  },
  {
    key: 'usage_warnings',
    icon: AlertTriangle,
    label: 'Usage warnings',
    description: 'Alerts when you approach 80% or 95% of your plan limits',
    category: 'system',
  },
  {
    key: 'security_alerts',
    icon: Shield,
    label: 'Security alerts',
    description: 'Notifications about API key creation and account security',
    category: 'system',
  },
];

export function NotificationsSettingsContent() {
  const { preferences, isLoading, updatePreference, isUpdating } = useEmailPreferences();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
      </div>
    );
  }

  const engagementPrefs = PREFERENCE_CONFIG.filter((p) => p.category === 'engagement');
  const systemPrefs = PREFERENCE_CONFIG.filter((p) => p.category === 'system');

  return (
    <div className="space-y-6">
      {/* Unsubscribe All */}
      <div className="card p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
            <BellOff className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Unsubscribe from all</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Stop all optional emails. You'll still receive transactional emails (payment receipts, team invites).
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
            <input
              type="checkbox"
              checked={preferences.unsubscribed_all}
              onChange={(e) => updatePreference('unsubscribed_all', e.target.checked)}
              disabled={isUpdating}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-red-300 dark:peer-focus:ring-red-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:after:border-gray-600 peer-checked:bg-red-500 peer-disabled:opacity-50" />
          </label>
        </div>
      </div>

      {/* Engagement Emails */}
      <div className="card p-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Engagement emails</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Digests, milestones, and product news</p>
        <div className={preferences.unsubscribed_all ? 'opacity-50 pointer-events-none' : ''}>
          {engagementPrefs.map((pref) => (
            <ToggleRow
              key={pref.key}
              icon={pref.icon}
              label={pref.label}
              description={pref.description}
              checked={preferences[pref.key] as boolean}
              onChange={(value) => updatePreference(pref.key, value)}
              disabled={isUpdating || preferences.unsubscribed_all}
            />
          ))}
        </div>
      </div>

      {/* System Emails */}
      <div className="card p-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">System emails</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Usage alerts and security notifications</p>
        <div className={preferences.unsubscribed_all ? 'opacity-50 pointer-events-none' : ''}>
          {systemPrefs.map((pref) => (
            <ToggleRow
              key={pref.key}
              icon={pref.icon}
              label={pref.label}
              description={pref.description}
              checked={preferences[pref.key] as boolean}
              onChange={(value) => updatePreference(pref.key, value)}
              disabled={isUpdating || preferences.unsubscribed_all}
            />
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500">
        Transactional emails (payment receipts, team invites, password resets) cannot be disabled.
      </p>
    </div>
  );
}

export default function NotificationsSettingsPage() {
  return <NotificationsSettingsContent />;
}
