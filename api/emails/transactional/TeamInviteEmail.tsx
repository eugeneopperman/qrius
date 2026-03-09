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
    <EmailLayout preview={`${inviterName} wants you on the team — join ${organizationName} on Qrius Codes`}>
      <Text style={{ fontFamily: BRAND.serifFont, fontSize: '24px', fontWeight: 700, color: BRAND.ink, margin: '0 0 16px' }}>
        You've got a seat at the table.
      </Text>

      <Text style={{ fontFamily: BRAND.sansFont, fontSize: '16px', color: BRAND.charcoal, lineHeight: '1.6', margin: '0 0 16px' }}>
        Hi {name}, {inviterName} invited you to join <strong>{organizationName}</strong> on Qrius Codes. You'll be able to create, manage, and track QR codes together.
      </Text>

      <EmailCard accent>
        <Text style={{ fontFamily: BRAND.sansFont, fontSize: '14px', color: BRAND.charcoal, margin: '0 0 4px' }}>
          <strong>Team:</strong> {organizationName}
        </Text>
        <Text style={{ fontFamily: BRAND.sansFont, fontSize: '14px', color: BRAND.charcoal, margin: '0 0 4px' }}>
          <strong>Your role:</strong> {role.charAt(0).toUpperCase() + role.slice(1)}
        </Text>
        <Text style={{ fontFamily: BRAND.sansFont, fontSize: '14px', color: BRAND.charcoal, margin: 0 }}>
          <strong>Link expires in:</strong> {expiresIn}
        </Text>
      </EmailCard>

      <div style={{ textAlign: 'center' as const, margin: '24px 0' }}>
        <EmailButton href={inviteLink}>Join the team</EmailButton>
      </div>

      <Text style={{ fontFamily: BRAND.sansFont, fontSize: '13px', color: BRAND.charcoal, lineHeight: '1.6', margin: '16px 0 0' }}>
        Wasn't expecting this? No worries — just ignore this email and nothing happens.
      </Text>
    </EmailLayout>
  );
}
