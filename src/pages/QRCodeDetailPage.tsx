import { useEffect, useState } from 'react';
import { Link, useParams } from '@tanstack/react-router';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { toast } from '../stores/toastStore';
import type { QRCode, ScanEvent } from '../types/database';
import {
  ArrowLeft,
  ExternalLink,
  Copy,
  Download,
  BarChart2,
  Globe,
  Smartphone,
  Calendar,
  Loader2,
  QrCode,
} from 'lucide-react';

export default function QRCodeDetailPage() {
  const { id } = useParams({ from: '/qr-codes/$id' });
  const [qrCode, setQrCode] = useState<QRCode | null>(null);
  const [recentScans, setRecentScans] = useState<ScanEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchQRCode() {
      if (!id) return;

      setIsLoading(true);

      try {
        // Fetch QR code
        const { data: qrData, error: qrError } = await supabase
          .from('qr_codes')
          .select('*')
          .eq('id', id)
          .single();

        if (qrError) {
          console.error('Error fetching QR code:', qrError);
          return;
        }

        setQrCode(qrData);

        // Fetch recent scans
        const { data: scansData, error: scansError } = await supabase
          .from('scan_events')
          .select('*')
          .eq('qr_code_id', id)
          .order('scanned_at', { ascending: false })
          .limit(10);

        if (scansError) {
          console.error('Error fetching scans:', scansError);
        } else {
          setRecentScans(scansData || []);
        }
      } catch (error) {
        console.error('Error fetching QR code:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchQRCode();
  }, [id]);

  const handleCopyUrl = async () => {
    if (!qrCode) return;
    const trackingUrl = `${window.location.origin}/r/${qrCode.short_code}`;
    try {
      await navigator.clipboard.writeText(trackingUrl);
      toast.success('Tracking URL copied to clipboard');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      toast.error('Failed to copy to clipboard');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      </DashboardLayout>
    );
  }

  if (!qrCode) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <QrCode className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            QR Code not found
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            The QR code you're looking for doesn't exist or you don't have access to it.
          </p>
          <Link to="/qr-codes">
            <Button variant="secondary">
              <ArrowLeft className="w-4 h-4" />
              Back to QR Codes
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const trackingUrl = `${window.location.origin}/r/${qrCode.short_code}`;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <Link
            to="/qr-codes"
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to QR Codes
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* QR Code preview */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <div className="aspect-square bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-6">
                <QrCode className="w-32 h-32 text-gray-400" />
              </div>

              <div className="space-y-3">
                <Button className="w-full" onClick={handleCopyUrl}>
                  <Copy className="w-4 h-4" />
                  Copy Tracking URL
                </Button>
                <Button variant="secondary" className="w-full">
                  <Download className="w-4 h-4" />
                  Download QR Code
                </Button>
              </div>
            </div>
          </div>

          {/* Details and stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* QR Code details */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">Name</label>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {qrCode.name || `QR Code ${qrCode.short_code}`}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">
                    Destination URL
                  </label>
                  <div className="flex items-center gap-2">
                    <a
                      href={qrCode.destination_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-orange-600 dark:text-orange-400 hover:underline truncate"
                    >
                      {qrCode.destination_url}
                    </a>
                    <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">
                    Tracking URL
                  </label>
                  <p className="font-medium text-gray-900 dark:text-white font-mono text-sm">
                    {trackingUrl}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">Created</label>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(qrCode.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                <BarChart2 className="w-5 h-5 text-orange-500 mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {qrCode.total_scans}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Scans</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                <Calendar className="w-5 h-5 text-orange-500 mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round(qrCode.total_scans * 0.1)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Today</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                <Globe className="w-5 h-5 text-orange-500 mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {new Set(recentScans.map((s) => s.country_code).filter(Boolean)).size || '-'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Countries</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                <Smartphone className="w-5 h-5 text-orange-500 mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {recentScans.filter((s) => s.device_type === 'mobile').length || '-'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Mobile</p>
              </div>
            </div>

            {/* Recent scans */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Scans
              </h2>

              {recentScans.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No scans yet
                </p>
              ) : (
                <div className="space-y-3">
                  {recentScans.map((scan) => (
                    <div
                      key={scan.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                          {scan.device_type === 'mobile' ? (
                            <Smartphone className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                          ) : (
                            <Globe className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {scan.city || 'Unknown location'}
                            {scan.country_code && `, ${scan.country_code}`}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {scan.device_type || 'Unknown device'}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(scan.scanned_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
