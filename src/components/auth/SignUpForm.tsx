import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useShallow } from 'zustand/react/shallow';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { OAuthButtons } from './OAuthButtons';
import { Link } from '@tanstack/react-router';
import { Mail, Lock, User, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface SignUpFormProps {
  onSignIn: () => void;
  onSuccess?: () => void;
}

export function SignUpForm({ onSignIn }: SignUpFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { signUp, signInWithOAuth, isLoading } = useAuthStore(useShallow((s) => ({ signUp: s.signUp, signInWithOAuth: s.signInWithOAuth, isLoading: s.isLoading })));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const { error } = await signUp(email, password, name || undefined);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setError(null);
    const { error } = await signInWithOAuth(provider);
    if (error) {
      setError(error.message);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Check your email
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We've sent a confirmation link to <strong>{email}</strong>.
          Please check your inbox and click the link to verify your account.
        </p>
        <Button variant="secondary" onClick={onSignIn}>
          Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Start creating trackable QR codes today
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
          label="Name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
          leftIcon={<User className="w-4 h-4" />}
          disabled={isLoading}
          autoComplete="name"
          hint="Optional"
        />

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          leftIcon={<Mail className="w-4 h-4" />}
          disabled={isLoading}
          autoComplete="email"
          required
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          leftIcon={<Lock className="w-4 h-4" />}
          disabled={isLoading}
          autoComplete="new-password"
          required
          hint="At least 8 characters"
        />

        <Input
          label="Confirm password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          leftIcon={<Lock className="w-4 h-4" />}
          disabled={isLoading}
          autoComplete="new-password"
          required
        />

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </Button>
      </form>

      <div className="mt-6">
        <OAuthButtons onOAuthSignIn={handleOAuthSignIn} disabled={isLoading} />
      </div>

      <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSignIn}
          className="font-medium text-orange-600 hover:text-orange-500 dark:text-orange-400"
        >
          Sign in
        </button>
      </p>

      <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
        By creating an account, you agree to our{' '}
        <Link to="/terms" className="underline hover:text-gray-700 dark:hover:text-gray-300">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link to="/privacy" className="underline hover:text-gray-700 dark:hover:text-gray-300">
          Privacy Policy
        </Link>
      </p>
    </div>
  );
}
