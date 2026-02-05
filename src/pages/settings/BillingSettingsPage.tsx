import { useState, useEffect } from 'react';
import { Link, useSearch } from '@tanstack/react-router';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../stores/authStore';
import { getSession } from '../../lib/supabase';
import { toast } from '../../stores/toastStore';
import {
  ArrowLeft,
  Check,
  CreditCard,
  ExternalLink,
  Loader2,
  Sparkles,
} from 'lucide-react';

// Stripe price IDs from environment variables
const STRIPE_PRICES = {
  pro: import.meta.env.VITE_STRIPE_PRICE_PRO || '',
  business: import.meta.env.VITE_STRIPE_PRICE_BUSINESS || '',
};

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'forever',
    features: [
      '10 QR codes',
      '1,000 scans/month',
      '30-day scan history',
      '1 team member',
      'Basic customization',
    ],
    cta: 'Current plan',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 12,
    interval: 'month',
    features: [
      '100 QR codes',
      '50,000 scans/month',
      '1-year scan history',
      '5 team members',
      'Full customization',
      '1,000 API requests/day',
      'Email support',
    ],
    cta: 'Upgrade to Pro',
    popular: true,
  },
  {
    id: 'business',
    name: 'Business',
    price: 39,
    interval: 'month',
    features: [
      'Unlimited QR codes',
      '500,000 scans/month',
      '2-year scan history',
      '25 team members',
      'White-label branding',
      '10,000 API requests/day',
      'Priority support',
      'Custom integrations',
    ],
    cta: 'Upgrade to Business',
    popular: false,
  },
];

export default function BillingSettingsPage() {
  const { currentOrganization, fetchOrganizations } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
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

    const priceId = STRIPE_PRICES[planId as keyof typeof STRIPE_PRICES];
    if (!priceId) {
      toast.error('Stripe is not configured. Please contact support.');
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
      console.error('Checkout error:', error);
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

      const response = await fetch('/api/billing/portal', {
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
      console.error('Portal error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to open billing portal');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/settings"
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Settings
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Billing</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage your subscription and payment settings
          </p>
        </div>

        {/* Current subscription */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
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

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrent = plan.id === currentPlan;

            return (
              <div
                key={plan.id}
                className={`relative bg-white dark:bg-gray-900 rounded-xl border-2 p-6 ${
                  plan.popular
                    ? 'border-orange-500'
                    : isCurrent
                    ? 'border-green-500'
                    : 'border-gray-200 dark:border-gray-800'
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
                      ${plan.price}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-500 dark:text-gray-400">/{plan.interval}</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-400">{feature}</span>
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
        <div className="mt-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
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
      </div>
    </DashboardLayout>
  );
}
