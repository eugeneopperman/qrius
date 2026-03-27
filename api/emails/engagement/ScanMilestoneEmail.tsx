import * as React from 'react';
import { Text } from '@react-email/components';
import { EmailLayout } from '../_layout/EmailLayout.js';
import { EmailButton } from '../_layout/EmailButton.js';
import { EmailCard } from '../_layout/EmailCard.js';
import { BRAND } from '../_layout/styles.js';

interface ScanMilestoneEmailProps {
  userName?: string;
  qrCodeName: string;
  milestone: number;
  totalScans: number;
  unsubscribeUrl: string;
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`;
  return n.toLocaleString();
}

function getMilestoneMessage(milestone: number): string {
  if (milestone >= 10000) return 'That\'s serious reach. Whatever you\'re doing, it\'s working.';
  if (milestone >= 5000) return 'Five thousand people scanned your code. That\'s a packed concert venue.';
  if (milestone >= 1000) return 'A thousand scans — you\'ve officially gone from "trying QR codes" to running a tracked campaign.';
  if (milestone >= 500) return 'Five hundred scans and counting. People are clearly qrius.';
  if (milestone >= 100) return 'Triple digits. Your code is getting around.';
  if (milestone >= 50) return 'Fifty scans — your code is finding its audience.';
  return 'Your first double digits. The scans are rolling in.';
}

export function ScanMilestoneEmail({ userName, qrCodeName, milestone, totalScans, unsubscribeUrl }: ScanMilestoneEmailProps) {
  return (
    <EmailLayout preview={`"${qrCodeName}" just hit ${formatNumber(milestone)} scans`} unsubscribeUrl={unsubscribeUrl}>
      <Text style={{ fontFamily: BRAND.serifFont, fontSize: '24px', fontWeight: 700, color: BRAND.ink, margin: '0 0 16px' }}>
        {formatNumber(milestone)} scans on "{qrCodeName}"
      </Text>

      <Text style={{ fontFamily: BRAND.sansFont, fontSize: '16px', color: BRAND.charcoal, lineHeight: '1.6', margin: '0 0 16px' }}>
        Hi {userName || 'there'}, {getMilestoneMessage(milestone)}
      </Text>

      <EmailCard accent>
        <Text style={{ fontFamily: BRAND.sansFont, fontSize: '32px', fontWeight: 700, color: BRAND.ember, textAlign: 'center' as const, margin: '0 0 4px' }}>
          {formatNumber(totalScans)}
        </Text>
        <Text style={{ fontFamily: BRAND.sansFont, fontSize: '14px', color: BRAND.charcoal, textAlign: 'center' as const, margin: 0 }}>
          total scans and counting
        </Text>
      </EmailCard>

      <Text style={{ fontFamily: BRAND.sansFont, fontSize: '16px', color: BRAND.charcoal, lineHeight: '1.6', margin: '0 0 24px' }}>
        Check your analytics to see where the scans are coming from — you might be surprised.
      </Text>

      <div style={{ textAlign: 'center' as const, margin: '24px 0' }}>
        <EmailButton href={BRAND.dashboardUrl}>View analytics</EmailButton>
      </div>
    </EmailLayout>
  );
}
