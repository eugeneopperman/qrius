import * as React from 'react';
import { Text } from '@react-email/components';
import { EmailLayout } from '../_layout/EmailLayout.js';
import { EmailButton } from '../_layout/EmailButton.js';
import { BRAND } from '../_layout/styles.js';

interface UpgradePromptEmailProps {
  userName?: string;
  reason: 'trial_expiring' | 'limit_approaching';
  currentPlan: string;
  usagePercent?: number;
  unsubscribeUrl: string;
}

export function UpgradePromptEmail({ userName, reason, currentPlan, usagePercent, unsubscribeUrl }: UpgradePromptEmailProps) {
  const isLimit = reason === 'limit_approaching';

  return (
    <EmailLayout
      preview={isLimit ? `You're at ${usagePercent}% of your ${currentPlan} plan limit` : 'Unlock more with Qrius Codes'}
      unsubscribeUrl={unsubscribeUrl}
    >
      <Text style={{ fontFamily: BRAND.serifFont, fontSize: '24px', fontWeight: 700, color: BRAND.ink, margin: '0 0 16px' }}>
        {isLimit ? 'Running low on QR codes' : 'Ready for more?'}
      </Text>

      <Text style={{ fontFamily: BRAND.sansFont, fontSize: '16px', color: BRAND.charcoal, lineHeight: '1.6', margin: '0 0 16px' }}>
        {isLimit
          ? `Hi ${userName || 'there'}, you've used ${usagePercent}% of your QR code limit on the ${currentPlan} plan. Upgrade to keep creating without interruption.`
          : `Hi ${userName || 'there'}, you've been using Qrius Codes for a week now — great start! Upgrade to unlock more QR codes, scan analytics, and team collaboration.`
        }
      </Text>

      <Text style={{ fontFamily: BRAND.sansFont, fontSize: '15px', color: BRAND.charcoal, lineHeight: '1.8', margin: '0 0 24px', paddingLeft: '16px' }}>
        ✦ More dynamic QR codes{'\n'}
        ✦ Advanced scan analytics{'\n'}
        ✦ SVG & PDF downloads{'\n'}
        ✦ Team collaboration{'\n'}
        ✦ API access
      </Text>

      <div style={{ textAlign: 'center' as const, margin: '24px 0' }}>
        <EmailButton href={`${BRAND.appUrl}/pricing`}>View plans</EmailButton>
      </div>
    </EmailLayout>
  );
}
