import * as React from 'react';
import { Text } from '@react-email/components';
import { EmailLayout } from '../_layout/EmailLayout.js';
import { EmailButton } from '../_layout/EmailButton.js';
import { EmailCard } from '../_layout/EmailCard.js';
import { BRAND } from '../_layout/styles.js';

interface SubscriptionChangedEmailProps {
  organizationName: string;
  previousPlan: string;
  newPlan: string;
  changeType: 'upgraded' | 'downgraded' | 'canceled' | 'reactivated';
  effectiveDate?: string;
}

const planNames: Record<string, string> = {
  free: 'Free',
  starter: 'Starter',
  pro: 'Pro',
  business: 'Business',
};

export function SubscriptionChangedEmail({
  organizationName,
  previousPlan,
  newPlan,
  changeType,
  effectiveDate,
}: SubscriptionChangedEmailProps) {
  const titles: Record<string, string> = {
    upgraded: 'You just leveled up.',
    downgraded: 'Your plan has changed.',
    canceled: 'We've canceled your subscription.',
    reactivated: 'Welcome back.',
  };

  const descriptions: Record<string, string> = {
    upgraded: `${organizationName} is now on the ${planNames[newPlan] || newPlan} plan. More codes, more features, more room to grow.`,
    downgraded: `${organizationName} has moved to the ${planNames[newPlan] || newPlan} plan. Your existing QR codes still work — nothing breaks.`,
    canceled: `Your subscription for ${organizationName} has been canceled. You'll keep full access until the end of your current billing period, then you'll move to the Free plan. Your QR codes stay active either way.`,
    reactivated: `Good to have you back. ${organizationName} is on the ${planNames[newPlan] || newPlan} plan again — everything's right where you left it.`,
  };

  return (
    <EmailLayout preview={`${titles[changeType]} — ${organizationName}`}>
      <Text style={{ fontFamily: BRAND.serifFont, fontSize: '24px', fontWeight: 700, color: BRAND.ink, margin: '0 0 16px' }}>
        {titles[changeType]}
      </Text>

      <Text style={{ fontFamily: BRAND.sansFont, fontSize: '16px', color: BRAND.charcoal, lineHeight: '1.6', margin: '0 0 16px' }}>
        {descriptions[changeType]}
      </Text>

      <EmailCard accent>
        {changeType !== 'canceled' && (
          <Text style={{ fontFamily: BRAND.sansFont, fontSize: '14px', color: BRAND.charcoal, margin: '0 0 4px' }}>
            <strong>Was:</strong> {planNames[previousPlan] || previousPlan}
          </Text>
        )}
        <Text style={{ fontFamily: BRAND.sansFont, fontSize: '14px', color: BRAND.charcoal, margin: '0 0 4px' }}>
          <strong>{changeType === 'canceled' ? 'Current plan' : 'Now'}:</strong> {planNames[newPlan] || newPlan}
        </Text>
        {effectiveDate && (
          <Text style={{ fontFamily: BRAND.sansFont, fontSize: '14px', color: BRAND.charcoal, margin: 0 }}>
            <strong>Effective:</strong> {effectiveDate}
          </Text>
        )}
      </EmailCard>

      <div style={{ textAlign: 'center' as const, margin: '24px 0' }}>
        <EmailButton href={`${BRAND.appUrl}/settings?tab=billing`}>
          {changeType === 'canceled' ? 'Manage billing' : 'View your plan'}
        </EmailButton>
      </div>
    </EmailLayout>
  );
}
