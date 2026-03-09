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

interface MonthlyDigestEmailProps {
  userName?: string;
  monthName: string;
  totalScans: number;
  scanChange: number;
  topQRCodes: TopQR[];
  newQRCodes: number;
  totalActiveQRCodes: number;
  unsubscribeUrl: string;
}

export function MonthlyDigestEmail({
  userName,
  monthName,
  totalScans,
  scanChange,
  topQRCodes,
  newQRCodes,
  totalActiveQRCodes,
  unsubscribeUrl,
}: MonthlyDigestEmailProps) {
  const changeText = scanChange > 0
    ? `↑ ${scanChange}% vs ${getPreviousMonth(monthName)}`
    : scanChange < 0
      ? `↓ ${Math.abs(scanChange)}% vs ${getPreviousMonth(monthName)}`
      : `Holding steady vs ${getPreviousMonth(monthName)}`;

  const changeColor = scanChange > 0 ? BRAND.success : scanChange < 0 ? BRAND.warning : BRAND.charcoal;

  return (
    <EmailLayout preview={`${monthName}: ${totalScans.toLocaleString()} scans across ${totalActiveQRCodes} codes`} unsubscribeUrl={unsubscribeUrl}>
      <Text style={{ fontFamily: BRAND.serifFont, fontSize: '24px', fontWeight: 700, color: BRAND.ink, margin: '0 0 16px' }}>
        {monthName} — the full picture
      </Text>

      <Text style={{ fontFamily: BRAND.sansFont, fontSize: '16px', color: BRAND.charcoal, lineHeight: '1.6', margin: '0 0 16px' }}>
        Hi {userName || 'there'}, here's how your QR codes did last month.
      </Text>

      <EmailCard accent>
        <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
          <tr>
            <td style={{ textAlign: 'center' as const, padding: '8px' }}>
              <Text style={{ fontFamily: BRAND.sansFont, fontSize: '28px', fontWeight: 700, color: BRAND.ember, margin: '0 0 4px' }}>
                {totalScans.toLocaleString()}
              </Text>
              <Text style={{ fontFamily: BRAND.sansFont, fontSize: '12px', color: BRAND.charcoal, margin: 0 }}>
                scans
              </Text>
            </td>
            <td style={{ textAlign: 'center' as const, padding: '8px' }}>
              <Text style={{ fontFamily: BRAND.sansFont, fontSize: '28px', fontWeight: 700, color: BRAND.ink, margin: '0 0 4px' }}>
                {totalActiveQRCodes}
              </Text>
              <Text style={{ fontFamily: BRAND.sansFont, fontSize: '12px', color: BRAND.charcoal, margin: 0 }}>
                active codes
              </Text>
            </td>
            <td style={{ textAlign: 'center' as const, padding: '8px' }}>
              <Text style={{ fontFamily: BRAND.sansFont, fontSize: '28px', fontWeight: 700, color: BRAND.ink, margin: '0 0 4px' }}>
                {newQRCodes}
              </Text>
              <Text style={{ fontFamily: BRAND.sansFont, fontSize: '12px', color: BRAND.charcoal, margin: 0 }}>
                new codes
              </Text>
            </td>
          </tr>
        </table>
        <Text style={{ fontFamily: BRAND.sansFont, fontSize: '13px', color: changeColor, textAlign: 'center' as const, margin: '8px 0 0' }}>
          {changeText}
        </Text>
      </EmailCard>

      {topQRCodes.length > 0 && (
        <>
          <Text style={{ fontFamily: BRAND.sansFont, fontSize: '14px', fontWeight: 600, color: BRAND.ink, margin: '16px 0 8px' }}>
            Top performers
          </Text>
          {topQRCodes.map((qr, i) => (
            <Text key={i} style={{ fontFamily: BRAND.sansFont, fontSize: '14px', color: BRAND.charcoal, margin: '0 0 4px' }}>
              {i + 1}. {qr.name} — {qr.scans.toLocaleString()} scans
            </Text>
          ))}
        </>
      )}

      <div style={{ textAlign: 'center' as const, margin: '24px 0' }}>
        <EmailButton href={BRAND.dashboardUrl}>Explore your analytics</EmailButton>
      </div>
    </EmailLayout>
  );
}

function getPreviousMonth(monthName: string): string {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const idx = months.indexOf(monthName);
  return idx > 0 ? months[idx - 1] : months[11];
}
