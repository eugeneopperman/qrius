import * as React from 'react';
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Img,
  Text,
  Hr,
  Link,
  Preview,
} from '@react-email/components';
import { BRAND } from './styles.js';

interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
  unsubscribeUrl?: string;
}

export function EmailLayout({ preview, children, unsubscribeUrl }: EmailLayoutProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: BRAND.snow, margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: `${BRAND.maxWidth}px`, margin: '0 auto', padding: '40px 20px' }}>
          {/* Header */}
          <Section style={{ textAlign: 'center' as const, marginBottom: '32px' }}>
            <Img
              src={BRAND.iconUrl}
              alt="Qrius Codes"
              width="40"
              height="40"
              style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '10px' }}
            />
            <Text
              style={{
                display: 'inline',
                fontFamily: BRAND.serifFont,
                fontSize: '22px',
                fontWeight: 700,
                color: BRAND.ink,
                verticalAlign: 'middle',
              }}
            >
              Qrius Codes
            </Text>
          </Section>

          {/* Body */}
          <Section
            style={{
              backgroundColor: BRAND.white,
              border: `1px solid ${BRAND.mist}`,
              borderRadius: BRAND.borderRadius,
              padding: '32px',
            }}
          >
            {children}
          </Section>

          {/* Footer */}
          <Section style={{ textAlign: 'center' as const, marginTop: '32px' }}>
            <Text
              style={{
                fontFamily: BRAND.serifFont,
                fontSize: '16px',
                fontStyle: 'italic',
                color: BRAND.charcoal,
                margin: '0 0 16px',
              }}
            >
              {BRAND.tagline}
            </Text>

            <Hr style={{ borderColor: BRAND.mist, margin: '16px 0' }} />

            {unsubscribeUrl && (
              <Text style={{ fontFamily: BRAND.sansFont, fontSize: '12px', color: BRAND.charcoal, margin: '0 0 8px' }}>
                <Link href={unsubscribeUrl} style={{ color: BRAND.charcoal, textDecoration: 'underline' }}>
                  Unsubscribe
                </Link>
                {' from these emails'}
              </Text>
            )}

            <Text style={{ fontFamily: BRAND.sansFont, fontSize: '12px', color: BRAND.charcoal, margin: 0 }}>
              © {new Date().getFullYear()} Qrius Codes. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
