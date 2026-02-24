import { describe, it, expect } from 'vitest';

// Mirror the toQRCodeResponse logic from api/_lib/db.ts for testing
interface QRCodeRow {
  id: string;
  short_code: string;
  destination_url: string;
  qr_type: string;
  original_data: unknown;
  is_active: boolean;
  total_scans: number;
  user_id: string | null;
  organization_id: string | null;
  name: string | null;
  description: string | null;
  tags: string[];
  metadata: unknown;
  created_at: Date;
  updated_at: Date;
}

function toQRCodeResponse(row: QRCodeRow, baseUrl: string, customDomain?: string | null) {
  const trackingBase = customDomain ? `https://${customDomain}` : baseUrl;
  return {
    id: row.id,
    short_code: row.short_code,
    tracking_url: `${trackingBase}/r/${row.short_code}`,
    destination_url: row.destination_url,
    qr_type: row.qr_type,
    original_data: row.original_data,
    is_active: row.is_active,
    total_scans: row.total_scans,
    user_id: row.user_id,
    organization_id: row.organization_id,
    name: row.name,
    description: row.description,
    tags: row.tags || [],
    metadata: row.metadata || {},
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    updated_at: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
  };
}

const mockRow: QRCodeRow = {
  id: '123',
  short_code: 'xK9mP2',
  destination_url: 'https://example.com',
  qr_type: 'url',
  original_data: null,
  is_active: true,
  total_scans: 42,
  user_id: 'user-1',
  organization_id: 'org-1',
  name: 'Test QR',
  description: null,
  tags: ['tag1'],
  metadata: { style_options: {} },
  created_at: new Date('2024-01-15'),
  updated_at: new Date('2024-01-15'),
};

describe('toQRCodeResponse', () => {
  it('uses baseUrl when no custom domain provided', () => {
    const result = toQRCodeResponse(mockRow, 'https://myapp.vercel.app');
    expect(result.tracking_url).toBe('https://myapp.vercel.app/r/xK9mP2');
  });

  it('uses baseUrl when customDomain is null', () => {
    const result = toQRCodeResponse(mockRow, 'https://myapp.vercel.app', null);
    expect(result.tracking_url).toBe('https://myapp.vercel.app/r/xK9mP2');
  });

  it('uses baseUrl when customDomain is undefined', () => {
    const result = toQRCodeResponse(mockRow, 'https://myapp.vercel.app', undefined);
    expect(result.tracking_url).toBe('https://myapp.vercel.app/r/xK9mP2');
  });

  it('uses custom domain when provided', () => {
    const result = toQRCodeResponse(mockRow, 'https://myapp.vercel.app', 'track.acme.com');
    expect(result.tracking_url).toBe('https://track.acme.com/r/xK9mP2');
  });

  it('always includes /r/ prefix in tracking URL', () => {
    const result = toQRCodeResponse(mockRow, 'https://myapp.vercel.app', 'qr.brand.io');
    expect(result.tracking_url).toMatch(/\/r\/xK9mP2$/);
  });

  it('preserves all other fields', () => {
    const result = toQRCodeResponse(mockRow, 'https://myapp.vercel.app', 'track.acme.com');
    expect(result.id).toBe('123');
    expect(result.short_code).toBe('xK9mP2');
    expect(result.destination_url).toBe('https://example.com');
    expect(result.is_active).toBe(true);
    expect(result.total_scans).toBe(42);
    expect(result.tags).toEqual(['tag1']);
  });
});
