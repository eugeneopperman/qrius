import { memo, useMemo, useRef, useCallback } from 'react';
import { Link } from '@tanstack/react-router';
import {
  Download,
  MoreHorizontal,
  Pencil,
  Pause,
  Play,
  FolderInput,
  BarChart3,
  Copy,
  Trash2,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { QRMiniPreview, type QRMiniPreviewHandle } from '@/components/ui/QRMiniPreview';
import type { QRStyleOptionsForPreview } from '@/components/ui/QRMiniPreview';
import { Dropdown } from '@/components/ui/Dropdown';
import { toast } from '@/stores/toastStore';
import type { QRCode } from '@/types/database';
import type { QRCodeFolder } from '@/hooks/queries/useQRCodeFolders';

interface QRCodeRowProps {
  qr: QRCode;
  folders: QRCodeFolder[];
  onEditUrl: (qr: QRCode) => void;
  onToggleActive: (qr: QRCode) => void;
  onMoveToFolder: (qr: QRCode, folderId: string | null) => void;
  onDelete: (qr: QRCode) => void;
}

const TYPE_COLORS: Record<string, string> = {
  url: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  email: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  phone: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  sms: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  wifi: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  vcard: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  event: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  location: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  text: 'bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-300',
};

function extractStyleOptions(metadata: unknown): QRStyleOptionsForPreview | undefined {
  if (!metadata || typeof metadata !== 'object') return undefined;
  const meta = metadata as Record<string, unknown>;
  if (!meta.style_options || typeof meta.style_options !== 'object') return undefined;
  return meta.style_options as QRStyleOptionsForPreview;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function truncateUrl(url: string, maxLen: number = 40): string {
  if (url.length <= maxLen) return url;
  // Remove protocol for display
  const withoutProtocol = url.replace(/^https?:\/\//, '');
  if (withoutProtocol.length <= maxLen) return withoutProtocol;
  return withoutProtocol.slice(0, maxLen - 3) + '...';
}

export const QRCodeRow = memo(function QRCodeRow({
  qr,
  folders,
  onEditUrl,
  onToggleActive,
  onMoveToFolder,
  onDelete,
}: QRCodeRowProps) {
  const previewRef = useRef<QRMiniPreviewHandle>(null);

  const styleOptions = useMemo(() => extractStyleOptions(qr.metadata), [qr.metadata]);
  const folder = useMemo(() => folders.find((f) => f.id === (qr as QRCode & { folder_id?: string | null }).folder_id), [folders, qr]);

  const handleDownload = useCallback(() => {
    previewRef.current?.download(qr.name || qr.short_code, 'png');
  }, [qr.name, qr.short_code]);

  const handleCopyLink = useCallback(async () => {
    const trackingUrl = qr.tracking_url || qr.destination_url;
    try {
      await navigator.clipboard.writeText(trackingUrl);
      toast.success('Link copied to clipboard');
    } catch {
      toast.error('Failed to copy link');
    }
  }, [qr.tracking_url, qr.destination_url]);

  const qrType = qr.qr_type || 'url';
  const displayName = qr.name || truncateUrl(qr.destination_url, 30);
  const typeBadgeClass = TYPE_COLORS[qrType] || TYPE_COLORS.text;

  return (
    <div className="flex items-center gap-4 px-4 py-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
      {/* QR Preview */}
      <div className="flex-shrink-0">
        <QRMiniPreview
          ref={previewRef}
          data={qr.destination_url}
          size={48}
          styleOptions={styleOptions}
        />
      </div>

      {/* Info column */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase', typeBadgeClass)}>
            {qrType}
          </span>
          <Link
            to="/qr-codes/$id"
            params={{ id: qr.id }}
            className="text-sm font-medium text-gray-900 dark:text-white truncate hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
          >
            {displayName}
          </Link>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          {folder && (
            <>
              <span className="flex items-center gap-1">
                <span
                  className="w-2 h-2 rounded-full inline-block"
                  style={{ backgroundColor: folder.color }}
                />
                {folder.name}
              </span>
              <span className="opacity-40">·</span>
            </>
          )}
          <span className={cn(
            'px-1.5 py-0.5 rounded-full text-[10px] font-medium',
            qr.is_active
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
              : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
          )}>
            {qr.is_active ? 'Active' : 'Paused'}
          </span>
        </div>
      </div>

      {/* Short URL / Destination */}
      <div className="hidden md:block min-w-0 max-w-[200px]">
        <button
          onClick={handleCopyLink}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline truncate block"
          title="Click to copy tracking URL"
        >
          {qr.tracking_url ? truncateUrl(qr.tracking_url, 35) : truncateUrl(qr.destination_url, 35)}
        </button>
        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
          {truncateUrl(qr.destination_url, 35)}
        </p>
      </div>

      {/* Scans */}
      <div className="hidden sm:block text-right min-w-[60px]">
        <p className="text-sm font-bold text-gray-900 dark:text-white">{qr.total_scans}</p>
        <p className="text-[10px] text-gray-400">scans</p>
      </div>

      {/* Date */}
      <div className="hidden lg:block text-right min-w-[60px]">
        <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(qr.created_at)}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={handleDownload}
          className="btn-icon text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          title="Download"
        >
          <Download className="w-4 h-4" />
        </button>

        <Dropdown
          align="right"
          trigger={({ toggle }) => (
            <button
              onClick={toggle}
              className="btn-icon text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="More actions"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          )}
        >
          {({ close }) => (
            <div className="min-w-[180px] py-1">
              <button
                onClick={() => { onEditUrl(qr); close(); }}
                className="w-full px-3 py-2.5 min-h-[44px] text-left text-sm flex items-center gap-2 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors text-gray-700 dark:text-gray-300"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit URL
              </button>
              <button
                onClick={() => { onToggleActive(qr); close(); }}
                className="w-full px-3 py-2.5 min-h-[44px] text-left text-sm flex items-center gap-2 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors text-gray-700 dark:text-gray-300"
              >
                {qr.is_active ? (
                  <><Pause className="w-3.5 h-3.5" /> Pause</>
                ) : (
                  <><Play className="w-3.5 h-3.5" /> Activate</>
                )}
              </button>

              {/* Move to folder sub-menu */}
              <Dropdown
                align="left"
                trigger={({ toggle: toggleSub }) => (
                  <button
                    onClick={toggleSub}
                    className="w-full px-3 py-2.5 min-h-[44px] text-left text-sm flex items-center gap-2 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors text-gray-700 dark:text-gray-300"
                  >
                    <FolderInput className="w-3.5 h-3.5" />
                    Move to Folder
                  </button>
                )}
              >
                {({ close: closeSub }) => (
                  <div className="min-w-[160px] py-1">
                    <button
                      onClick={() => { onMoveToFolder(qr, null); closeSub(); close(); }}
                      className="w-full px-3 py-2.5 min-h-[44px] text-left text-sm hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors text-gray-700 dark:text-gray-300"
                    >
                      None (Unfiled)
                    </button>
                    {folders.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => { onMoveToFolder(qr, f.id); closeSub(); close(); }}
                        className="w-full px-3 py-2.5 min-h-[44px] text-left text-sm flex items-center gap-2 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors text-gray-700 dark:text-gray-300"
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: f.color }} />
                        {f.name}
                      </button>
                    ))}
                  </div>
                )}
              </Dropdown>

              <div className="border-t border-black/[0.04] dark:border-white/[0.04] my-1" />

              <Link
                to="/qr-codes/$id"
                params={{ id: qr.id }}
                onClick={() => close()}
                className="w-full px-3 py-2.5 min-h-[44px] text-left text-sm flex items-center gap-2 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors text-gray-700 dark:text-gray-300"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                View Analytics
              </Link>
              <button
                onClick={() => { handleCopyLink(); close(); }}
                className="w-full px-3 py-2.5 min-h-[44px] text-left text-sm flex items-center gap-2 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors text-gray-700 dark:text-gray-300"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Tracking URL
              </button>

              <div className="border-t border-black/[0.04] dark:border-white/[0.04] my-1" />

              <button
                onClick={() => { onDelete(qr); close(); }}
                className="w-full px-3 py-2.5 min-h-[44px] text-left text-sm flex items-center gap-2 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors text-red-600 dark:text-red-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          )}
        </Dropdown>
      </div>
    </div>
  );
});
