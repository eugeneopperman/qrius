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
    <EmailLayout preview={`Heads up — your ${amount} payment for ${organizationName} didn't go through`}>
      <Text style={{ fontFamily: BRAND.serifFont, fontSize: '24px', fontWeight: 700, color: BRAND.ink, margin: '0 0 16px' }}>
        Your payment didn't go through.
      </Text>

      <Text style={{ fontFamily: BRAND.sansFont, fontSize: '16px', color: BRAND.charcoal, lineHeight: '1.6', margin: '0 0 16px' }}>
        We tried to charge {amount} for <strong>{organizationName}</strong>, but it was declined. This usually means an expired card or insufficient funds — a quick update should fix it.
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
            <strong>We'll try again:</strong> {nextRetryDate}
          </Text>
        )}
      </EmailCard>

      <Text style={{ fontFamily: BRAND.sansFont, fontSize: '14px', color: BRAND.charcoal, lineHeight: '1.6', margin: '0 0 16px' }}>
        After 3 failed attempts, your account moves to the Free plan. Your QR codes keep working — but you'll lose access to paid features until it's sorted.
      </Text>

      <div style={{ textAlign: 'center' as const, margin: '24px 0' }}>
        <EmailButton href={`${BRAND.appUrl}/settings?tab=billing`}>Update payment method</EmailButton>
      </div>
    </EmailLayout>
  );
}
