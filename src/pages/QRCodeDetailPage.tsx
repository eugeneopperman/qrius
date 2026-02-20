import { useRef, useState, useCallback } from 'react';
import { Link, useParams, useNavigate } from '@tanstack/react-router';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from '@/stores/toastStore';
import { useQRCodeDetail } from '@/hooks/queries/useQRCodeDetail';
import { QRMiniPreview } from '@/components/ui/QRMiniPreview';
import type { QRMiniPreviewHandle } from '@/components/ui/QRMiniPreview';
import { getSession } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
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
  Pencil,
  Check,
  X,
  Trash2,
  Power,
  PowerOff,
} from 'lucide-react';

export default function QRCodeDetailPage() {
  const { id } = useParams({ from: '/qr-codes/$id' });
  const { data, isLoading } = useQRCodeDetail(id);
  const qrPreviewRef = useRef<QRMiniPreviewHandle>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Edit state
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [editUrl, setEditUrl] = useState('');
  const [isSavingUrl, setIsSavingUrl] = useState(false);

  // Delete state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Deactivation state
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [isTogglingActive, setIsTogglingActive] = useState(false);

  const qrCode = data?.qrCode ?? null;
  const recentScans = data?.recentScans ?? [];

  const handleCopyUrl = async () => {
    if (!qrCode) return;
    const trackingUrl = `${window.location.origin}/r/${qrCode.short_code}`;
    try {
      await navigator.clipboard.writeText(trackingUrl);
      toast.success('Tracking URL copied to clipboard');
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  const startEditUrl = useCallback(() => {
    if (!qrCode) return;
    setEditUrl(qrCode.destination_url);
    setIsEditingUrl(true);
  }, [qrCode]);

  const cancelEditUrl = useCallback(() => {
    setIsEditingUrl(false);
    setEditUrl('');
  }, []);

  const saveUrl = useCallback(async () => {
    if (!qrCode || !editUrl.trim()) return;

    setIsSavingUrl(true);
    try {
      const session = await getSession();
      if (!session?.access_token) {
        toast.error('Please sign in to edit');
        return;
      }

      const response = await fetch(`/api/qr-codes/${qrCode.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ destination_url: editUrl.trim() }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update');
      }

      queryClient.invalidateQueries({ queryKey: ['qr-code-detail', qrCode.id] });
      queryClient.invalidateQueries({ queryKey: ['qr-codes'] });
      toast.success('Destination URL updated');
      setIsEditingUrl(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update URL');
    } finally {
      setIsSavingUrl(false);
    }
  }, [qrCode, editUrl, queryClient]);

  const handleDelete = useCallback(async () => {
    if (!qrCode) return;

    setIsDeleting(true);
    try {
      const session = await getSession();
      if (!session?.access_token) {
        toast.error('Please sign in');
        return;
      }

      const response = await fetch(`/api/qr-codes/${qrCode.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete');
      }

      queryClient.invalidateQueries({ queryKey: ['qr-codes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('QR code deleted');
      navigate({ to: '/qr-codes' });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }, [qrCode, queryClient, navigate]);

  const handleToggleActive = useCallback(async () => {
    if (!qrCode) return;

    setIsTogglingActive(true);
    try {
      const session = await getSession();
      if (!session?.access_token) {
        toast.error('Please sign in');
        return;
      }

      const newState = !qrCode.is_active;
      const response = await fetch(`/api/qr-codes/${qrCode.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ is_active: newState }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update');
      }

      queryClient.invalidateQueries({ queryKey: ['qr-code-detail', qrCode.id] });
      queryClient.invalidateQueries({ queryKey: ['qr-codes'] });
      toast.success(newState ? 'QR code activated' : 'QR code deactivated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update');
    } finally {
      setIsTogglingActive(false);
      setShowDeactivateConfirm(false);
    }
  }, [qrCode, queryClient]);

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
  const isUrlType = qrCode.qr_type === 'url' || !qrCode.qr_type;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link
            to="/qr-codes"
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to QR Codes
          </Link>

          <div className="flex items-center gap-2">
            {/* Active/Inactive badge */}
            {qrCode.is_active ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                <Power className="w-3 h-3" />
                Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                <PowerOff className="w-3 h-3" />
                Inactive
              </span>
            )}

            {/* Dynamic badge */}
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
              Dynamic
            </span>

            {/* Toggle active button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                if (qrCode.is_active) {
                  setShowDeactivateConfirm(true);
                } else {
                  handleToggleActive();
                }
              }}
              disabled={isTogglingActive}
            >
              {isTogglingActive ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : qrCode.is_active ? (
                <>
                  <PowerOff className="w-4 h-4" />
                  Deactivate
                </>
              ) : (
                <>
                  <Power className="w-4 h-4" />
                  Activate
                </>
              )}
            </Button>

            {/* Delete button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* QR Code preview */}
          <div className="lg:col-span-1">
            <div className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 ${!qrCode.is_active ? 'opacity-60' : ''}`}>
              <div className="aspect-square bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-6 overflow-hidden">
                <QRMiniPreview ref={qrPreviewRef} data={qrCode.destination_url} size={240} />
              </div>

              <div className="space-y-3">
                <Button className="w-full" onClick={handleCopyUrl}>
                  <Copy className="w-4 h-4" />
                  Copy Tracking URL
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    const fileName = qrCode.name || `qr-${qrCode.short_code}`;
                    qrPreviewRef.current?.download(fileName, 'png');
                  }}
                >
                  <Download className="w-4 h-4" />
                  Download QR Code
                </Button>
              </div>
            </div>
          </div>

          {/* Details and stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* QR Code details */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
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
                    Destination {isUrlType ? 'URL' : 'Content'}
                  </label>
                  {isEditingUrl ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        value={editUrl}
                        onChange={(e) => setEditUrl(e.target.value)}
                        placeholder={isUrlType ? 'https://example.com' : 'Content value'}
                        className="flex-1"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveUrl();
                          if (e.key === 'Escape') cancelEditUrl();
                        }}
                      />
                      <Button
                        size="sm"
                        onClick={saveUrl}
                        disabled={isSavingUrl || !editUrl.trim()}
                      >
                        {isSavingUrl ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                      </Button>
                      <Button size="sm" variant="secondary" onClick={cancelEditUrl}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <a
                        href={isUrlType ? qrCode.destination_url : undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-orange-600 dark:text-orange-400 hover:underline truncate"
                      >
                        {qrCode.destination_url}
                      </a>
                      {isUrlType && (
                        <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      )}
                      <button
                        onClick={startEditUrl}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex-shrink-0"
                        title="Edit destination"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-500 dark:text-gray-400">
                    Tracking URL
                  </label>
                  <p className="font-medium text-gray-900 dark:text-white font-mono text-sm">
                    {trackingUrl}
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <div>
                    <label className="text-sm text-gray-500 dark:text-gray-400">Type</label>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">
                      {qrCode.qr_type || 'url'}
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
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4">
                <BarChart2 className="w-5 h-5 text-orange-500 mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {qrCode.total_scans}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Scans</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4">
                <Calendar className="w-5 h-5 text-orange-500 mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {data?.scansToday ?? '—'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Today</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4">
                <Globe className="w-5 h-5 text-orange-500 mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {new Set(recentScans.map((s) => s.country_code).filter(Boolean)).size || '-'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Countries</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4">
                <Smartphone className="w-5 h-5 text-orange-500 mb-2" />
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {recentScans.filter((s) => s.device_type === 'mobile').length || '-'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Mobile</p>
              </div>
            </div>

            {/* Recent scans */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
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

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete QR Code"
        message={`Are you sure you want to delete ${qrCode?.name || 'this QR code'}? This action cannot be undone and all scan history will be lost.`}
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
        cancelLabel="Cancel"
        variant="danger"
      />

      {/* Deactivate confirmation */}
      <ConfirmDialog
        isOpen={showDeactivateConfirm}
        onClose={() => setShowDeactivateConfirm(false)}
        onConfirm={handleToggleActive}
        title="Deactivate QR Code"
        message="Deactivated QR codes will show an error page when scanned. You can reactivate it at any time."
        confirmLabel={isTogglingActive ? 'Deactivating...' : 'Deactivate'}
        cancelLabel="Cancel"
        variant="danger"
      />
    </DashboardLayout>
  );
}
