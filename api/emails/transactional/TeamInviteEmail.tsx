import * as React from 'react';
import { Text } from '@react-email/components';
import { EmailLayout } from '../_layout/EmailLayout.js';
import { EmailButton } from '../_layout/EmailButton.js';
import { EmailCard } from '../_layout/EmailCard.js';
import { BRAND } from '../_layout/styles.js';

interface TeamInviteEmailProps {
  inviteeName?: string;
  inviterName: string;
  organizationName: string;
  role: string;
  inviteLink: string;
  expiresIn?: string;
}

export function TeamInviteEmail({
  inviteeName,
  inviterName,
  organizationName,
  role,
  inviteLink,
  expiresIn = '7 days',
}: TeamInviteEmailProps) {
  const name = inviteeName || 'there';

  return (
    <EmailLayout preview={`${inviterName} invited you to join ${organizationName} on Qrius Codes`}>
      <Text style={{ fontFamily: BRAND.serifFont, fontSize: '24px', fontWeight: 700, color: BRAND.ink, margin: '0 0 16px' }}>
        You've been invited!
      </Text>

      <Text style={{ fontFamily: BRAND.sansFont, fontSize: '16px', color: BRAND.charcoal, lineHeight: '1.6', margin: '0 0 16px' }}>
        Hi {name}, {inviterName} has invited you to join <strong>{organizationName}</strong> on Qrius Codes.
      </Text>

      <EmailCard accent>
        <Text style={{ fontFamily: BRAND.sansFont, fontSize: '14px', color: BRAND.charcoal, margin: '0 0 4px' }}>
          <strong>Organization:</strong> {organizationName}
        </Text>
        <Text style={{ fontFamily: BRAND.sansFont, fontSize: '14px', color: BRAND.charcoal, margin: '0 0 4px' }}>
          <strong>Role:</strong> {role.charAt(0).toUpperCase() + role.slice(1)}
        </Text>
        <Text style={{ fontFamily: BRAND.sansFont, fontSize: '14px', color: BRAND.charcoal, margin: 0 }}>
          <strong>Expires:</strong> {expiresIn}
        </Text>
      </EmailCard>

      <div style={{ textAlign: 'center' as const, margin: '24px 0' }}>
        <EmailButton href={inviteLink}>Accept invitation</EmailButton>
      </div>

      <Text style={{ fontFamily: BRAND.sansFont, fontSize: '13px', color: BRAND.charcoal, lineHeight: '1.6', margin: '16px 0 0' }}>
        If you weren't expecting this invitation, you can safely ignore this email.
      </Text>
    </EmailLayout>
  );
}
