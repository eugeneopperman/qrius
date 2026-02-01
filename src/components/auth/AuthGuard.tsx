import { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function AuthGuard({ children, fallback, redirectTo }: AuthGuardProps) {
  const { user, isLoading, isInitialized } = useAuthStore();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (isInitialized && !user && redirectTo) {
      setShouldRedirect(true);
      // Use window.location for now until router is set up
      window.location.href = redirectTo;
    }
  }, [isInitialized, user, redirectTo]);

  // Show loading state while initializing
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  // User is authenticated, render children
  if (user) {
    return <>{children}</>;
  }

  // User is not authenticated
  if (shouldRedirect) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  // Show fallback if provided
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default: show nothing while waiting
  return null;
}

interface GuestGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function GuestGuard({ children, redirectTo }: GuestGuardProps) {
  const { user, isInitialized } = useAuthStore();

  useEffect(() => {
    if (isInitialized && user && redirectTo) {
      window.location.href = redirectTo;
    }
  }, [isInitialized, user, redirectTo]);

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  // User is authenticated, redirect
  if (user && redirectTo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  // User is not authenticated, render children
  return <>{children}</>;
}
