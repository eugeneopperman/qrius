import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { QRCode, ScanEvent } from '@/types/database';

interface QRCodeDetail {
  qrCode: QRCode;
  recentScans: ScanEvent[];
}

async function fetchQRCodeDetail(id: string): Promise<QRCodeDetail | null> {
  const { data: qrData, error: qrError } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('id', id)
    .single();

  if (qrError) {
    console.error('Error fetching QR code:', qrError);
    return null;
  }

  const { data: scansData, error: scansError } = await supabase
    .from('scan_events')
    .select('*')
    .eq('qr_code_id', id)
    .order('scanned_at', { ascending: false })
    .limit(10);

  if (scansError) {
    console.error('Error fetching scans:', scansError);
  }

  return {
    qrCode: qrData,
    recentScans: scansData || [],
  };
}

export function useQRCodeDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['qr-code-detail', id],
    queryFn: () => fetchQRCodeDetail(id!),
    enabled: !!id,
  });
}
