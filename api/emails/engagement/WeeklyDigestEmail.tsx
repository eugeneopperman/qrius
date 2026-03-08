import * as React from 'react';
import { Text } from '@react-email/components';
import { EmailLayout } from '../_layout/EmailLayout.js';
import { EmailButton } from '../_layout/EmailButton.js';
import { EmailCard } from '../_layout/EmailCard.js';
import { BRAND } from '../_layout/styles.js';

interface TopQR {
  name: string;
  scans: number;
}

interface WeeklyDigestEmailProps {
  userName?: string;
  totalScans: number;
  scanChange: number; // percentage change vs previous week
  topQRCodes: TopQR[];
  newQRCodes: number;
  unsubscribeUrl: string;
}

export function WeeklyDigestEmail({
  userName,
  totalScans,
  scanChange,
  topQRCodes,
  newQRCodes,
  unsubscribeUrl,
}: WeeklyDigestEmailProps) {
  const changeText = scanChange > 0
    ? `↑ ${scanChange}% from last week`
    : scanChange < 0
      ? `↓ ${Math.abs(scanChange)}% from last week`
      : 'Same as last week';

  const changeColor = scanChange > 0 ? BRAND.success : scanChange < 0 ? BRAND.warning : BRAND.charcoal;

  return (
    <EmailLayout preview={`Your week: ${totalScans} scans`} unsubscribeUrl={unsubscribeUrl}>
      <Text style={{ fontFamily: BRAND.serifFont, fontSize: '24px', fontWeight: 700, color: BRAND.ink, margin: '0 0 16px' }}>
        Your weekly scan report
      </Text>

      <Text style={{ fontFamily: BRAND.sansFont, fontSize: '16px', color: BRAND.charcoal, lineHeight: '1.6', margin: '0 0 16px' }}>
        Hi {userName || 'there'}, here's how your QR codes performed this week.
      </Text>

      <EmailCard accent>
        <Text style={{ fontFamily: BRAND.sansFont, fontSize: '36px', fontWeight: 700, color: BRAND.ember, textAlign: 'center' as const, margin: '0 0 4px' }}>
          {totalScans.toLocaleString()}
        </Text>
        <Text style={{ fontFamily: BRAND.sansFont, fontSize: '14px', color: BRAND.charcoal, textAlign: 'center' as const, margin: '0 0 4px' }}>
          scans this week
        </Text>
        <Text style={{ fontFamily: BRAND.sansFont, fontSize: '13px', color: changeColor, textAlign: 'center' as const, margin: 0 }}>
          {changeText}
        </Text>
      </EmailCard>

      {topQRCodes.length > 0 && (
        <>
          <Text style={{ fontFamily: BRAND.sansFont, fontSize: '14px', fontWeight: 600, color: BRAND.ink, margin: '16px 0 8px' }}>
            Top QR codes
          </Text>
          {topQRCodes.map((qr, i) => (
            <Text key={i} style={{ fontFamily: BRAND.sansFont, fontSize: '14px', color: BRAND.charcoal, margin: '0 0 4px' }}>
              {i + 1}. {qr.name} — {qr.scans.toLocaleString()} scans
            </Text>
          ))}
        </>
      )}

      {newQRCodes > 0 && (
        <Text style={{ fontFamily: BRAND.sansFont, fontSize: '14px', color: BRAND.charcoal, margin: '16px 0 0' }}>
          📎 {newQRCodes} new QR code{newQRCodes === 1 ? '' : 's'} created this week
        </Text>
      )}

      <div style={{ textAlign: 'center' as const, margin: '24px 0' }}>
        <EmailButton href={BRAND.dashboardUrl}>View your dashboard →</EmailButton>
      </div>
    </EmailLayout>
  );
}
