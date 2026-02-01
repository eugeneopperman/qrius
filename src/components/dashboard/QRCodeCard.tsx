import { MoreVertical, ExternalLink, BarChart2, Copy, Trash2, QrCode } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { QRCode } from '../../types/database';
import { toast } from '../../stores/toastStore';

interface QRCodeCardProps {
  qrCode: QRCode;
  onDelete?: (id: string) => void;
}

export function QRCodeCard({ qrCode, onDelete }: QRCodeCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyUrl = () => {
    const trackingUrl = `${window.location.origin}/r/${qrCode.short_code}`;
    navigator.clipboard.writeText(trackingUrl);
    toast.success('URL copied to clipboard');
    setMenuOpen(false);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(qrCode.id);
    }
    setMenuOpen(false);
  };

  const formattedDate = new Date(qrCode.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-lg transition-shadow">
      {/* QR Preview */}
      <div className="aspect-square p-6 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
        <div className="w-full h-full max-w-[200px] max-h-[200px] bg-white rounded-lg flex items-center justify-center">
          <QrCode className="w-24 h-24 text-gray-400" />
        </div>
      </div>

      {/* Details */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 dark:text-white truncate">
              {qrCode.name || `QR Code ${qrCode.short_code}`}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {qrCode.destination_url}
            </p>
          </div>

          {/* Menu */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                <a
                  href={`/qr-codes/${qrCode.id}`}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <BarChart2 className="w-4 h-4" />
                  View Analytics
                </a>
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
                  onClick={handleCopyUrl}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Copy className="w-4 h-4" />
                  Copy Tracking URL
                </button>
                <hr className="my-1 border-gray-200 dark:border-gray-700" />
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">{formattedDate}</span>
          <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
            <BarChart2 className="w-4 h-4" />
            <span className="font-medium">{qrCode.total_scans} scans</span>
          </div>
        </div>
      </div>
    </div>
  );
}
