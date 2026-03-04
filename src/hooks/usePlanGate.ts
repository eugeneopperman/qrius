import { useAuthStore } from '@/stores/authStore';
import { useShallow } from 'zustand/react/shallow';

type GatedFeature = 'svg_download' | 'pdf_download' | 'unlimited_templates' | 'white_label';

export function usePlanGate() {
  const { user, currentOrganization } = useAuthStore(
    useShallow((s) => ({
      user: s.user,
      currentOrganization: s.currentOrganization,
    }))
  );

  const isAuthenticated = !!user;
  const plan = currentOrganization?.plan ?? 'free';
  const isFree = !isAuthenticated || plan === 'free';
  const isStarter = plan === 'starter';
  const isPro = plan === 'pro';
  const isBusiness = plan === 'business';

  const canUse = (feature: GatedFeature): boolean => {
    // Unauthenticated users on public pages are never gated
    if (!isAuthenticated) return true;

    switch (feature) {
      case 'svg_download':
        return isStarter || isPro || isBusiness;
      case 'pdf_download':
        return isPro || isBusiness;
      case 'unlimited_templates':
        return isPro || isBusiness;
      case 'white_label':
        return isBusiness;
      default:
        return true;
    }
  };

  // Free: 1 template, Starter: 5, Pro/Business: unlimited
  const templateLimit = !isAuthenticated ? -1 : isFree ? 1 : isStarter ? 5 : -1;

  return {
    canUse,
    templateLimit,
    plan,
    isFree,
    isStarter,
    isPro,
    isBusiness,
    isAuthenticated,
  };
}
