import * as React from 'react';
import { Text } from '@react-email/components';
import { EmailLayout } from '../_layout/EmailLayout.js';
import { EmailButton } from '../_layout/EmailButton.js';
import { EmailCard } from '../_layout/EmailCard.js';
import { BRAND } from '../_layout/styles.js';

interface UsageWarningEmailProps {
  organizationName: string;
  resourceType: string;
  current: number;
  limit: number;
  percent: number;
  unsubscribeUrl: string;
}

export function UsageWarningEmail({
  organizationName,
  resourceType,
  current,
  limit,
  percent,
  unsubscribeUrl,
}: UsageWarningEmailProps) {
  const isCritical = percent >= 95;

  return (
    <EmailLayout
      preview={isCritical
        ? `${organizationName} is almost out of ${resourceType} — ${percent}% used`
        : `Heads up: ${organizationName} has used ${percent}% of its ${resourceType}`
      }
      unsubscribeUrl={unsubscribeUrl}
    >
      <Text style={{ fontFamily: BRAND.serifFont, fontSize: '24px', fontWeight: 700, color: BRAND.ink, margin: '0 0 16px' }}>
        {isCritical ? 'You're almost at your limit.' : 'A friendly heads up on usage.'}
      </Text>

      <Text style={{ fontFamily: BRAND.sansFont, fontSize: '16px', color: BRAND.charcoal, lineHeight: '1.6', margin: '0 0 16px' }}>
        {isCritical
          ? `${organizationName} has used ${percent}% of its ${resourceType} allowance. You're close to the ceiling — once you hit it, you won't be able to create new codes until you upgrade.`
          : `${organizationName} has used ${percent}% of its ${resourceType} allowance. No rush, but worth knowing about so you're not caught off guard.`
        }
      </Text>

      <EmailCard>
        <Text style={{ fontFamily: BRAND.sansFont, fontSize: '14px', color: BRAND.charcoal, margin: '0 0 4px' }}>
          <strong>{resourceType}:</strong> {current.toLocaleString()} of {limit.toLocaleString()} used
        </Text>
        <div style={{
          backgroundColor: BRAND.mist,
          borderRadius: '4px',
          height: '8px',
          marginTop: '8px',
          overflow: 'hidden',
        }}>
          <div style={{
            backgroundColor: isCritical ? BRAND.warning : BRAND.ember,
            height: '100%',
            width: `${Math.min(percent, 100)}%`,
            borderRadius: '4px',
          }} />
        </div>
      </EmailCard>

      <div style={{ textAlign: 'center' as const, margin: '24px 0' }}>
        <EmailButton href={`${BRAND.appUrl}/settings?tab=billing`}>
          {isCritical ? 'Upgrade now' : 'View plans'}
        </EmailButton>
      </div>
    </EmailLayout>
  );
}
