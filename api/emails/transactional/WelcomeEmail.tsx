import * as React from 'react';
import { Text } from '@react-email/components';
import { EmailLayout } from '../_layout/EmailLayout.js';
import { EmailButton } from '../_layout/EmailButton.js';
import { BRAND } from '../_layout/styles.js';

interface WelcomeEmailProps {
  userName?: string;
}

export function WelcomeEmail({ userName }: WelcomeEmailProps) {
  const name = userName || 'there';

  return (
    <EmailLayout preview="You're in — let's make your first QR code">
      <Text style={{ fontFamily: BRAND.serifFont, fontSize: '24px', fontWeight: 700, color: BRAND.ink, margin: '0 0 16px' }}>
        You're in. Let's make something.
      </Text>

      <Text style={{ fontFamily: BRAND.sansFont, fontSize: '16px', color: BRAND.charcoal, lineHeight: '1.6', margin: '0 0 16px' }}>
        Hi {name}, welcome to Qrius Codes. You've got 5 free dynamic QR codes — each one trackable, customizable, and yours to keep.
      </Text>

      <Text style={{ fontFamily: BRAND.sansFont, fontSize: '16px', color: BRAND.charcoal, lineHeight: '1.6', margin: '0 0 24px' }}>
        Your first code takes about 30 seconds. Pick a type, drop in your link, and make it look the way you want. Every scan gets tracked — where it happened, what device, what time.
      </Text>

      <div style={{ textAlign: 'center' as const, margin: '24px 0' }}>
        <EmailButton href={`${BRAND.appUrl}/create`}>Create your first QR code</EmailButton>
      </div>

      <Text style={{ fontFamily: BRAND.sansFont, fontSize: '14px', color: BRAND.charcoal, lineHeight: '1.6', margin: '16px 0 0' }}>
        Stuck on anything? Just reply to this email. We read every one.
      </Text>
    </EmailLayout>
  );
}
