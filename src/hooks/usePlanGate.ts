import { useAuthStore } from '@/stores/authStore';
import { useShallow } from 'zustand/react/shallow';

type GatedFeature = 'svg_download' | 'pdf_download' | 'unlimited_templates';

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
  const isPro = plan === 'pro';
  const isBusiness = plan === 'business';

  const canUse = (feature: GatedFeature): boolean => {
    // Unauthenticated users on public pages are never gated
    if (!isAuthenticated) return true;

    switch (feature) {
      case 'svg_download':
      case 'pdf_download':
        return isPro || isBusiness;
      case 'unlimited_templates':
        return isPro || isBusiness;
      default:
        return true;
    }
  };

  const templateLimit = isFree && isAuthenticated ? 3 : -1;

  return {
    canUse,
    templateLimit,
    plan,
    isFree,
    isPro,
    isBusiness,
    isAuthenticated,
  };
}
