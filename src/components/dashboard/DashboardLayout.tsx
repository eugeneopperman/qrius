import { Link, useLocation } from '@tanstack/react-router';
import { UserButton } from '../auth/UserButton';
import {
  QrCode,
  LayoutDashboard,
  Plus,
  Settings,

  ScanLine,
  Palette,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/Button';
import { Logo } from '../ui/Logo';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, animClass: 'icon-anim-pulse' },
  { name: 'QR Codes', href: '/qr-codes', icon: QrCode, animClass: 'icon-anim-scan-tilt' },
  { name: 'Create', href: '/create', icon: Plus, animClass: 'icon-anim-rotate-quarter' },
  { name: 'Templates', href: '/templates', icon: Palette, animClass: 'icon-anim-brush-tilt' },
  { name: 'Reader', href: '/reader', icon: ScanLine, animClass: 'icon-anim-scan-pulse' },
  { name: 'Settings', href: '/settings', icon: Settings, animClass: 'icon-anim-gear-turn' },
];

const mobileNavItems = [
  { name: 'Home', href: '/dashboard' as const, icon: LayoutDashboard },
  { name: 'QR Codes', href: '/qr-codes' as const, icon: QrCode },
  { name: 'Create', href: '/create' as const, icon: Plus },
  { name: 'Templates', href: '/templates' as const, icon: Palette },
  { name: 'Settings', href: '/settings' as const, icon: Settings },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

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
        className={`fixed inset-y-0 left-0 z-50 w-64 lg:bg-transparent bg-[var(--color-bg)]/95 lg:backdrop-blur-0 backdrop-blur-sm transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-black/[0.04] dark:border-white/[0.04]">
            <Link to="/dashboard">
              <Logo size="sm" />
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden btn-icon"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-[15px] transition-colors ${
                    isActive
                      ? 'bg-orange-500/10 dark:bg-orange-400/10 text-orange-600 dark:text-orange-400 font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 font-normal'
                  }`}
                >
                  <item.icon className={`w-[18px] h-[18px] ${item.animClass}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Create QR CTA */}
          <div className="p-4 border-t border-black/[0.04] dark:border-white/[0.04]">
            <Link to="/create">
              <Button className="w-full">
                <Plus className="w-4 h-4" />
                Create QR Code
              </Button>
            </Link>
          </div>

          {/* User avatar */}
          <div className="px-3 pb-4">
            <UserButton dropUp />
          </div>
        </div>
      </aside>

      {/* Main content — flex column app shell on mobile, normal flow on desktop */}
      <div className="lg:pl-64 max-lg:flex max-lg:flex-col max-lg:h-[100dvh] max-lg:overflow-hidden">
        {/* Mobile header — flex child, never scrolls */}
        <div className="lg:hidden flex-shrink-0 z-30 p-3 flex items-center justify-between bg-[var(--color-bg)] border-b border-black/[0.04] dark:border-white/[0.04]">
          <button
            onClick={() => setSidebarOpen(true)}
            className="btn-icon"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <Link to="/dashboard"><Logo size="sm" /></Link>
        </div>

        {/* Page content — scrollable area on mobile */}
        <main className="max-lg:flex-1 max-lg:min-h-0 max-lg:overflow-y-auto p-4 lg:p-6">
          <div className="glass-panel rounded-3xl p-2 sm:p-6 lg:p-8 min-h-[calc(100vh-5rem)]">
            {children}
          </div>
        </main>

        {/* Mobile bottom navigation — flex child, never scrolls */}
        <nav
          className="lg:hidden flex-shrink-0 z-40 bg-[var(--color-bg)] border-t border-black/[0.04] dark:border-white/[0.04]"
          aria-label="Mobile navigation"
        >
          <div className="flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
            {mobileNavItems.map((item) => {
              const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
              const isCreate = item.name === 'Create';

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex flex-col items-center gap-0.5 py-2 px-3 min-w-[48px] min-h-[48px] justify-center ${
                    isCreate
                      ? ''
                      : isActive
                      ? 'text-orange-600 dark:text-orange-400'
                      : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {isCreate ? (
                    <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30 -mt-3">
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                  ) : (
                    <item.icon className="w-5 h-5" />
                  )}
                  <span className={`text-[10px] font-medium ${isCreate ? 'text-orange-600 dark:text-orange-400' : ''}`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
