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
  if (n >= 10000) return `${(n / 1000).toFixed(1)}K`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function ScanMilestoneEmail({ userName, qrCodeName, milestone, totalScans, unsubscribeUrl }: ScanMilestoneEmailProps) {
  return (
    <EmailLayout preview={`${formatNumber(milestone)} scans reached — ${qrCodeName}`} unsubscribeUrl={unsubscribeUrl}>
      <Text style={{ fontFamily: BRAND.serifFont, fontSize: '24px', fontWeight: 700, color: BRAND.ink, margin: '0 0 16px' }}>
        {formatNumber(milestone)} scans! 🎉
      </Text>

      <Text style={{ fontFamily: BRAND.sansFont, fontSize: '16px', color: BRAND.charcoal, lineHeight: '1.6', margin: '0 0 16px' }}>
        Hi {userName || 'there'}, your QR code <strong>"{qrCodeName}"</strong> just hit {formatNumber(milestone)} scans!
      </Text>

      <EmailCard accent>
        <Text style={{ fontFamily: BRAND.sansFont, fontSize: '32px', fontWeight: 700, color: BRAND.ember, textAlign: 'center' as const, margin: '0 0 4px' }}>
          {formatNumber(totalScans)}
        </Text>
        <Text style={{ fontFamily: BRAND.sansFont, fontSize: '14px', color: BRAND.charcoal, textAlign: 'center' as const, margin: 0 }}>
          total scans
        </Text>
      </EmailCard>

      <div style={{ textAlign: 'center' as const, margin: '24px 0' }}>
        <EmailButton href={BRAND.dashboardUrl}>View full analytics</EmailButton>
      </div>
    </EmailLayout>
  );
}
