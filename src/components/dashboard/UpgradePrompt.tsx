import { Link } from '@tanstack/react-router';
import { Sparkles, ArrowRight, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/Button';

interface UpgradePromptProps {
  title?: string;
  description?: string;
  feature?: string;
  dismissable?: boolean;
}

export function UpgradePrompt({
  title = 'Upgrade to Pro',
  description = 'Get 250 QR codes, advanced analytics, and team collaboration — starting at $9/mo.',
  feature,
  dismissable = true,
}: UpgradePromptProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl p-4 sm:p-6 text-white overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Dismiss button */}
      {dismissable && (
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-4 right-4 p-1 rounded hover:bg-white/20 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold">{title}</h3>
            <p className="text-orange-100 mt-1">
              {feature ? `Unlock ${feature} and more with Pro.` : description}
            </p>
          </div>
        </div>

        <Link to="/settings/billing">
          <Button
            variant="secondary"
            className="bg-white text-orange-600 hover:bg-orange-50 border-0 whitespace-nowrap"
          >
            Upgrade Now
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

interface UsageLimitWarningProps {
  current: number;
  limit: number;
  type: 'qr_codes' | 'scans' | 'team_members';
}

export function UsageLimitWarning({ current, limit, type }: UsageLimitWarningProps) {
  const percentage = Math.round((current / limit) * 100);
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  const typeLabels = {
    qr_codes: 'QR codes',
    scans: 'scans this month',
    team_members: 'team members',
  };

  if (!isNearLimit) return null;

  return (
    <div
      className={`rounded-lg p-4 ${
        isAtLimit
          ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p
            className={`font-medium ${
              isAtLimit
                ? 'text-red-800 dark:text-red-200'
                : 'text-yellow-800 dark:text-yellow-200'
            }`}
          >
            {isAtLimit ? 'Limit reached' : 'Approaching limit'}
          </p>
          <p
            className={`text-sm ${
              isAtLimit
                ? 'text-red-600 dark:text-red-400'
                : 'text-yellow-600 dark:text-yellow-400'
            }`}
          >
            {current} / {limit} {typeLabels[type]} used ({percentage}%)
          </p>
        </div>

        <Link to="/settings/billing">
          <Button size="sm" variant={isAtLimit ? 'primary' : 'secondary'}>
            Upgrade
          </Button>
        </Link>
      </div>

      {/* Progress bar */}
      <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all ${
            isAtLimit ? 'bg-red-500' : 'bg-yellow-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}
