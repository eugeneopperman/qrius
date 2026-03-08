import * as React from 'react';
import { Text, Link } from '@react-email/components';
import { EmailLayout } from '../_layout/EmailLayout.js';
import { EmailCard } from '../_layout/EmailCard.js';
import { BRAND } from '../_layout/styles.js';

interface ApiKeyCreatedEmailProps {
  userName?: string;
  keyName: string;
  keyPrefix: string;
}

export function ApiKeyCreatedEmail({ userName, keyName, keyPrefix }: ApiKeyCreatedEmailProps) {
  return (
    <EmailLayout preview={`New API key created: ${keyName}`}>
      <Text style={{ fontFamily: BRAND.serifFont, fontSize: '24px', fontWeight: 700, color: BRAND.ink, margin: '0 0 16px' }}>
        New API key created
      </Text>

      <Text style={{ fontFamily: BRAND.sansFont, fontSize: '16px', color: BRAND.charcoal, lineHeight: '1.6', margin: '0 0 16px' }}>
        Hi {userName || 'there'}, a new API key was created for your organization.
      </Text>

      <EmailCard accent>
        <Text style={{ fontFamily: BRAND.sansFont, fontSize: '14px', color: BRAND.charcoal, margin: '0 0 4px' }}>
          <strong>Name:</strong> {keyName}
        </Text>
        <Text style={{ fontFamily: BRAND.sansFont, fontSize: '14px', color: BRAND.charcoal, margin: 0 }}>
          <strong>Prefix:</strong> {keyPrefix}...
        </Text>
      </EmailCard>

      <Text style={{ fontFamily: BRAND.sansFont, fontSize: '14px', color: BRAND.charcoal, lineHeight: '1.6', margin: '16px 0 0' }}>
        If you didn't create this key, please{' '}
        <Link href={`${BRAND.appUrl}/settings?tab=api-keys`} style={{ color: BRAND.ember }}>
          review your API keys
        </Link>{' '}
        immediately.
      </Text>
    </EmailLayout>
  );
}
