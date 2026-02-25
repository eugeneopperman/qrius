import { useState, useEffect } from 'react';
import { useSearch } from '@tanstack/react-router';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { useShallow } from 'zustand/react/shallow';
import { getSession } from '@/lib/supabase';
import { toast } from '@/stores/toastStore';
import {
  Check,
  CreditCard,
  ExternalLink,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { ComingSoonBadge } from '@/components/ui/ProBadge';

const COMING_SOON_FEATURES = ['CSV analytics export', 'Advanced analytics'];

// Stripe price IDs from environment variables
const STRIPE_PRICES = {
  pro: {
    monthly: import.meta.env.VITE_STRIPE_PRICE_PRO || '',
    annual: import.meta.env.VITE_STRIPE_PRICE_PRO_ANNUAL || '',
  },
  business: {
    monthly: import.meta.env.VITE_STRIPE_PRICE_BUSINESS || '',
    annual: import.meta.env.VITE_STRIPE_PRICE_BUSINESS_ANNUAL || '',
  },
};

const plans = [
  {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      '15 dynamic QR codes',
      'Unlimited static QR codes',
      '5,000 scans/month',
      '30-day scan history',
      '1 team member',
      'All 9 QR types',
      'Full customization',
      '3 brand templates',
      'PNG download',
      'QR code reader',
      'Scannability score',
    ],
    cta: 'Current plan',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 9,
    annualPrice: 7,
    features: [
      '250 dynamic QR codes',
      'Unlimited static QR codes',
      '100,000 scans/month',
      '1-year scan history',
      '5 team members',
      'All 9 QR types',
      'Full customization',
      'Unlimited brand templates',
      'PNG, SVG, PDF download',
      'API access (1,000 req/day)',
      'Advanced analytics',
      'Email support',
    ],
    cta: 'Upgrade to Pro',
    popular: true,
  },
  {
    id: 'business',
    name: 'Business',
    monthlyPrice: 29,
    annualPrice: 24,
    features: [
      'Unlimited dynamic QR codes',
      'Unlimited static QR codes',
      'Unlimited scans',
      'Unlimited scan history',
      '25 team members',
      'All 9 QR types',
      'Full customization',
      'Unlimited brand templates',
      'PNG, SVG, PDF download',
      'API access (10,000 req/day)',
      'Advanced analytics',
      'White-label branding',
      'CSV analytics export',
      'Priority support',
    ],
    cta: 'Upgrade to Business',
    popular: false,
  },
];

export function BillingSettingsContent() {
  const { currentOrganization, fetchOrganizations } = useAuthStore(useShallow((s) => ({ currentOrganization: s.currentOrganization, fetchOrganizations: s.fetchOrganizations })));
  const [isLoading, setIsLoading] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);
  const currentPlan = currentOrganization?.plan || 'free';

  // Handle success/cancel URL params from Stripe redirect
  const search = useSearch({ strict: false }) as { success?: string; canceled?: string };

  useEffect(() => {
    if (search.success === 'true') {
      toast.success('Subscription updated successfully!');
      // Refresh organization data to get new plan
      fetchOrganizations();
    } else if (search.canceled === 'true') {
      toast.info('Checkout canceled');
    }
  }, [search.success, search.canceled, fetchOrganizations]);

  const handleUpgrade = async (planId: string) => {
    if (planId === 'free') return;

    const prices = STRIPE_PRICES[planId as keyof typeof STRIPE_PRICES];
    const priceId = prices ? (isAnnual ? prices.annual : prices.monthly) : '';
    if (!priceId) {
      toast.error(isAnnual
        ? 'Annual billing is not yet available. Please select monthly billing or contact support.'
        : 'Stripe is not configured. Please contact support.');
      return;
    }

    setIsLoading(true);
    try {
      const session = await getSession();
      if (!session?.access_token) {
        toast.error('Please sign in to upgrade');
        return;
      }

      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to start checkout');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setIsLoading(true);
    try {
      const session = await getSession();
      if (!session?.access_token) {
        toast.error('Please sign in to manage billing');
        return;
      }

      const response = await fetch('/api/billing/checkout?action=portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to open billing portal');
      }

      // Redirect to Stripe Customer Portal
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to open billing portal');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Billing</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Manage your subscription and payment settings
        </p>
      </div>

      {/* Current subscription */}
      <div className="glass rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="section-title">
              Current Plan
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {currentOrganization?.name} is on the{' '}
              <span className="font-medium text-orange-600 dark:text-orange-400 capitalize">
                {currentPlan}
              </span>{' '}
              plan
            </p>
          </div>
          {currentPlan !== 'free' && (
            <Button variant="secondary" onClick={handleManageBilling}>
              <CreditCard className="w-4 h-4" />
              Manage billing
              <ExternalLink className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <span className={`text-sm font-medium ${!isAnnual ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
          Monthly
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={isAnnual}
          onClick={() => setIsAnnual(!isAnnual)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isAnnual ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
              isAnnual ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <span className={`text-sm font-medium ${isAnnual ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
          Annual
        </span>
        {isAnnual && (
          <span className="ml-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
            Save 22%
          </span>
        )}
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlan;
          const displayPrice = isAnnual ? plan.annualPrice : plan.monthlyPrice;

          return (
            <div
              key={plan.id}
              className={`relative glass rounded-2xl border-2 p-6 ${
                plan.popular
                  ? 'border-orange-500'
                  : isCurrent
                  ? 'border-green-500'
                  : 'border-divider'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 bg-orange-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {plan.name}
                </h3>
                <div className="mt-2">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    ${displayPrice}
                  </span>
                  {displayPrice > 0 && (
                    <span className="text-gray-500 dark:text-gray-400">/month</span>
                  )}
                </div>
                {isAnnual && plan.monthlyPrice > 0 && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    ${plan.annualPrice * 12}/year (billed annually)
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400">{feature}</span>
                    {COMING_SOON_FEATURES.includes(feature) && <ComingSoonBadge />}
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={isCurrent ? 'secondary' : plan.popular ? 'primary' : 'secondary'}
                disabled={isCurrent || isLoading}
                onClick={() => handleUpgrade(plan.id)}
              >
                {isCurrent ? (
                  <>
                    <Check className="w-4 h-4" />
                    Current plan
                  </>
                ) : isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  plan.cta
                )}
              </Button>
            </div>
          );
        })}
      </div>

      {/* FAQ */}
      <div className="mt-12 glass rounded-2xl p-6">
        <h2 className="section-title mb-4">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              Can I change plans anytime?
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Yes, you can upgrade or downgrade your plan at any time. Changes take effect
              immediately, and we'll prorate any payments.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              What happens if I exceed my limits?
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              We'll notify you when you're approaching your limits. If you exceed them, your QR
              codes will continue to work, but you won't be able to create new ones until you
              upgrade.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              Do you offer refunds?
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Yes, we offer a 14-day money-back guarantee. If you're not satisfied, contact
              support for a full refund.
            </p>
          </div>
        </div>
      </div>

      {/* Support */}
      <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        Need help? Contact us at{' '}
        <a
          href="mailto:support@qrius.app"
          className="text-orange-600 dark:text-orange-400 hover:underline"
        >
          support@qrius.app
        </a>
      </div>
    </div>
  );
}

export default function BillingSettingsPage() {
  return <BillingSettingsContent />;
}
