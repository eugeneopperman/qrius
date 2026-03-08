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
    <EmailLayout preview="Welcome to Qrius Codes — let's create your first QR code">
      <Text style={{ fontFamily: BRAND.serifFont, fontSize: '24px', fontWeight: 700, color: BRAND.ink, margin: '0 0 16px' }}>
        Welcome to Qrius Codes!
      </Text>

      <Text style={{ fontFamily: BRAND.sansFont, fontSize: '16px', color: BRAND.charcoal, lineHeight: '1.6', margin: '0 0 16px' }}>
        Hi {name}, thanks for joining Qrius Codes. You're all set to create beautiful, trackable QR codes in seconds.
      </Text>

      <Text style={{ fontFamily: BRAND.sansFont, fontSize: '16px', color: BRAND.charcoal, lineHeight: '1.6', margin: '0 0 8px' }}>
        Here's what you can do right away:
      </Text>

      <Text style={{ fontFamily: BRAND.sansFont, fontSize: '15px', color: BRAND.charcoal, lineHeight: '1.8', margin: '0 0 24px', paddingLeft: '16px' }}>
        ✦ Create dynamic QR codes with real-time tracking{'\n'}
        ✦ Customize colors, logos, and dot patterns{'\n'}
        ✦ Track scans by location, device, and time{'\n'}
        ✦ Download in PNG, SVG, or PDF
      </Text>

      <div style={{ textAlign: 'center' as const, margin: '24px 0' }}>
        <EmailButton href={`${BRAND.appUrl}/create`}>Create your first QR code</EmailButton>
      </div>

      <Text style={{ fontFamily: BRAND.sansFont, fontSize: '14px', color: BRAND.charcoal, lineHeight: '1.6', margin: '16px 0 0' }}>
        Questions? Reply to this email — we'd love to help.
      </Text>
    </EmailLayout>
  );
}
