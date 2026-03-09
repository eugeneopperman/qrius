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
    <EmailLayout preview="Your first QR code is live and tracking" unsubscribeUrl={unsubscribeUrl}>
      <Text style={{ fontFamily: BRAND.serifFont, fontSize: '24px', fontWeight: 700, color: BRAND.ink, margin: '0 0 16px' }}>
        Your first code is live.
      </Text>

      <Text style={{ fontFamily: BRAND.sansFont, fontSize: '16px', color: BRAND.charcoal, lineHeight: '1.6', margin: '0 0 16px' }}>
        Hi {userName || 'there'}, {qrCodeName ? `"${qrCodeName}" is` : 'your QR code is'} out in the world and tracking every scan in real time. Nice work — that was quick.
      </Text>

      <Text style={{ fontFamily: BRAND.sansFont, fontSize: '16px', color: BRAND.charcoal, lineHeight: '1.6', margin: '0 0 8px' }}>
        A few ideas for what to do next:
      </Text>

      <Text style={{ fontFamily: BRAND.sansFont, fontSize: '15px', color: BRAND.charcoal, lineHeight: '1.8', margin: '0 0 24px', paddingLeft: '16px' }}>
        ✦ Download it — grab a PNG or SVG for print{'\n'}
        ✦ Put it somewhere — business cards, menus, flyers, packaging{'\n'}
        ✦ Watch what happens — your dashboard updates as scans come in
      </Text>

      <Text style={{ fontFamily: BRAND.sansFont, fontSize: '16px', color: BRAND.charcoal, lineHeight: '1.6', margin: '0 0 24px' }}>
        Every scan tells you where, when, and what device. The more places you put it, the more interesting your data gets.
      </Text>

      <div style={{ textAlign: 'center' as const, margin: '24px 0' }}>
        <EmailButton href={BRAND.dashboardUrl}>See your dashboard</EmailButton>
      </div>
    </EmailLayout>
  );
}
