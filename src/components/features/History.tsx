import { useState, useEffect, useRef } from 'react';
import { X, Trash2, Clock, RotateCcw, Undo2, BarChart3, Loader2 } from 'lucide-react';
import { useHistoryStore, getTypeLabel, getDataSummary } from '@/stores/historyStore';
import { useQRStore } from '@/stores/qrStore';
import { toast } from '@/stores/toastStore';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { getTrackableQR } from '@/utils/qrTrackingApi';
import { useSettingsStore } from '@/stores/settingsStore';
import type { HistoryEntry } from '@/types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HistoryModal({ isOpen, onClose }: HistoryModalProps) {
  const { entries, removeEntry, clearHistory, undoClear, canUndo } = useHistoryStore();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showUndo, setShowUndo] = useState(false);
  const undoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap for accessibility
  useFocusTrap(isOpen, dialogRef, {
    initialFocusRef: closeButtonRef,
    onEscape: onClose,
  });

  // Check if we can undo when modal opens
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync undo state on open
      setShowUndo(canUndo());
    }
  }, [isOpen, canUndo]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
      }
    };
  }, []);

  const handleClearHistory = () => {
    clearHistory();
    setShowUndo(true);
    toast.info('History cleared. You can undo within 10 seconds.');

    // Auto-hide undo button after 10 seconds with proper cleanup
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
    }
    undoTimeoutRef.current = setTimeout(() => {
      setShowUndo(false);
    }, 10000);
  };

  const handleUndo = () => {
    if (undoClear()) {
      toast.success('History restored');
      setShowUndo(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-dialog-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={dialogRef}
        className="relative w-full max-w-2xl max-h-[80vh] bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden mx-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" aria-hidden="true" />
            <h2 id="history-dialog-title" className="text-lg font-semibold text-gray-900 dark:text-white">
              QR Code History
            </h2>
            <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
              {entries.length} / 20
            </span>
          </div>
          <div className="flex items-center gap-2">
            {showUndo && (
              <Button
                size="sm"
                variant="secondary"
                onClick={handleUndo}
                className="text-amber-600 dark:text-amber-400"
              >
                <Undo2 className="w-4 h-4" />
                Undo
              </Button>
            )}
            {entries.length > 0 && !showUndo && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowClearConfirm(true)}
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </Button>
            )}
            <button
              ref={closeButtonRef}
              onClick={onClose}
              aria-label="Close history"
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-6">
          {entries.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No QR codes in history yet
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Download or copy a QR code to save it here
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {entries.map((entry) => (
                <HistoryCard
                  key={entry.id}
                  entry={entry}
                  onRemove={() => removeEntry(entry.id)}
                  onClose={onClose}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Clear Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearHistory}
        title="Clear History?"
        message="This will remove all QR codes from your history. You'll have 10 seconds to undo this action."
        confirmLabel="Clear All"
        cancelLabel="Keep History"
        variant="warning"
      />
    </div>
  );
}

export interface HistoryCardProps {
  entry: HistoryEntry;
  onRemove: () => void;
  onClose?: () => void;
}

export function HistoryCard({ entry, onRemove, onClose }: HistoryCardProps) {
  const { setActiveType, setStyleOptions, setUrlData, setTextData, setEmailData, setPhoneData, setSmsData, setWifiData, setVcardData, setEventData, setLocationData } = useQRStore();
  const { trackingSettings } = useSettingsStore();
  const { updateEntry } = useHistoryStore();
  const [scanCount, setScanCount] = useState<number | null>(entry.totalScans ?? null);
  const [isLoadingScans, setIsLoadingScans] = useState(false);

  // Fetch scan count if this is a tracked QR and we don't have a recent count
  useEffect(() => {
    if (entry.trackingId && trackingSettings?.enabled) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetch callback
      setIsLoadingScans(true);
      getTrackableQR(entry.trackingId, trackingSettings.apiBaseUrl || undefined)
        .then((result) => {
          if (result.success && result.qrCode) {
            setScanCount(result.qrCode.totalScans);
            // Update the cached count in the store
            updateEntry(entry.id, { totalScans: result.qrCode.totalScans });
          }
        })
        .catch((error) => {
          // Log error but don't show toast to avoid noise on network issues
          console.error('Failed to fetch scan count:', error);
        })
        .finally(() => setIsLoadingScans(false));
    }
  }, [entry.trackingId, entry.id, trackingSettings, updateEntry]);

  const handleRestore = () => {
    // Set the active type
    setActiveType(entry.type);

    // Restore the data based on type
    switch (entry.data.type) {
      case 'url':
        setUrlData(entry.data.data);
        break;
      case 'text':
        setTextData(entry.data.data);
        break;
      case 'email':
        setEmailData(entry.data.data);
        break;
      case 'phone':
        setPhoneData(entry.data.data);
        break;
      case 'sms':
        setSmsData(entry.data.data);
        break;
      case 'wifi':
        setWifiData(entry.data.data);
        break;
      case 'vcard':
        setVcardData(entry.data.data);
        break;
      case 'event':
        setEventData(entry.data.data);
        break;
      case 'location':
        setLocationData(entry.data.data);
        break;
    }

    // Restore style options
    setStyleOptions(entry.styleOptions);

    // Show success message
    toast.success('QR code restored from history');

    // Close the modal if callback provided
    onClose?.();
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="group relative bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
      <div className="flex gap-4">
        {/* Thumbnail */}
        <div className="flex-shrink-0 w-16 h-16 bg-white dark:bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center border border-gray-200 dark:border-gray-600">
          {entry.thumbnail ? (
            <img
              src={entry.thumbnail}
              alt="QR Code preview"
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2 py-0.5 text-xs font-medium bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded">
              {getTypeLabel(entry.type)}
            </span>
            {entry.trackingId && (
              <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded flex items-center gap-1">
                <BarChart3 className="w-3 h-3" />
                {isLoadingScans ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <span>{scanCount ?? 0} scans</span>
                )}
              </span>
            )}
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {formatDate(entry.timestamp)}
            </span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
            {getDataSummary(entry.data)}
          </p>
        </div>
      </div>

      {/* Actions - Always visible on mobile for touch support */}
      <div className="absolute top-2 right-2 flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleRestore}
          className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-indigo-600 hover:bg-indigo-100 dark:text-indigo-400 dark:hover:bg-indigo-900/50 rounded-lg"
          aria-label="Restore this QR code"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={onRemove}
          className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/50 rounded-lg"
          aria-label="Remove from history"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
