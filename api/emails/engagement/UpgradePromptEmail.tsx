import * as React from 'react';
import { Text } from '@react-email/components';
import { EmailLayout } from '../_layout/EmailLayout.js';
import { EmailButton } from '../_layout/EmailButton.js';
import { EmailCard } from '../_layout/EmailCard.js';
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
      preview={isLimit ? `You've used ${usagePercent}% of your QR codes — time to think bigger?` : 'You\'ve been building — here\'s how to do more'}
      unsubscribeUrl={unsubscribeUrl}
    >
      <Text style={{ fontFamily: BRAND.serifFont, fontSize: '24px', fontWeight: 700, color: BRAND.ink, margin: '0 0 16px' }}>
        {isLimit ? 'You\'re running out of room.' : 'Qrius what comes next?'}
      </Text>

      <Text style={{ fontFamily: BRAND.sansFont, fontSize: '16px', color: BRAND.charcoal, lineHeight: '1.6', margin: '0 0 16px' }}>
        {isLimit
          ? `Hi ${userName || 'there'}, you've used ${usagePercent}% of the QR codes on your ${currentPlan} plan. That's a good problem to have — it means they're working.`
          : `Hi ${userName || 'there'}, you've been using Qrius Codes for a week now. You've seen how easy it is to create and track codes — here's what opens up on a paid plan.`
        }
      </Text>

      <EmailCard accent>
        <Text style={{ fontFamily: BRAND.sansFont, fontSize: '15px', color: BRAND.charcoal, lineHeight: '1.8', margin: 0 }}>
          ✦ More dynamic QR codes (up to unlimited){'\n'}
          ✦ Detailed scan analytics — geography, devices, time of day{'\n'}
          ✦ SVG and PDF downloads for print{'\n'}
          ✦ Team access — collaborate without sharing logins{'\n'}
          ✦ API access for programmatic QR generation
        </Text>
      </EmailCard>

      <Text style={{ fontFamily: BRAND.sansFont, fontSize: '16px', color: BRAND.charcoal, lineHeight: '1.6', margin: '0 0 24px' }}>
        {isLimit
          ? 'Upgrade now and pick up right where you left off — no interruption.'
          : 'Plans start at $12/month. No annual lock-in, cancel whenever.'
        }
      </Text>

      <div style={{ textAlign: 'center' as const, margin: '24px 0' }}>
        <EmailButton href={`${BRAND.appUrl}/pricing`}>See plans and pricing</EmailButton>
      </div>
    </EmailLayout>
  );
}
