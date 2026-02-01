import { QrCode, Sparkles } from 'lucide-react';

/**
 * Empty state component displayed when no QR code data has been entered.
 */
export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-in">
      <div className="relative mb-4">
        <div className="w-20 h-20 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
          <QrCode className="w-10 h-10 text-orange-500" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center shadow-md">
          <Sparkles className="w-3 h-3 text-white" />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
        Create Your QR Code
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[240px]">
        Enter your content on the left and watch your QR code appear here instantly
      </p>
      <div className="mt-4 flex items-center gap-3 text-xs text-gray-400">
        <span className="flex items-center gap-1.5">
          <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-[10px] font-medium text-gray-500">
            1-9
          </kbd>
          <span>Switch types</span>
        </span>
        <span className="text-gray-300 dark:text-gray-600">•</span>
        <span className="flex items-center gap-1.5">
          <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg text-[10px] font-medium text-gray-500">
            S
          </kbd>
          <span>Download</span>
        </span>
      </div>
    </div>
  );
}
