import { Sparkles, Building2 } from 'lucide-react';
import { Input } from '../ui/Input';

interface OnboardingWelcomeProps {
  orgName: string;
  setOrgName: (v: string) => void;
}

export function OnboardingWelcome({ orgName, setOrgName }: OnboardingWelcomeProps) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center">
        <Sparkles className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Welcome to Qrius!
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Let's set up your workspace in a few quick steps.
      </p>
      <div className="text-left">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <Building2 className="w-4 h-4 inline mr-2" />
          Workspace name
        </label>
        <Input
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          placeholder="e.g., My Company, Marketing Team"
          className="text-center"
        />
        <p className="mt-2 text-xs text-gray-400 dark:text-gray-500 text-center">
          You can change this later in Settings
        </p>
      </div>
    </div>
  );
}
