import { Link } from '@tanstack/react-router';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { User, Users, CreditCard, Key } from 'lucide-react';

const settingsNavigation = [
  {
    name: 'Profile',
    href: '/settings/profile',
    icon: User,
    description: 'Your personal information and preferences',
  },
  {
    name: 'Team',
    href: '/settings/team',
    icon: Users,
    description: 'Manage team members and invitations',
  },
  {
    name: 'Billing',
    href: '/settings/billing',
    icon: CreditCard,
    description: 'Subscription and payment settings',
  },
  {
    name: 'API Keys',
    href: '/settings/api-keys',
    icon: Key,
    description: 'Manage API access and keys',
  },
];

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your account and organization settings
          </p>
        </div>

        <div className="grid gap-4">
          {settingsNavigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-orange-300 dark:hover:border-orange-700 transition-colors"
            >
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <item.icon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">{item.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
