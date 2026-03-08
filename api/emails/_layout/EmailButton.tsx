import * as React from 'react';
import { Button } from '@react-email/components';
import { BRAND } from './styles.js';

interface EmailButtonProps {
  href: string;
  children: React.ReactNode;
}

export function EmailButton({ href, children }: EmailButtonProps) {
  return (
    <Button
      href={href}
      style={{
        backgroundColor: BRAND.ember,
        color: BRAND.white,
        fontFamily: BRAND.sansFont,
        fontSize: '16px',
        fontWeight: 600,
        textDecoration: 'none',
        textAlign: 'center' as const,
        display: 'inline-block',
        borderRadius: BRAND.buttonRadius,
        padding: '14px 28px',
      }}
    >
      {children}
    </Button>
  );
}
