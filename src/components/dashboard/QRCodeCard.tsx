import { MoreVertical, ExternalLink, BarChart2, Copy, Trash2 } from 'lucide-react';
import { memo } from 'react';
import { Link } from '@tanstack/react-router';
import type { QRCode } from '@/types/database';
import { toast } from '@/stores/toastStore';
import { Dropdown } from '../ui/Dropdown';
import { QRMiniPreview } from '../ui/QRMiniPreview';
import { extractStyleOptions } from '@/utils/extractStyleOptions';

interface QRCodeCardProps {
  qrCode: QRCode;
  onDelete?: (id: string) => void;
}

export const QRCodeCard = memo(function QRCodeCard({ qrCode, onDelete }: QRCodeCardProps) {
  const handleCopyUrl = async (close: () => void) => {
    const trackingUrl = qrCode.tracking_url || `${window.location.origin}/r/${qrCode.short_code}`;
    try {
      await navigator.clipboard.writeText(trackingUrl);
      toast.success('URL copied to clipboard');
    } catch {
      toast.error('Failed to copy to clipboard');
    }
    close();
  };

  const handleDelete = (close: () => void) => {
    if (onDelete) {
      onDelete(qrCode.id);
    }
    close();
  };

  const formattedDate = new Date(qrCode.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const isDynamic = !!qrCode.short_code;
  const isUrlType = qrCode.qr_type === 'url' || !qrCode.qr_type;
  const qrData = isUrlType && qrCode.tracking_url ? qrCode.tracking_url : qrCode.destination_url;
  const savedStyle = extractStyleOptions(qrCode.metadata);

  return (
    <div className={!qrCode.is_active ? 'opacity-60' : ''}>
      {/* MOBILE: compact horizontal row */}
      <div className="sm:hidden card-no-blur rounded-2xl overflow-hidden card-interactive">
        <div className="flex items-center gap-3 p-3">
          <Link to="/qr-codes/$id" params={{ id: qrCode.id }} className="flex-shrink-0">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center overflow-hidden">
              <QRMiniPreview data={qrData} size={48} styleOptions={savedStyle} />
            </div>
          </Link>
          <Link to="/qr-codes/$id" params={{ id: qrCode.id }} className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {qrCode.name || `QR ${qrCode.short_code}`}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
              {qrCode.destination_url}
            </p>
          </Link>
          <div className="flex items-center gap-2 flex-shrink-0">
            {isDynamic && (
              <span className="text-xs text-orange-600 dark:text-orange-400 font-semibold">
                {qrCode.total_scans}
              </span>
            )}
            <Dropdown
              align="right"
              trigger={({ toggle }) => (
                <button
                  onClick={toggle}
                  className="btn-icon"
                  aria-label="QR code actions"
                >
                  <MoreVertical className="w-5 h-5 text-gray-400" />
                </button>
              )}
            >
              {({ close }) => (
                <div className="w-48 py-1">
                  <Link
                    to="/qr-codes/$id"
                    params={{ id: qrCode.id }}
                    onClick={close}
                    className="flex items-center gap-2 px-4 py-2.5 min-h-[44px] text-sm text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    <BarChart2 className="w-4 h-4" />
                    View Analytics
                  </Link>
                  <button
                    onClick={() => handleCopyUrl(close)}
                    className="w-full flex items-center gap-2 px-4 py-2.5 min-h-[44px] text-sm text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Tracking URL
                  </button>
                  <hr className="my-1 border-divider" />
                  <button
                    onClick={() => handleDelete(close)}
                    className="w-full flex items-center gap-2 px-4 py-2.5 min-h-[44px] text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              )}
            </Dropdown>
          </div>
        </div>
      </div>

      {/* DESKTOP: existing vertical card */}
      <div className="hidden sm:block card-no-blur rounded-2xl overflow-hidden card-interactive">
        {/* QR Preview */}
        <Link to="/qr-codes/$id" params={{ id: qrCode.id }} className="block">
          <div className="aspect-square p-6 bg-black/5 dark:bg-white/5 flex items-center justify-center">
            <div className="w-full h-full max-w-[200px] max-h-[200px] bg-white rounded-xl flex items-center justify-center overflow-hidden">
              <QRMiniPreview data={qrData} size={180} styleOptions={savedStyle} />
            </div>
          </div>
        </Link>

        {/* Details */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-medium text-gray-900 dark:text-white truncate">
                  {qrCode.name || `QR Code ${qrCode.short_code}`}
                </h3>
                {!qrCode.is_active && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex-shrink-0">
                    Inactive
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {qrCode.destination_url}
              </p>
            </div>

            {/* Menu */}
            <Dropdown
              align="right"
              trigger={({ toggle }) => (
                <button
                  onClick={toggle}
                  className="btn-icon"
                  aria-label="QR code actions"
                >
                  <MoreVertical className="w-5 h-5 text-gray-400" />
                </button>
              )}
            >
              {({ close }) => (
                <div className="w-48 py-1">
                  <Link
                    to="/qr-codes/$id"
                    params={{ id: qrCode.id }}
                    onClick={close}
                    className="flex items-center gap-2 px-4 py-2.5 min-h-[44px] text-sm text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    <BarChart2 className="w-4 h-4" />
                    View Analytics
                  </Link>
                  <a
                    href={qrCode.destination_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 min-h-[44px] text-sm text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open URL
                  </a>
                  <button
                    onClick={() => handleCopyUrl(close)}
                    className="w-full flex items-center gap-2 px-4 py-2.5 min-h-[44px] text-sm text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Tracking URL
                  </button>
                  <hr className="my-1 border-divider" />
                  <button
                    onClick={() => handleDelete(close)}
                    className="w-full flex items-center gap-2 px-4 py-2.5 min-h-[44px] text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              )}
            </Dropdown>
          </div>

          {/* Stats */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 dark:text-gray-400">{formattedDate}</span>
              {isDynamic ? (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-orange-500/12 dark:bg-orange-400/10 text-orange-600 dark:text-orange-400">
                  Dynamic
                </span>
              ) : (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-black/5 dark:bg-white/5 text-gray-500 dark:text-gray-400">
                  Static
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
              <BarChart2 className="w-4 h-4" />
              <span className="font-medium">{isDynamic ? `${qrCode.total_scans} scans` : '—'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
