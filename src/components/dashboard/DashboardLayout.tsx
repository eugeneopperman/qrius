import { Link, useLocation } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/authStore';
import { useShallow } from 'zustand/react/shallow';
import { useThemeStore } from '@/stores/themeStore';
import { UserButton } from '../auth/UserButton';
import {
  QrCode,
  LayoutDashboard,
  Plus,
  Settings,
  Clock,
  ScanLine,
  Palette,
  Sun,
  Moon,
  Menu,
  X,
  Building2,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/Button';
import { Dropdown } from '../ui/Dropdown';
import { Logo } from '../ui/Logo';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'QR Codes', href: '/qr-codes', icon: QrCode },
  { name: 'Create', href: '/create', icon: Plus },
  { name: 'History', href: '/history', icon: Clock },
  { name: 'Templates', href: '/templates', icon: Palette },
  { name: 'Reader', href: '/reader', icon: ScanLine },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useThemeStore();
  const { currentOrganization, organizations, setCurrentOrganization } = useAuthStore(useShallow((s) => ({ currentOrganization: s.currentOrganization, organizations: s.organizations, setCurrentOrganization: s.setCurrentOrganization })));

  return (
    <div className="min-h-screen bg-transparent">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 glass-medium transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ borderRadius: 0, borderRight: 'none' }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-white/10 dark:border-white/5">
            <Link to="/dashboard">
              <Logo size="sm" />
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Organization Switcher */}
          <div className="px-3 py-4 border-b border-white/10 dark:border-white/5">
            <Dropdown
              trigger={({ toggle }) => (
                <button
                  onClick={toggle}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-orange-500/12 dark:bg-orange-400/10 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {currentOrganization?.name || 'Select workspace'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {currentOrganization?.plan || 'Free'} plan
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
              )}
              children={({ close }) => (
                <>
                  {organizations.map((membership) => (
                    <button
                      key={membership.organization.id}
                      onClick={async () => {
                        await setCurrentOrganization(membership.organization.id);
                        close();
                      }}
                      className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${
                        currentOrganization?.id === membership.organization.id
                          ? 'bg-orange-500/10 dark:bg-orange-400/10'
                          : 'hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {membership.organization.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {membership.role}
                        </p>
                      </div>
                      {currentOrganization?.id === membership.organization.id && (
                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                      )}
                    </button>
                  ))}
                </>
              )}
            />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-orange-500/10 dark:bg-orange-400/10 text-orange-600 dark:text-orange-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Create QR CTA */}
          <div className="p-4 border-t border-white/10 dark:border-white/5">
            <Link to="/create">
              <Button className="w-full">
                <Plus className="w-4 h-4" />
                Create QR Code
              </Button>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-30 h-16 glass-medium" style={{ borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none' }}>
          <div className="flex items-center justify-between h-full px-4 lg:px-6">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
            >
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>

            <div className="flex-1" />

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>

              <UserButton />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
