import { useState, useRef, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useHistoryStore } from '@/stores/historyStore';
import { toast } from '@/stores/toastStore';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { HistoryCard } from '@/components/features/History';
import { Clock, Trash2, Undo2 } from 'lucide-react';

export default function HistoryPage() {
  const { entries, removeEntry, clearHistory, undoClear, canUndo } = useHistoryStore();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showUndo, setShowUndo] = useState(false);
  const undoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setShowUndo(canUndo());
  }, [canUndo]);

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

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto animate-slide-up-page">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">History</h1>
            <p className="text-gray-500 dark:text-gray-400">
              {entries.length} QR code{entries.length !== 1 ? 's' : ''} in history
            </p>
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
          </div>
        </div>

        {/* Content */}
        {entries.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-12 text-center">
            <Clock className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No QR codes in history yet
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
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
              />
            ))}
          </div>
        )}
      </div>

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
    </DashboardLayout>
  );
}
