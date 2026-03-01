import { useState, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Header } from '@/components/Header';
import { LandingTypeGrid } from '@/components/landing/LandingTypeGrid';
import { AuthModal } from '@/components/auth/AuthModal';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { useUIStore } from '@/stores/uiStore';
import { useQRStore } from '@/stores/qrStore';
import { useWizardStore } from '@/stores/wizardStore';
import { isRootDomain, getAppUrl } from '@/lib/domain';
import type { QRCodeType } from '@/types';

const PENDING_TYPE_KEY = 'pendingQRType';

export default function HomePage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { openShortcuts, openSettings } = useUIStore();
  const navigate = useNavigate();

  const handleTypeSelect = useCallback((typeId: QRCodeType) => {
    sessionStorage.setItem(PENDING_TYPE_KEY, typeId);
    setShowAuthModal(true);
  }, []);

  const handleAuthSuccess = useCallback(() => {
    const pendingType = sessionStorage.getItem(PENDING_TYPE_KEY) as QRCodeType | null;
    setShowAuthModal(false);

    // Cross-subdomain: pass pendingType as URL param since sessionStorage is origin-scoped
    if (isRootDomain) {
      const path = pendingType ? `/create?pendingType=${pendingType}` : '/create';
      sessionStorage.removeItem(PENDING_TYPE_KEY);
      window.location.href = getAppUrl(path);
      return;
    }

    if (pendingType) {
      sessionStorage.removeItem(PENDING_TYPE_KEY);
      useQRStore.getState().setActiveType(pendingType);
      useWizardStore.getState().markCompleted(1);
      useWizardStore.getState().goToStep(2);
    }
    navigate({ to: '/create' });
  }, [navigate]);

  return (
    <div className="min-h-screen transition-colors">
      <Header
        onSettingsClick={openSettings}
        onShortcutsClick={openShortcuts}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <LandingTypeGrid onSelect={handleTypeSelect} />
      </main>

      <PublicFooter />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
