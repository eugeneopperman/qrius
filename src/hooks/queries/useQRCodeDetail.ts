import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { QRCode, ScanEvent } from '@/types/database';

interface QRCodeDetail {
  qrCode: QRCode;
  recentScans: ScanEvent[];
  scansToday: number;
  scansThisWeek: number;
  scansThisMonth: number;
}

async function fetchQRCodeDetail(id: string): Promise<QRCodeDetail | null> {
  const { data: qrData, error: qrError } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('id', id)
    .single();

  if (qrError) {
    if (import.meta.env.DEV) console.error('Error fetching QR code:', qrError);
    return null;
  }

  const { data: scansData, error: scansError } = await supabase
    .from('scan_events')
    .select('*')
    .eq('qr_code_id', id)
    .order('scanned_at', { ascending: false })
    .limit(10);

  if (scansError) {
    if (import.meta.env.DEV) console.error('Error fetching scans:', scansError);
  }

  // Calculate scan stats client-side from recent data
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(todayStart);
  monthStart.setDate(monthStart.getDate() - 30);

  const allScans = scansData || [];
  const scansToday = allScans.filter((s) => new Date(s.scanned_at) >= todayStart).length;
  const scansThisWeek = allScans.filter((s) => new Date(s.scanned_at) >= weekStart).length;
  const scansThisMonth = allScans.filter((s) => new Date(s.scanned_at) >= monthStart).length;

  return {
    qrCode: qrData,
    recentScans: allScans,
    scansToday,
    scansThisWeek,
    scansThisMonth,
  };
}

export function useQRCodeDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['qr-code-detail', id],
    queryFn: () => fetchQRCodeDetail(id!),
    enabled: !!id,
  });
}
