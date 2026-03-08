import * as React from 'react';
import { Text } from '@react-email/components';
import { EmailLayout } from '../_layout/EmailLayout.js';
import { EmailButton } from '../_layout/EmailButton.js';
import { BRAND } from '../_layout/styles.js';

interface FirstQRCreatedEmailProps {
  userName?: string;
  qrCodeName?: string;
  unsubscribeUrl: string;
}

export function FirstQRCreatedEmail({ userName, qrCodeName, unsubscribeUrl }: FirstQRCreatedEmailProps) {
  return (
    <EmailLayout preview="Your first QR code is live!" unsubscribeUrl={unsubscribeUrl}>
      <Text style={{ fontFamily: BRAND.serifFont, fontSize: '24px', fontWeight: 700, color: BRAND.ink, margin: '0 0 16px' }}>
        Your first QR code is live! 🎉
      </Text>

      <Text style={{ fontFamily: BRAND.sansFont, fontSize: '16px', color: BRAND.charcoal, lineHeight: '1.6', margin: '0 0 16px' }}>
        Hi {userName || 'there'}, you just created{qrCodeName ? ` "${qrCodeName}"` : ' your first QR code'} — nice work!
        It's already tracking scans in real time.
      </Text>

      <Text style={{ fontFamily: BRAND.sansFont, fontSize: '16px', color: BRAND.charcoal, lineHeight: '1.6', margin: '0 0 8px' }}>
        Here's what to try next:
      </Text>

      <Text style={{ fontFamily: BRAND.sansFont, fontSize: '15px', color: BRAND.charcoal, lineHeight: '1.8', margin: '0 0 24px', paddingLeft: '16px' }}>
        ✦ Print it — download as PNG or SVG{'\n'}
        ✦ Share it — add it to your website, business card, or poster{'\n'}
        ✦ Watch the scans — check your dashboard for real-time analytics
      </Text>

      <div style={{ textAlign: 'center' as const, margin: '24px 0' }}>
        <EmailButton href={BRAND.dashboardUrl}>View your dashboard</EmailButton>
      </div>
    </EmailLayout>
  );
}
