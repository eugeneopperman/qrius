import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/authStore';
import { useShallow } from 'zustand/react/shallow';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { OAuthButtons } from './OAuthButtons';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

interface SignInFormProps {
  onForgotPassword: () => void;
  onSignUp: () => void;
  redirectTo?: string;
}

export function SignInForm({ onForgotPassword, onSignUp, redirectTo }: SignInFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const { signIn, signInWithOAuth, isLoading, hasCompletedOnboarding } = useAuthStore(useShallow((s) => ({ signIn: s.signIn, signInWithOAuth: s.signInWithOAuth, isLoading: s.isLoading, hasCompletedOnboarding: s.hasCompletedOnboarding })));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    const { error } = await signIn(email, password);
    if (error) {
      setError(error.message);
    } else {
      const destination = redirectTo || (hasCompletedOnboarding ? '/dashboard' : '/onboarding');
      navigate({ to: destination });
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setError(null);
    const { error } = await signInWithOAuth(provider);
    if (error) {
      setError(error.message);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Sign in to your Qrius account
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          leftIcon={<Mail className="w-4 h-4" />}
          disabled={isLoading}
          autoComplete="email"
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          leftIcon={<Lock className="w-4 h-4" />}
          disabled={isLoading}
          autoComplete="current-password"
        />

        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-orange-600 hover:text-orange-500 dark:text-orange-400 py-2"
          >
            Forgot password?
          </button>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </Button>
      </form>

      <div className="mt-6">
        <OAuthButtons onOAuthSignIn={handleOAuthSignIn} disabled={isLoading} />
      </div>

      <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onSignUp}
          className="font-medium text-orange-600 hover:text-orange-500 dark:text-orange-400 py-1"
        >
          Sign up
        </button>
      </p>
    </div>
  );
}
