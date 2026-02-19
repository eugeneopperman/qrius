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
  Check,
  QrCode
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { smartPresets, type SmartPreset } from '@/data/smartPresets';
import { useQRStore } from '@/stores/qrStore';
import { toast } from '@/stores/toastStore';
import { cn } from '@/utils/cn';

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

// Mini QR preview component to show the preset's style
function PresetQRPreview({ preset }: { preset: SmartPreset }) {
  const { styleOptions } = preset;
  const dotsColor = styleOptions.dotsColor || '#000000';
  const bgColor = styleOptions.backgroundColor || '#ffffff';

  // Get gradient style if applicable
  const getGradientStyle = () => {
    if (styleOptions.useGradient && styleOptions.gradient) {
      const g = styleOptions.gradient;
      const colors = g.colorStops?.map(s => s.color).join(', ') || dotsColor;
      if (g.type === 'radial') {
        return `radial-gradient(circle, ${colors})`;
      }
      return `linear-gradient(${g.rotation || 45}deg, ${colors})`;
    }
    return dotsColor;
  };

  const qrColor = styleOptions.useGradient ? getGradientStyle() : dotsColor;

  return (
    <div
      className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      <div
        className="w-8 h-8 flex items-center justify-center"
        style={styleOptions.useGradient ? { background: qrColor, WebkitBackgroundClip: 'text' } : {}}
      >
        <QrCode
          className="w-7 h-7"
          style={styleOptions.useGradient
            ? { color: 'transparent', background: qrColor, WebkitBackgroundClip: 'text', backgroundClip: 'text' }
            : { color: dotsColor }
          }
        />
      </div>
    </div>
  );
}

interface SmartPresetsProps {
  onApply?: () => void;
}

export function SmartPresets({ onApply }: SmartPresetsProps) {
  const [appliedPreset, setAppliedPreset] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const {
    setActiveType,
    setStyleOptions,
    setUrlData,
    setWifiData,
    setVcardData,
    setEventData,
  } = useQRStore();

  // Cleanup timeout on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

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

    // Show applied feedback with proper cleanup
    setAppliedPreset(preset.id);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => setAppliedPreset(null), 1500);
    toast.success(`Applied "${preset.name}" preset`);

    // Call optional callback
    onApply?.();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Sparkles className="w-4 h-4 text-indigo-500" />
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
                'group relative flex items-start gap-3 p-4 rounded-2xl text-left transition-all duration-200',
                'hover:shadow-md',
                isApplied
                  ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500'
                  : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600'
              )}
            >
              {/* QR Preview */}
              <div className={cn(
                'flex-shrink-0 rounded-lg overflow-hidden border transition-all',
                isApplied
                  ? 'border-green-300 dark:border-green-700'
                  : 'border-gray-200 dark:border-gray-600 group-hover:border-indigo-300 dark:group-hover:border-indigo-600'
              )}>
                {isApplied ? (
                  <div className="w-12 h-12 flex items-center justify-center bg-green-100 dark:bg-green-800">
                    <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                ) : (
                  <PresetQRPreview preset={preset} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className={cn(
                    'text-sm font-semibold truncate',
                    isApplied
                      ? 'text-green-700 dark:text-green-300'
                      : 'text-gray-900 dark:text-white'
                  )}>
                    {isApplied ? 'Applied!' : preset.name}
                  </h4>
                  <Icon className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">
                  {preset.description}
                </p>

                {/* Style tags */}
                <div className="flex items-center gap-1.5 mt-2">
                  {preset.styleOptions.useGradient && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                      Gradient
                    </span>
                  )}
                  {preset.styleOptions.frameStyle && preset.styleOptions.frameStyle !== 'none' && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                      Frame
                    </span>
                  )}
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 capitalize">
                    {preset.type}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
        Presets apply both styling and optimal settings. Customize further after applying.
      </p>
    </div>
  );
}
