import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from '../stores/toastStore';
import { useAuthStore } from '../stores/authStore';
import type { QRCode } from '../types/database';

interface UseOrganizationQRCodesOptions {
  limit?: number;
}

export function useOrganizationQRCodes({ limit }: UseOrganizationQRCodesOptions = {}) {
  const { currentOrganization } = useAuthStore();
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchQRCodes = useCallback(async () => {
    if (!currentOrganization) return;

    setIsLoading(true);

    try {
      let query = supabase
        .from('qr_codes')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching QR codes:', error);
      } else {
        setQrCodes(data || []);
      }
    } catch (error) {
      console.error('Error fetching QR codes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentOrganization, limit]);

  useEffect(() => {
    fetchQRCodes();
  }, [fetchQRCodes]);

  const deleteQRCode = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('qr_codes').delete().eq('id', id);

      if (error) {
        console.error('Error deleting QR code:', error);
        toast.error('Failed to delete QR code. Please try again.');
        return false;
      }

      setQrCodes((prev) => prev.filter((qr) => qr.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting QR code:', error);
      toast.error('Failed to delete QR code. Please try again.');
      return false;
    }
  }, []);

  return {
    qrCodes,
    isLoading,
    deleteQRCode,
    refetch: fetchQRCodes,
  };
}
