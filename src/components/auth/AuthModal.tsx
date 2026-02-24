import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { useFocusTrap } from '@/hooks/useFocusTrap';

type AuthView = 'signin' | 'signup' | 'forgot-password';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultView?: AuthView;
}

export function AuthModal({ isOpen, onClose, defaultView = 'signin' }: AuthModalProps) {
  const [view, setView] = useState<AuthView>(defaultView);
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(isOpen, modalRef);

  // Reset view when modal opens
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional prop sync
      setView(defaultView);
    }
  }, [isOpen, defaultView]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="relative z-10 w-full max-w-md mx-4 glass-heavy rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-8">
          {view === 'signin' && (
            <SignInForm
              onForgotPassword={() => setView('forgot-password')}
              onSignUp={() => setView('signup')}
            />
          )}

          {view === 'signup' && (
            <SignUpForm onSignIn={() => setView('signin')} />
          )}

          {view === 'forgot-password' && (
            <ForgotPasswordForm onBack={() => setView('signin')} />
          )}
        </div>
      </div>
    </div>
  );
}
