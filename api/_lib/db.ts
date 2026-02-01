// Database client for Neon Serverless Postgres
// Uses @neondatabase/serverless for serverless Postgres connections

import { neon } from '@neondatabase/serverless';

// Create SQL client from connection string
// In Vercel, this will be available as POSTGRES_URL or DATABASE_URL
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!connectionString) {
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
    shortCode: row.short_code,
    trackingUrl: `${baseUrl}/r/${row.short_code}`,
    destinationUrl: row.destination_url,
    qrType: row.qr_type,
    originalData: row.original_data,
    isActive: row.is_active,
    totalScans: row.total_scans,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
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
