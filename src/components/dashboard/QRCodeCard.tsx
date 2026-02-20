import { MoreVertical, ExternalLink, BarChart2, Copy, Trash2 } from 'lucide-react';
import { memo } from 'react';
import { Link } from '@tanstack/react-router';
import type { QRCode } from '@/types/database';
import { toast } from '@/stores/toastStore';
import { Dropdown } from '../ui/Dropdown';
import { QRMiniPreview } from '../ui/QRMiniPreview';
import type { QRStyleOptionsForPreview } from '../ui/QRMiniPreview';

function extractStyleOptions(metadata: QRCode['metadata']): QRStyleOptionsForPreview | undefined {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return undefined;
  const m = metadata as Record<string, unknown>;
  if (!m.style_options || typeof m.style_options !== 'object' || Array.isArray(m.style_options)) return undefined;
  return m.style_options as QRStyleOptionsForPreview;
}

interface QRCodeCardProps {
  qrCode: QRCode;
  onDelete?: (id: string) => void;
}

export const QRCodeCard = memo(function QRCodeCard({ qrCode, onDelete }: QRCodeCardProps) {
  const handleCopyUrl = async (close: () => void) => {
    const trackingUrl = `${window.location.origin}/r/${qrCode.short_code}`;
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
  const savedStyle = extractStyleOptions(qrCode.metadata);

  return (
    <div className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden card-interactive ${!qrCode.is_active ? 'opacity-60' : ''}`}>
      {/* QR Preview */}
      <Link to="/qr-codes/$id" params={{ id: qrCode.id }} className="block">
        <div className="aspect-square p-6 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
          <div className="w-full h-full max-w-[200px] max-h-[200px] bg-white rounded-lg flex items-center justify-center overflow-hidden">
            <QRMiniPreview data={qrCode.destination_url} size={180} styleOptions={savedStyle} />
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
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
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
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <BarChart2 className="w-4 h-4" />
                  View Analytics
                </Link>
                <a
                  href={qrCode.destination_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open URL
                </a>
                <button
                  onClick={() => handleCopyUrl(close)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Copy className="w-4 h-4" />
                  Copy Tracking URL
                </button>
                <hr className="my-1 border-gray-200 dark:border-gray-700" />
                <button
                  onClick={() => handleDelete(close)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
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
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                Dynamic
              </span>
            ) : (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
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
  );
});
