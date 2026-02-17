import { Check, QrCode, Palette, Sparkles } from 'lucide-react';

export function OnboardingComplete() {
  return (
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-6 bg-green-500 rounded-2xl flex items-center justify-center">
        <Check className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        You're all set!
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Your workspace is ready. Start creating QR codes and tracking scans.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
        <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <QrCode className="w-6 h-6 text-orange-500 mb-2" />
          <h3 className="font-medium text-gray-900 dark:text-white text-sm">Create QR Codes</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">URL, WiFi, vCard, and more</p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <Palette className="w-6 h-6 text-indigo-500 mb-2" />
          <h3 className="font-medium text-gray-900 dark:text-white text-sm">Brand Templates</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Save and reuse your styles</p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <Sparkles className="w-6 h-6 text-pink-500 mb-2" />
          <h3 className="font-medium text-gray-900 dark:text-white text-sm">Track Scans</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Real-time analytics</p>
        </div>
      </div>
    </div>
  );
}
