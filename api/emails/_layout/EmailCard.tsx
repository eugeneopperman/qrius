import * as React from 'react';
import { Section } from '@react-email/components';
import { BRAND } from './styles.js';

interface EmailCardProps {
  children: React.ReactNode;
  accent?: boolean;
}

export function EmailCard({ children, accent }: EmailCardProps) {
  return (
    <Section
      style={{
        backgroundColor: accent ? BRAND.emberLight : BRAND.white,
        border: accent ? 'none' : `1px solid ${BRAND.mist}`,
        borderRadius: '8px',
        padding: '20px 24px',
        marginBottom: '16px',
      }}
    >
      {children}
    </Section>
  );
}
