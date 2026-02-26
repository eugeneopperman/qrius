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

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile menu button */}
        <div className="lg:hidden sticky top-0 z-30 p-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="btn-icon"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <Link to="/dashboard"><Logo size="sm" /></Link>
        </div>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          <div className="glass-panel rounded-3xl p-3 sm:p-6 lg:p-8 min-h-[calc(100vh-5rem)]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
