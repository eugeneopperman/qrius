import {
  Wifi,
  UserCircle,
  Megaphone,
  Share2,
  CalendarCheck,
  UtensilsCrossed,
  CreditCard,
  Minimize2,
  Sparkles,
  Check
} from 'lucide-react';
import { useState } from 'react';
import { smartPresets, type SmartPreset } from '../../data/smartPresets';
import { useQRStore } from '../../stores/qrStore';
import { cn } from '../../utils/cn';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Wifi,
  UserCircle,
  Megaphone,
  Share2,
  CalendarCheck,
  UtensilsCrossed,
  CreditCard,
  Minimize2,
};

interface SmartPresetsProps {
  onApply?: () => void;
}

export function SmartPresets({ onApply }: SmartPresetsProps) {
  const [appliedPreset, setAppliedPreset] = useState<string | null>(null);
  const {
    setActiveType,
    setStyleOptions,
    setUrlData,
    setWifiData,
    setVcardData,
    setEventData,
  } = useQRStore();

  const applyPreset = (preset: SmartPreset) => {
    // Set the QR type
    setActiveType(preset.type);

    // Apply default data based on type
    switch (preset.type) {
      case 'url':
        setUrlData(preset.defaultData as Parameters<typeof setUrlData>[0]);
        break;
      case 'wifi':
        setWifiData(preset.defaultData as Parameters<typeof setWifiData>[0]);
        break;
      case 'vcard':
        setVcardData(preset.defaultData as Parameters<typeof setVcardData>[0]);
        break;
      case 'event':
        setEventData(preset.defaultData as Parameters<typeof setEventData>[0]);
        break;
    }

    // Apply style options
    setStyleOptions(preset.styleOptions);

    // Show applied feedback
    setAppliedPreset(preset.id);
    setTimeout(() => setAppliedPreset(null), 1500);

    // Call optional callback
    onApply?.();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Sparkles className="w-4 h-4" />
        <span>One-click templates for common use cases</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {smartPresets.map((preset) => {
          const Icon = iconMap[preset.icon] || Minimize2;
          const isApplied = appliedPreset === preset.id;

          return (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset)}
              className={cn(
                'group relative flex items-start gap-3 p-3 rounded-lg border text-left transition-all',
                'hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20',
                isApplied
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
              )}
            >
              {/* Icon */}
              <div
                className={cn(
                  'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors',
                  isApplied
                    ? 'bg-green-100 dark:bg-green-800'
                    : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-800'
                )}
              >
                {isApplied ? (
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                ) : (
                  <Icon
                    className={cn(
                      'w-5 h-5 transition-colors',
                      'text-gray-600 dark:text-gray-400',
                      'group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
                    )}
                  />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className={cn(
                  'text-sm font-medium truncate',
                  isApplied
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-gray-900 dark:text-white'
                )}>
                  {isApplied ? 'Applied!' : preset.name}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                  {preset.description}
                </p>
              </div>

              {/* Preview indicator for gradient presets */}
              {preset.styleOptions.useGradient && preset.styleOptions.gradient && (
                <div
                  className="absolute top-2 right-2 w-3 h-3 rounded-full"
                  style={{
                    background: `linear-gradient(${preset.styleOptions.gradient.rotation || 45}deg, ${preset.styleOptions.gradient.colorStops.map(s => s.color).join(', ')})`,
                  }}
                  title="Uses gradient"
                />
              )}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500">
        Presets apply both styling and optimal settings for each use case.
        You can customize further after applying.
      </p>
    </div>
  );
}
