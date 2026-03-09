import * as React from 'react';
import { Text } from '@react-email/components';
import { EmailLayout } from '../_layout/EmailLayout.js';
import { EmailButton } from '../_layout/EmailButton.js';
import { EmailCard } from '../_layout/EmailCard.js';
import { BRAND } from '../_layout/styles.js';

interface PaymentReceiptEmailProps {
  organizationName: string;
  amount: string;
  planName: string;
  invoiceDate: string;
  invoiceUrl?: string;
}

export function PaymentReceiptEmail({
  organizationName,
  amount,
  planName,
  invoiceDate,
  invoiceUrl,
}: PaymentReceiptEmailProps) {
  return (
    <EmailLayout preview={`Receipt: ${amount} for your ${planName} plan`}>
      <Text style={{ fontFamily: BRAND.serifFont, fontSize: '24px', fontWeight: 700, color: BRAND.ink, margin: '0 0 16px' }}>
        Payment received — you're all set.
      </Text>

      <Text style={{ fontFamily: BRAND.sansFont, fontSize: '16px', color: BRAND.charcoal, lineHeight: '1.6', margin: '0 0 16px' }}>
        Here's your receipt for {organizationName}. No action needed — just keeping your records tidy.
      </Text>

      <EmailCard accent>
        <Text style={{ fontFamily: BRAND.sansFont, fontSize: '14px', color: BRAND.charcoal, margin: '0 0 4px' }}>
          <strong>Plan:</strong> {planName}
        </Text>
        <Text style={{ fontFamily: BRAND.sansFont, fontSize: '14px', color: BRAND.charcoal, margin: '0 0 4px' }}>
          <strong>Amount:</strong> {amount}
        </Text>
        <Text style={{ fontFamily: BRAND.sansFont, fontSize: '14px', color: BRAND.charcoal, margin: 0 }}>
          <strong>Date:</strong> {invoiceDate}
        </Text>
      </EmailCard>

      {invoiceUrl && (
        <div style={{ textAlign: 'center' as const, margin: '24px 0' }}>
          <EmailButton href={invoiceUrl}>View full invoice</EmailButton>
        </div>
      )}
    </EmailLayout>
  );
}
