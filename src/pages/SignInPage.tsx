import { useState, useEffect, useCallback } from 'react';
import { useSearch, useNavigate } from '@tanstack/react-router';
import { SignInForm } from '@/components/auth/SignInForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { MarketingLayout } from '@/components/marketing/MarketingLayout';
import { toast } from '@/stores/toastStore';
import { isRootDomain, getAppUrl } from '@/lib/domain';

type View = 'signin' | 'forgot-password';

export default function SignInPage() {
  const [view, setView] = useState<View>('signin');
  const search = useSearch({ from: '/signin' }) as { redirect?: string; signedOut?: string };
  const navigate = useNavigate();

  // Show success toast after sign-out redirect
  useEffect(() => {
    if (search.signedOut) {
      toast.success('You have been successfully logged out.');
      window.history.replaceState({}, '', '/signin');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSignUp = useCallback(() => {
    navigate({ to: '/signup' });
  }, [navigate]);

  const handleAuthSuccess = useCallback(() => {
    const redirect = search.redirect;
    if (redirect) {
      if (isRootDomain) {
        window.location.href = getAppUrl(redirect);
      } else {
        navigate({ to: redirect });
      }
      return;
    }
    if (isRootDomain) {
      window.location.href = getAppUrl('/dashboard');
      return;
    }
    navigate({ to: '/dashboard' });
  }, [navigate, search.redirect]);

  return (
    <MarketingLayout onSignUp={handleSignUp}>
      <div className="flex items-center justify-center py-16 sm:py-24 px-4">
        <div className="w-full max-w-md">
          {view === 'signin' && (
            <SignInForm
              onForgotPassword={() => setView('forgot-password')}
              onSignUp={handleSignUp}
              onSuccess={handleAuthSuccess}
              redirectTo={search.redirect}
            />
          )}
          {view === 'forgot-password' && (
            <ForgotPasswordForm onBack={() => setView('signin')} />
          )}
        </div>
      </div>
    </MarketingLayout>
  );
}
