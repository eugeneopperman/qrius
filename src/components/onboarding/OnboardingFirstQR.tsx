import { Globe, QrCode } from 'lucide-react';
import { Input } from '../ui/Input';

interface OnboardingFirstQRProps {
  quickUrl: string;
  setQuickUrl: (v: string) => void;
  brandColor: string;
}

export function OnboardingFirstQR({ quickUrl, setQuickUrl, brandColor }: OnboardingFirstQRProps) {
  return (
    <div className="text-center">
      <div
        className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center"
        style={{ backgroundColor: brandColor }}
      >
        <Globe className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Create your first QR code
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Enter a URL to generate a branded QR code instantly.
      </p>
      <div className="text-left">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Website URL
        </label>
        <Input
          type="url"
          value={quickUrl}
          onChange={(e) => setQuickUrl(e.target.value)}
          placeholder="https://example.com"
        />
      </div>

      {/* Preview hint */}
      {quickUrl && (
        <div className="mt-6 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
          <div
            className="w-32 h-32 mx-auto rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${brandColor}10`, border: `2px solid ${brandColor}` }}
          >
            <QrCode className="w-16 h-16" style={{ color: brandColor }} />
          </div>
          <p className="mt-3 text-xs text-gray-400">
            Your QR code will be generated with your brand color
          </p>
        </div>
      )}
    </div>
  );
}
