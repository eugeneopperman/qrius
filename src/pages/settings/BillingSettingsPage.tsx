import { useState, useEffect, useRef } from 'react';
import { useSearch } from '@tanstack/react-router';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { useShallow } from 'zustand/react/shallow';
import { getSession } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { toast } from '@/stores/toastStore';
import { useOrganizationQRCodes } from '@/hooks/useOrganizationQRCodes';
import { useUsageStats } from '@/hooks/queries/useUsageStats';
import { cn } from '@/utils/cn';
import type { Plan, SubscriptionStatus } from '@/types/database';
import {
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  CreditCard,
  ExternalLink,
  Loader2,
  Receipt,
  Settings,
  Sparkles,
  X,
} from 'lucide-react';
import { ComingSoonBadge } from '@/components/ui/ProBadge';

// ============================================================================
// Constants
// ============================================================================

const COMING_SOON_FEATURES = ['CSV analytics export', 'Advanced analytics'];

const STRIPE_PRICES = {
  starter: {
    monthly: import.meta.env.VITE_STRIPE_PRICE_STARTER || '',
    annual: import.meta.env.VITE_STRIPE_PRICE_STARTER_ANNUAL || '',
  },
  pro: {
    monthly: import.meta.env.VITE_STRIPE_PRICE_PRO || '',
    annual: import.meta.env.VITE_STRIPE_PRICE_PRO_ANNUAL || '',
  },
  business: {
    monthly: import.meta.env.VITE_STRIPE_PRICE_BUSINESS || '',
    annual: import.meta.env.VITE_STRIPE_PRICE_BUSINESS_ANNUAL || '',
  },
};

/** Plan tier order for upgrade/downgrade comparison */
const PLAN_TIER: Record<string, number> = { free: 0, starter: 1, pro: 2, business: 3 };

const plans = [
  {
    id: 'free',
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      '5 dynamic QR codes',
      'Unlimited scans',
      '7-day scan history',
      '1 team member',
      'All 9 QR types',
      'Full customization',
      '1 brand template',
      'PNG download',
      'QR code reader',
      'Scannability score',
    ],
    popular: false,
  },
  {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 12,
    annualPrice: 10,
    features: [
      '50 dynamic QR codes',
      'Unlimited scans',
      '90-day scan history',
      '1 team member',
      'All 9 QR types',
      'Full customization',
      '5 brand templates',
      'PNG, SVG download',
      'Email support',
    ],
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 29,
    annualPrice: 23,
    features: [
      '500 dynamic QR codes',
      'Unlimited scans',
      '1-year scan history',
      '5 team members',
      'All 9 QR types',
      'Full customization',
      'Unlimited brand templates',
      'PNG, SVG, PDF download',
      'API access (1,000 req/day)',
      '1 custom domain',
      'Bulk QR creation',
      'Priority support',
    ],
    popular: true,
  },
  {
    id: 'business',
    name: 'Business',
    monthlyPrice: 79,
    annualPrice: 63,
    features: [
      'Unlimited dynamic QR codes',
      'Unlimited scans',
      'Unlimited scan history',
      '25 team members',
      'All 9 QR types',
      'Full customization',
      'Unlimited brand templates',
      'PNG, SVG, PDF download',
      'API access (10,000 req/day)',
      'White-label branding',
      'Unlimited custom domains',
      'Dedicated support',
    ],
    popular: false,
  },
];

/** Dynamic CTA label based on whether plan is upgrade, downgrade, or current */
function getPlanCTA(planId: string, currentPlan: Plan): string {
  if (planId === currentPlan) return 'Current plan';
  const planName = plans.find((p) => p.id === planId)?.name ?? planId;
  return (PLAN_TIER[planId] ?? 0) > (PLAN_TIER[currentPlan] ?? 0)
    ? `Upgrade to ${planName}`
    : `Switch to ${planName}`;
}

