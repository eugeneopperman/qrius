import * as React from 'react';
import { Text } from '@react-email/components';
import { EmailLayout } from '../_layout/EmailLayout.js';
import { EmailButton } from '../_layout/EmailButton.js';
import { EmailCard } from '../_layout/EmailCard.js';
import { BRAND } from '../_layout/styles.js';

interface PaymentFailedEmailProps {
  organizationName: string;
  amount: string;
  attemptCount: number;
  nextRetryDate?: string;
}

export function PaymentFailedEmail({
  organizationName,
  amount,
  attemptCount,
  nextRetryDate,
}: PaymentFailedEmailProps) {
  return (
    <EmailLayout preview={`Action required — payment of ${amount} failed for ${organizationName}`}>
      <Text style={{ fontFamily: BRAND.serifFont, fontSize: '24px', fontWeight: 700, color: BRAND.ink, margin: '0 0 16px' }}>
        Payment failed
      </Text>

      <Text style={{ fontFamily: BRAND.sansFont, fontSize: '16px', color: BRAND.charcoal, lineHeight: '1.6', margin: '0 0 16px' }}>
        We weren't able to process your payment for <strong>{organizationName}</strong>. Please update your payment method to keep your subscription active.
      </Text>

      <EmailCard>
        <Text style={{ fontFamily: BRAND.sansFont, fontSize: '14px', color: BRAND.charcoal, margin: '0 0 4px' }}>
          <strong>Amount:</strong> {amount}
        </Text>
        <Text style={{ fontFamily: BRAND.sansFont, fontSize: '14px', color: BRAND.charcoal, margin: '0 0 4px' }}>
          <strong>Attempt:</strong> {attemptCount} of 3
        </Text>
        {nextRetryDate && (
          <Text style={{ fontFamily: BRAND.sansFont, fontSize: '14px', color: BRAND.charcoal, margin: 0 }}>
            <strong>Next retry:</strong> {nextRetryDate}
          </Text>
        )}
      </EmailCard>

      <Text style={{ fontFamily: BRAND.sansFont, fontSize: '14px', color: BRAND.warning, lineHeight: '1.6', margin: '0 0 16px' }}>
        If payment continues to fail, your account will be downgraded to the Free plan after 3 attempts.
      </Text>

      <div style={{ textAlign: 'center' as const, margin: '24px 0' }}>
        <EmailButton href={`${BRAND.appUrl}/settings?tab=billing`}>Update payment method</EmailButton>
      </div>
    </EmailLayout>
  );
}
