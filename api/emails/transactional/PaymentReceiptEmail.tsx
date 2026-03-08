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
    <EmailLayout preview={`Payment received — ${amount} for ${planName} plan`}>
      <Text style={{ fontFamily: BRAND.serifFont, fontSize: '24px', fontWeight: 700, color: BRAND.ink, margin: '0 0 16px' }}>
        Payment received
      </Text>

      <Text style={{ fontFamily: BRAND.sansFont, fontSize: '16px', color: BRAND.charcoal, lineHeight: '1.6', margin: '0 0 16px' }}>
        Thanks for your payment. Here's a summary for {organizationName}:
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
          <EmailButton href={invoiceUrl}>View invoice</EmailButton>
        </div>
      )}
    </EmailLayout>
  );
}
