import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useShallow } from 'zustand/react/shallow';
import {
  User,
  Settings,
  LogOut,
  Building2,
  ChevronDown,
  CreditCard,
  Key,
  Users,
  Loader2,
} from 'lucide-react';

interface UserButtonProps {
  onSettingsClick?: () => void;
  /** Position the dropdown above and to the right (for sidebar bottom placement) */
  dropUp?: boolean;
}

export function UserButton({ onSettingsClick, dropUp }: UserButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    user,
    profile,
    currentOrganization,
    organizations,
    signOut,
    setCurrentOrganization,
    isLoading,
  } = useAuthStore(useShallow((s) => ({
    user: s.user,
    profile: s.profile,
    currentOrganization: s.currentOrganization,
    organizations: s.organizations,
    signOut: s.signOut,
    setCurrentOrganization: s.setCurrentOrganization,
    isLoading: s.isLoading,
  })));

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  if (!user) return null;

  const displayName = profile?.display_name || profile?.name || user.email?.split('@')[0] || 'User';
  const avatarUrl = profile?.avatar_url;
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
  };

  const handleOrgSwitch = async (orgId: string) => {
    await setCurrentOrganization(orgId);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Avatar */}
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
              {initials}
            </span>
          </div>
        )}

        {/* User nickname */}
        <div className="hidden sm:flex items-center gap-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[140px] truncate">
            {displayName}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </div>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className={`absolute w-72 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50 ${
          dropUp ? 'bottom-full left-0 mb-2' : 'right-0 mt-2'
        }`}>
          {/* User info */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <span className="text-base font-medium text-orange-600 dark:text-orange-400">
                    {initials}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {displayName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          {/* Organization switcher */}
          {organizations.length > 0 && (
            <div className="px-2 py-2 border-b border-gray-200 dark:border-gray-700">
              <p className="px-2 py-1 text-xs font-medium text-gray-400 uppercase tracking-wide">
                Workspaces
              </p>
              <div className="max-h-40 overflow-y-auto">
                {organizations.map((membership) => (
                  <button
                    key={membership.organization.id}
                    onClick={() => handleOrgSwitch(membership.organization.id)}
                    className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg text-left transition-colors ${
                      currentOrganization?.id === membership.organization.id
                        ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
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
              </div>
            </div>
          )}

          {/* Menu items */}
          <div className="py-2">
            <a
              href="/settings/profile"
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <User className="w-4 h-4" />
              Profile
            </a>
            <a
              href="/settings/team"
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Users className="w-4 h-4" />
              Team
            </a>
            <a
              href="/settings/billing"
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              Billing
            </a>
            <a
              href="/settings/api-keys"
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Key className="w-4 h-4" />
              API Keys
            </a>
            {onSettingsClick && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onSettingsClick();
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
            )}
          </div>

          {/* Sign out */}
          <div className="border-t border-gray-200 dark:border-gray-700 py-2">
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isLoading}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
