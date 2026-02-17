import { useCallback, useMemo } from 'react';
import { useSearch, useNavigate } from '@tanstack/react-router';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '../components/ui/Tabs';
import { User, Users, CreditCard, Key, Loader2 } from 'lucide-react';
import { lazy, Suspense } from 'react';

// Lazy load settings content components
const ProfileSettingsContent = lazy(() => import('./settings/ProfileSettingsPage').then(m => ({ default: m.ProfileSettingsContent })));
const TeamSettingsContent = lazy(() => import('./settings/TeamSettingsPage').then(m => ({ default: m.TeamSettingsContent })));
const BillingSettingsContent = lazy(() => import('./settings/BillingSettingsPage').then(m => ({ default: m.BillingSettingsContent })));
const ApiKeysSettingsContent = lazy(() => import('./settings/ApiKeysSettingsPage').then(m => ({ default: m.ApiKeysSettingsContent })));

function SettingsLoading() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
    </div>
  );
}

const TAB_KEYS = ['profile', 'team', 'billing', 'api-keys'] as const;
type SettingsTab = (typeof TAB_KEYS)[number];

function getTabIndex(tab: string | undefined): number {
  const idx = TAB_KEYS.indexOf(tab as SettingsTab);
  return idx >= 0 ? idx : 0;
}

export default function SettingsPage() {
  const search = useSearch({ strict: false }) as { tab?: string };
  const navigate = useNavigate();
  const activeTab = useMemo(() => getTabIndex(search.tab), [search.tab]);

  const handleTabChange = useCallback((index: number) => {
    navigate({
      to: '/settings',
      search: { tab: TAB_KEYS[index] },
      replace: true,
    });
  }, [navigate]);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto animate-slide-up-page">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your account and organization settings
          </p>
        </div>

        <TabGroup key={activeTab} defaultTab={activeTab} onChange={handleTabChange}>
          <TabList className="mb-6 border-b border-gray-200 dark:border-gray-800 pb-0">
            <Tab icon={User}>Profile</Tab>
            <Tab icon={Users}>Team</Tab>
            <Tab icon={CreditCard}>Billing</Tab>
            <Tab icon={Key}>API Keys</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <Suspense fallback={<SettingsLoading />}>
                <ProfileSettingsContent />
              </Suspense>
            </TabPanel>
            <TabPanel>
              <Suspense fallback={<SettingsLoading />}>
                <TeamSettingsContent />
              </Suspense>
            </TabPanel>
            <TabPanel>
              <Suspense fallback={<SettingsLoading />}>
                <BillingSettingsContent />
              </Suspense>
            </TabPanel>
            <TabPanel>
              <Suspense fallback={<SettingsLoading />}>
                <ApiKeysSettingsContent />
              </Suspense>
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    </DashboardLayout>
  );
}