const FAQ_ITEMS = [
  {
    q: 'Can I change plans anytime?',
    a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any payments.",
  },
  {
    q: 'What happens if I exceed my limits?',
    a: "We'll notify you when you're approaching your limits. If you exceed them, your QR codes will continue to work, but you won't be able to create new ones until you upgrade.",
  },
  {
    q: 'Do you offer refunds?',
    a: "Yes, we offer a 14-day money-back guarantee. If you're not satisfied, contact support for a full refund.",
  },
];

const PLAN_BADGE: Record<Plan, { label: string; className: string }> = {
  free: { label: 'Free', className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  starter: { label: 'Starter', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  pro: { label: 'Pro', className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  business: { label: 'Business', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
};

const STATUS_CONFIG: Record<SubscriptionStatus, { dot: string; label: string }> = {
  active: { dot: 'bg-green-500', label: 'Active' },
  past_due: { dot: 'bg-amber-500', label: 'Past Due' },
  canceled: { dot: 'bg-red-500', label: 'Canceled' },
  trialing: { dot: 'bg-blue-500', label: 'Trial' },
  incomplete: { dot: 'bg-gray-400', label: 'Incomplete' },
};

// ============================================================================
// Helpers
// ============================================================================

interface SubscriptionRow {
  id: string;
  organization_id: string;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

function useSubscription(organizationId: string | undefined, refreshKey?: number) {
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null);
  const [isLoading, setIsLoading] = useState(!!organizationId);

  useEffect(() => {
    if (!organizationId) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    let cancelled = false;
    supabase
      .from('subscriptions')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (!cancelled) {
          setSubscription(data?.[0] ?? null);
          setIsLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [organizationId, refreshKey]);

  return { subscription, isLoading };
}

function getBillingCycle(priceId: string | null): 'monthly' | 'annual' | null {
  if (!priceId) return null;
  const annualPrices = [
    import.meta.env.VITE_STRIPE_PRICE_STARTER_ANNUAL,
    import.meta.env.VITE_STRIPE_PRICE_PRO_ANNUAL,
    import.meta.env.VITE_STRIPE_PRICE_BUSINESS_ANNUAL,
  ].filter(Boolean);
  return annualPrices.includes(priceId) ? 'annual' : 'monthly';
}

function getPlanPrice(plan: string, cycle: 'monthly' | 'annual' | null): string {
  const planData = plans.find((p) => p.id === plan);
  if (!planData || planData.monthlyPrice === 0) return 'Free';
  const price = cycle === 'annual' ? planData.annualPrice : planData.monthlyPrice;
  const suffix = cycle === 'annual' ? '/mo (billed annually)' : '/month';
  return `$${price}.00${suffix}`;
}

function formatDate(iso: string | null): string {
  if (!iso) return 'N/A';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ============================================================================
// Sub-components
// ============================================================================

function CompactUsageBar({ label, used, limit }: { label: string; used: number; limit: number }) {
  const isUnlimited = limit === -1;
  const pct = isUnlimited ? 0 : limit === 0 ? 0 : Math.min((used / limit) * 100, 100);
  const isWarning = !isUnlimited && pct >= 80;
  const isCritical = !isUnlimited && pct >= 95;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600 dark:text-gray-400">{label}</span>
        <span className="font-medium text-gray-900 dark:text-white">
          {used.toLocaleString()} / {isUnlimited ? 'Unlimited' : limit.toLocaleString()}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-orange-500'
          )}
          style={{ width: isUnlimited ? '0%' : `${pct}%` }}
        />
      </div>
    </div>
  );
}

function UsageBars({
  usageStats,
  planLimits,
  teamMembers,
}: {
  usageStats: { scansUsed: number; scansLimit: number; qrCodesUsed: number; qrCodesLimit: number } | undefined;
  planLimits: { team_members: number } | null;
  teamMembers: number;
}) {
  if (!usageStats) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-1">
            <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <CompactUsageBar label="Dynamic QR Codes" used={usageStats.qrCodesUsed} limit={usageStats.qrCodesLimit} />
      <CompactUsageBar label="Monthly Scans" used={usageStats.scansUsed} limit={usageStats.scansLimit} />
      <CompactUsageBar label="Team Members" used={teamMembers} limit={planLimits?.team_members ?? 1} />
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-white">{children}</span>
    </div>
  );
}

function SubscriptionCard({
  subscription,
  plan,
  isSubLoading,
  onChangePlan,
  onManageBilling,
  isBillingLoading,
  previousPlan,
}: {
  subscription: SubscriptionRow | null;
  plan: Plan;
  isSubLoading: boolean;
  onChangePlan: () => void;
  onManageBilling: () => void;
  isBillingLoading: boolean;
  previousPlan: { plan: string; endDate: string } | null;
}) {
  const badge = PLAN_BADGE[plan];
  const cycle = getBillingCycle(subscription?.stripe_price_id ?? null);
  const status = subscription?.status ?? 'active';
  const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.active;

  return (
    <div className="glass rounded-2xl p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h2 className="section-title">Subscription</h2>
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" onClick={onChangePlan}>
            Change Plan
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
          <Button variant="secondary" size="sm" onClick={onManageBilling} disabled={isBillingLoading}>
            {isBillingLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ExternalLink className="w-3.5 h-3.5" />}
            Manage Billing
          </Button>
        </div>
      </div>

      {isSubLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex justify-between py-2.5">
              <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
              <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <div className="divide-y divide-black/[0.04] dark:divide-white/[0.04]">
          <DetailRow label="Plan">
            <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-semibold', badge.className)}>
              {badge.label}
            </span>
          </DetailRow>
          <DetailRow label="Status">
            <span className="flex items-center gap-2">
              <span className={cn('w-2 h-2 rounded-full', statusCfg.dot)} />
              {statusCfg.label}
            </span>
          </DetailRow>
          {cycle && (
            <DetailRow label="Billing Cycle">
              {cycle === 'annual' ? 'Annual' : 'Monthly'}
            </DetailRow>
          )}
          {subscription?.current_period_end && (
            <DetailRow label={subscription.cancel_at_period_end ? 'Ends On' : 'Renews'}>
              {formatDate(subscription.current_period_end)}
            </DetailRow>
          )}
          <DetailRow label="Amount">
            {getPlanPrice(plan, cycle)}
          </DetailRow>
        </div>
      )}

      {/* Previous plan winding down notice */}
      {previousPlan && (
        <div className="mt-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40">
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Your previous{' '}
              <span className="font-semibold">{PLAN_BADGE[previousPlan.plan as Plan]?.label || previousPlan.plan}</span>{' '}
              plan is still active until{' '}
              <span className="font-medium">{formatDate(previousPlan.endDate)}</span>{' '}
              and will then be canceled automatically.
              You can manage this via Manage Billing.
            </p>
          </div>
        </div>
      )}

      {/* Cancellation warning */}
      {subscription?.cancel_at_period_end && !previousPlan && (
        <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            Your plan will be downgraded to Free on{' '}
            <span className="font-medium">{formatDate(subscription.current_period_end)}</span>.
            Reactivate anytime via Manage Billing.
          </p>
        </div>
      )}

      {/* Past due warning */}
      {status === 'past_due' && (
        <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            Your payment is past due. Please update your payment method to avoid service interruption.
          </p>
        </div>
      )}
    </div>
  );
}

function FreeOverviewCard({
  organizationName,
  usageStats,
  planLimits,
  teamMembers,
  onUpgrade,
  onCompare,
}: {
  organizationName: string | undefined;
  usageStats: { scansUsed: number; scansLimit: number; qrCodesUsed: number; qrCodesLimit: number } | undefined;
  planLimits: { team_members: number } | null;
  teamMembers: number;
  onUpgrade: () => void;
  onCompare: () => void;
}) {
  return (
    <div className="glass rounded-2xl p-6">
      {/* Plan header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h2 className="section-title">Current Plan</h2>
          <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-semibold', PLAN_BADGE.free.className)}>
            Free
          </span>
        </div>
        {organizationName && (
          <span className="text-sm text-gray-500 dark:text-gray-400">{organizationName}</span>
        )}
      </div>

      {/* Usage bars */}
      <div className="mb-6">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Usage This Period
        </p>
        <UsageBars usageStats={usageStats} planLimits={planLimits} teamMembers={teamMembers} />
      </div>

      {/* Upgrade CTA */}
      <div className="rounded-xl bg-orange-500/5 dark:bg-orange-400/5 border border-orange-200/40 dark:border-orange-800/30 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-orange-500" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Unlock more with Pro</h3>
        </div>
        <ul className="space-y-2 mb-4">
          {['500 dynamic QR codes', 'Unlimited scans', 'SVG & PDF downloads', 'API access & advanced analytics'].map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Check className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Button onClick={onUpgrade}>
            Upgrade Plan
            <ChevronRight className="w-4 h-4" />
          </Button>
          <button
            type="button"
            onClick={onCompare}
            className="text-sm text-orange-600 dark:text-orange-400 hover:underline py-2"
          >
            Compare all plans
          </button>
        </div>
      </div>
    </div>
  );
}

function QuickActionsRow({ onManageBilling, isLoading }: { onManageBilling: () => void; isLoading: boolean }) {
  const tiles = [
    { icon: CreditCard, label: 'Payment Methods', sublabel: 'Update cards & billing info' },
    { icon: Receipt, label: 'Invoices & Receipts', sublabel: 'Download past invoices' },
    { icon: Settings, label: 'Billing Settings', sublabel: 'Email, address & tax info' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {tiles.map((tile) => (
        <button
          key={tile.label}
          type="button"
          onClick={onManageBilling}
          disabled={isLoading}
          className="glass rounded-2xl p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg group disabled:opacity-50"
        >
          <tile.icon className="w-5 h-5 text-gray-400 dark:text-gray-500 mb-3 group-hover:text-orange-500 transition-colors" />
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-0.5">{tile.label}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{tile.sublabel}</p>
          <div className="flex items-center gap-1 mt-3 text-xs text-orange-600 dark:text-orange-400">
            Manage
            <ExternalLink className="w-3 h-3" />
          </div>
        </button>
      ))}
    </div>
  );
}

function PlanPicker({
  isOpen,
  onClose,
  currentPlan,
  isAnnual,
  onToggleAnnual,
  onSelectPlan,
  onManageBilling,
  isLoading,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: Plan;
  isAnnual: boolean;
  onToggleAnnual: () => void;
  onSelectPlan: (planId: string) => void;
  onManageBilling: () => void;
  isLoading: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="animate-fade-in">
      <div className="glass rounded-2xl p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title">Choose a Plan</h2>
            <button
              type="button"
              onClick={onClose}
              className="btn-icon"
              aria-label="Close plan picker"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className={cn('text-sm font-medium', !isAnnual ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400')}>
              Monthly
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={isAnnual}
              onClick={onToggleAnnual}
              className={cn(
                'relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors',
                isAnnual ? 'bg-orange-500' : 'bg-gray-300 dark:bg-gray-600'
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 rounded-full bg-white transition-transform',
                  isAnnual ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
            <span className={cn('text-sm font-medium', isAnnual ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400')}>
              Annual
            </span>
            {isAnnual && (
              <span className="ml-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                Save 22%
              </span>
            )}
          </div>

          {/* Plan cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => {
              const isCurrent = plan.id === currentPlan;
              const isDowngrade = (PLAN_TIER[plan.id] ?? 0) < (PLAN_TIER[currentPlan] ?? 0);
              const displayPrice = isAnnual ? plan.annualPrice : plan.monthlyPrice;
              const cta = getPlanCTA(plan.id, currentPlan);

              return (
                <div
                  key={plan.id}
                  className={cn(
                    'relative glass rounded-2xl border-2 p-6 flex flex-col',
                    plan.popular
                      ? 'border-orange-500'
                      : isCurrent
                      ? 'border-green-500'
                      : 'border-transparent'
                  )}
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

                  <ul className="space-y-3 mb-6 flex-1">
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
                    variant={isCurrent ? 'secondary' : 'primary'}
                    disabled={isCurrent || isLoading}
                    onClick={() => {
                      // "Switch to Free" = cancel subscription via billing portal
                      if (plan.id === 'free' && !isCurrent) {
                        onManageBilling();
                      } else {
                        onSelectPlan(plan.id);
                      }
                    }}
                  >
                    {isCurrent ? (
                      <>
                        <Check className="w-4 h-4" />
                        Current plan
                      </>
                    ) : isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isDowngrade && plan.id === 'free' ? (
                      <>
                        <ExternalLink className="w-4 h-4" />
                        {cta}
                      </>
                    ) : (
                      cta
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
  );
}

function AccordionItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-4 text-left group"
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
          {question}
        </span>
        <ChevronDown
          className={cn('w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200', open && 'rotate-180')}
        />
      </button>
      {open && (
        <div className="animate-fade-in">
          <p className="pb-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            {answer}
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function BillingSettingsContent() {
  const { currentOrganization, planLimits, fetchOrganizations } = useAuthStore(
    useShallow((s) => ({
      currentOrganization: s.currentOrganization,
      planLimits: s.planLimits,
      fetchOrganizations: s.fetchOrganizations,
    }))
  );

  // Use planLimits.plan as source of truth (always freshly fetched from DB)
  // rather than currentOrganization.plan which may be stale in persist cache
  const currentPlan: Plan = planLimits?.plan || currentOrganization?.plan || 'free';
  const isFree = currentPlan === 'free';

  const [isLoading, setIsLoading] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);
  const [showPlanPicker, setShowPlanPicker] = useState(false);
  const [subRefreshKey, setSubRefreshKey] = useState(0);
  const [previousPlan, setPreviousPlan] = useState<{ plan: string; endDate: string } | null>(null);
  const planPickerRef = useRef<HTMLDivElement>(null);

  // Sync subscription status from Stripe on mount, then refresh org data
  const syncTriggered = useRef(false);
  useEffect(() => {
    if (syncTriggered.current) return;
    syncTriggered.current = true;

    (async () => {
      try {
        const session = await getSession();
        if (session?.access_token) {
          const resp = await fetch('/api/billing/checkout?action=sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
          });
          const data = await resp.json();
          console.log('[Billing Sync]', resp.status, data);
          if (resp.ok) {
            if (data.previous_plan && data.previous_plan_end_date) {
              setPreviousPlan({ plan: data.previous_plan, endDate: data.previous_plan_end_date });
            }
          }
        }
      } catch (err) {
        console.error('[Billing Sync] error', err);
        // Sync failure is non-fatal — still show cached data
      }
      await fetchOrganizations();
      setSubRefreshKey((k) => k + 1);
    })();
  }, [fetchOrganizations]);

  // Fetch subscription details (refreshes after sync completes)
  const { subscription, isLoading: isSubLoading } = useSubscription(
    currentOrganization?.id,
    subRefreshKey
  );

  // Fetch usage data
  const { totalCount, monthlyScans, teamMembers } = useOrganizationQRCodes({ limit: 1 });
  const { data: usageStats } = useUsageStats({ totalQRCodes: totalCount, monthlyScans });

  // Scroll plan picker into view when opened
  useEffect(() => {
    if (showPlanPicker) {
      // Small delay to let the DOM render before scrolling
      requestAnimationFrame(() => {
        planPickerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [showPlanPicker]);

  // Handle success/cancel URL params from Stripe redirect
  const search = useSearch({ strict: false }) as { success?: string; canceled?: string; initCheckout?: string; billing?: string };
  const successHandled = useRef(false);

  useEffect(() => {
    if (search.success === 'true' && !successHandled.current) {
      successHandled.current = true;
      toast.success('Subscription updated successfully!');

      // Run sync again after checkout to pick up the new subscription
      (async () => {
        try {
          const session = await getSession();
          if (session?.access_token) {
            await fetch('/api/billing/checkout?action=sync', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session.access_token}`,
              },
            });
          }
        } catch {
          // non-fatal
        }
        await fetchOrganizations();
        setSubRefreshKey((k) => k + 1);
      })();
    } else if (search.canceled === 'true') {
      toast.info('Checkout canceled');
    }
  }, [search.success, search.canceled, fetchOrganizations]);

  const handleUpgrade = async (planId: string, cycle?: 'monthly' | 'annual') => {
    if (planId === 'free') return;

    const effectiveCycle = cycle ?? (isAnnual ? 'annual' : 'monthly');
    const prices = STRIPE_PRICES[planId as keyof typeof STRIPE_PRICES];
    const priceId = prices ? (effectiveCycle === 'annual' ? prices.annual : prices.monthly) : '';
    if (!priceId) {
      toast.error(
        effectiveCycle === 'annual'
          ? 'Annual billing is not yet available. Please select monthly billing or contact support.'
          : 'Stripe is not configured. Please contact support.'
      );
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

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to start checkout');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-trigger checkout when arriving from pricing page signup
  const initCheckoutTriggered = useRef(false);
  useEffect(() => {
    if (initCheckoutTriggered.current) return;
    const { initCheckout, billing } = search;
    if (!initCheckout || (initCheckout !== 'pro' && initCheckout !== 'business')) return;
    initCheckoutTriggered.current = true;

    // Set billing toggle to match
    const cycle = (billing === 'annual' ? 'annual' : 'monthly') as 'monthly' | 'annual';
    setIsAnnual(cycle === 'annual');

    // Clean URL params to prevent re-trigger on refresh
    window.history.replaceState({}, '', window.location.pathname + '?tab=billing');

    // Trigger checkout
    handleUpgrade(initCheckout, cycle);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

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
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Billing</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Manage your subscription and payment settings
        </p>
      </div>

      {/* Main content — conditional on plan */}
      {isFree ? (
        <>
          <FreeOverviewCard
            organizationName={currentOrganization?.name}
            usageStats={usageStats}
            planLimits={planLimits}
            teamMembers={teamMembers}
            onUpgrade={() => setShowPlanPicker(true)}
            onCompare={() => setShowPlanPicker(true)}
          />
        </>
      ) : (
        <>
          <SubscriptionCard
            subscription={subscription}
            plan={currentPlan}
            isSubLoading={isSubLoading}
            onChangePlan={() => setShowPlanPicker(true)}
            onManageBilling={handleManageBilling}
            isBillingLoading={isLoading}
            previousPlan={previousPlan}
          />

          {/* Usage this period */}
          <div className="glass rounded-2xl p-6">
            <h2 className="section-title mb-4">Usage This Period</h2>
            <UsageBars usageStats={usageStats} planLimits={planLimits} teamMembers={teamMembers} />
          </div>

          {/* Quick actions */}
          <QuickActionsRow onManageBilling={handleManageBilling} isLoading={isLoading} />
        </>
      )}

      {/* Plan picker (collapsible) */}
      <div ref={planPickerRef}>
        <PlanPicker
          isOpen={showPlanPicker}
          onClose={() => setShowPlanPicker(false)}
          currentPlan={currentPlan}
          isAnnual={isAnnual}
          onToggleAnnual={() => setIsAnnual(!isAnnual)}
          onSelectPlan={handleUpgrade}
          onManageBilling={handleManageBilling}
          isLoading={isLoading}
        />
      </div>

      {/* FAQ */}
      <div className="glass rounded-2xl p-6">
        <h2 className="section-title mb-4">Frequently Asked Questions</h2>
        <div className="divide-y divide-gray-200/60 dark:divide-gray-700/60">
          {FAQ_ITEMS.map((item) => (
            <AccordionItem key={item.q} question={item.q} answer={item.a} />
          ))}
        </div>
      </div>

      {/* Support */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        Need help? Contact us at{' '}
        <a
          href="mailto:support@qriuscodes.com"
          className="text-orange-600 dark:text-orange-400 hover:underline"
        >
          support@qriuscodes.com
        </a>
      </div>
    </div>
  );
}

export default function BillingSettingsPage() {
  return <BillingSettingsContent />;
}
