import { useQuery } from '@tanstack/react-query';
import { getSession } from '@/lib/supabase';
import type { QRCode, ScanEvent } from '@/types/database';

interface QRCodeDetail {
  qrCode: QRCode;
  recentScans: ScanEvent[];
  scansToday: number;
  scansThisWeek: number;
  scansThisMonth: number;
  topCountries: { countryCode: string; count: number }[];
  deviceBreakdown: { deviceType: string; count: number }[];
}

interface APIDetailResponse {
  id: string;
  short_code: string;
  tracking_url: string;
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
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  scansToday: number;
  scansThisWeek: number;
  scansThisMonth: number;
  topCountries: { countryCode: string; count: number }[];
  deviceBreakdown: { deviceType: string; count: number }[];
  recentScans: {
    id: string;
    qrCodeId: string;
    scannedAt: string;
    countryCode: string | null;
    city: string | null;
    deviceType: string | null;
    userAgent: string | null;
  }[];
}

async function fetchQRCodeDetail(id: string): Promise<QRCodeDetail | null> {
  const session = await getSession();

  const headers: Record<string, string> = {};
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  const response = await fetch(`/api/qr-codes/${id}`, { headers });

  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error('Failed to fetch QR code details');
  }

  const data: APIDetailResponse = await response.json();

  // Map API response to frontend types
  const qrCode: QRCode = {
    id: data.id,
    short_code: data.short_code,
    destination_url: data.destination_url,
    qr_type: data.qr_type,
    original_data: data.original_data,
    is_active: data.is_active,
    total_scans: data.total_scans,
    user_id: data.user_id,
    organization_id: data.organization_id,
    name: data.name,
    description: data.description,
    tags: data.tags || [],
    metadata: data.metadata || {},
    created_at: data.created_at,
    updated_at: data.updated_at,
  };

  const recentScans: ScanEvent[] = (data.recentScans || []).map((scan) => ({
    id: scan.id,
    qr_code_id: scan.qrCodeId,
    scanned_at: scan.scannedAt,
    country_code: scan.countryCode,
    city: scan.city,
    device_type: scan.deviceType,
    user_agent: scan.userAgent,
    ip_hash: null,
  }));

  return {
    qrCode,
    recentScans,
    scansToday: data.scansToday,
    scansThisWeek: data.scansThisWeek,
    scansThisMonth: data.scansThisMonth,
    topCountries: data.topCountries || [],
    deviceBreakdown: data.deviceBreakdown || [],
  };
}

export function useQRCodeDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['qr-code-detail', id],
    queryFn: () => fetchQRCodeDetail(id!),
    enabled: !!id,
  });
}
