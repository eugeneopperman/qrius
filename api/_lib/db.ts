// Database client for Neon Serverless Postgres
// Uses @neondatabase/serverless for serverless Postgres connections

import { neon } from '@neondatabase/serverless';

// Create SQL client from connection string
// In Vercel, this will be available as POSTGRES_URL or DATABASE_URL
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!connectionString) {
  // Intentional console.warn: called at module initialization before logger is available
  console.warn('No database connection string found. Set POSTGRES_URL or DATABASE_URL environment variable.');
}

export const sql = connectionString ? neon(connectionString) : null;

// Type definitions for database rows
export interface QRCodeRow {
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

export interface ScanEventRow {
  id: string;
  qr_code_id: string;
  scanned_at: Date;
  country_code: string | null;
  city: string | null;
  device_type: string | null;
  user_agent: string | null;
  ip_hash: string | null;
}

// Helper to convert database row to API response format
export function toQRCodeResponse(row: QRCodeRow, baseUrl: string) {
  return {
    id: row.id,
    short_code: row.short_code,
    tracking_url: `${baseUrl}/r/${row.short_code}`,
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

export function toScanEventResponse(row: ScanEventRow) {
  return {
    id: row.id,
    qrCodeId: row.qr_code_id,
    scannedAt: row.scanned_at instanceof Date ? row.scanned_at.toISOString() : row.scanned_at,
    countryCode: row.country_code,
    city: row.city,
    deviceType: row.device_type,
    userAgent: row.user_agent,
  };
}
