import { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { QRCodeList } from '../components/dashboard/QRCodeList';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';
import type { QRCode } from '../types/database';

export default function QRCodesPage() {
  const { currentOrganization } = useAuthStore();
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchQRCodes() {
      if (!currentOrganization) return;

      setIsLoading(true);

      try {
        const { data, error } = await supabase
          .from('qr_codes')
          .select('*')
          .eq('organization_id', currentOrganization.id)
          .order('created_at', { ascending: false });

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
    }

    fetchQRCodes();
  }, [currentOrganization]);

  const handleDeleteQR = async (id: string) => {
    try {
      const { error } = await supabase.from('qr_codes').delete().eq('id', id);

      if (error) {
        console.error('Error deleting QR code:', error);
        return;
      }

      setQrCodes(qrCodes.filter((qr) => qr.id !== id));
    } catch (error) {
      console.error('Error deleting QR code:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">QR Codes</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage and track all your QR codes
          </p>
        </div>

        {/* QR Code list */}
        <QRCodeList qrCodes={qrCodes} isLoading={isLoading} onDelete={handleDeleteQR} />
      </div>
    </DashboardLayout>
  );
}
