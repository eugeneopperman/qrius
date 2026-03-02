import { useCallback } from 'react';
import { useSearch, useNavigate } from '@tanstack/react-router';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { MarketingLayout } from '@/components/marketing/MarketingLayout';

export default function SignUpPage() {
  const search = useSearch({ from: '/signup' }) as { redirect?: string };
  const navigate = useNavigate();

  const handleSignUp = useCallback(() => {
    navigate({ to: '/signup' });
  }, [navigate]);

  return (
    <MarketingLayout onSignUp={handleSignUp}>
      <div className="flex items-center justify-center py-16 sm:py-24 px-4">
        <div className="w-full max-w-md">
          <SignUpForm
            onSignIn={() => navigate({ to: '/signin', search: search.redirect ? { redirect: search.redirect } : {} })}
          />
        </div>
      </div>
    </MarketingLayout>
  );
}
