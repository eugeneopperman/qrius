import { memo, useCallback, useMemo } from 'react';
import { useQRStore } from '@/stores/qrStore';
import { useShallow } from 'zustand/react/shallow';
import { ColorPicker } from '../ui/ColorPicker';
import { cn } from '@/utils/cn';
import { Tooltip } from '../ui/Tooltip';
import { InlineToggle } from '../ui/Toggle';
import { Slider } from '../ui/Slider';
import { HelpCircle } from 'lucide-react';
import { COLOR_PALETTES, GRADIENT_PRESETS, DEFAULT_GRADIENT } from '@/config/constants';
import { getGradientPreview } from '@/utils/gradientUtils';
import type { GradientOptions, GradientType } from '@/types';

export const ColorSection = memo(function ColorSection() {
  const { styleOptions, setStyleOptions } = useQRStore(useShallow((s) => ({ styleOptions: s.styleOptions, setStyleOptions: s.setStyleOptions })));

  const useGradient = styleOptions.useGradient ?? false;
  const gradient = styleOptions.gradient ?? DEFAULT_GRADIENT;

  const handleToggleGradient = useCallback(() => {
    if (!useGradient && !styleOptions.gradient) {
      // First time enabling gradient, set default
      setStyleOptions({ useGradient: true, gradient: DEFAULT_GRADIENT });
    } else {
      setStyleOptions({ useGradient: !useGradient });
    }
  }, [useGradient, styleOptions.gradient, setStyleOptions]);

  const updateGradient = useCallback((updates: Partial<GradientOptions>) => {
    setStyleOptions({
      gradient: { ...gradient, ...updates },
    });
  }, [gradient, setStyleOptions]);

  const updateColorStop = useCallback((index: number, color: string) => {
    const newColorStops = [...gradient.colorStops];
    newColorStops[index] = { ...newColorStops[index], color };
    updateGradient({ colorStops: newColorStops });
  }, [gradient.colorStops, updateGradient]);

  // Memoize the current gradient preview
  const currentGradientPreview = useMemo(() => getGradientPreview(gradient), [gradient]);

  return (
    <div className="space-y-4">
      {/* Gradient Toggle */}
      <InlineToggle
        checked={useGradient}
        onChange={handleToggleGradient}
        label="Use Gradient"
        tooltip={
          <Tooltip
            content="Apply a color gradient to your QR code instead of a solid color. Gradients add visual interest but ensure sufficient contrast for reliable scanning."
            position="top"
          >
            <HelpCircle className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 cursor-help" />
          </Tooltip>
        }
      />

      {useGradient ? (
        <>
          {/* Gradient Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Gradient Type
            </label>
            <div className="flex gap-2">
              {(['linear', 'radial'] as GradientType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => updateGradient({ type })}
                  className={cn(
                    'flex-1 px-3 py-2 text-sm font-medium rounded-lg border transition-colors capitalize',
                    gradient.type === type
                      ? 'border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Rotation (only for linear) */}
          {gradient.type === 'linear' && (
            <Slider
              label="Rotation"
              min={0}
              max={360}
              step={1}
              value={gradient.rotation || 0}
              onChange={(val) => updateGradient({ rotation: val })}
              unit="°"
              showTicks
              tickLabels={['0°', '90°', '180°', '270°', '360°']}
            />
          )}

          {/* Color Stops */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Colors
            </label>
            {gradient.colorStops.map((stop, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400 w-12">
                  {index === 0 ? 'Start' : 'End'}
                </span>
                <div className="flex-1">
                  <ColorPicker
                    value={stop.color}
                    onChange={(color) => updateColorStop(index, color)}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Gradient Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preview
            </label>
            <div
              className="h-8 rounded-lg border border-gray-200 dark:border-gray-600"
              style={{ background: currentGradientPreview }}
            />
          </div>

          {/* Gradient Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Presets
            </label>
            <div className="grid grid-cols-3 gap-2">
              {GRADIENT_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setStyleOptions({ gradient: preset.gradient })}
                  className="group relative h-8 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden hover:ring-2 hover:ring-orange-500 transition-all focus:outline-none focus:ring-2 focus:ring-orange-400"
                  title={preset.name}
                >
                  <div
                    className="absolute inset-0"
                    style={{ background: getGradientPreview(preset.gradient) }}
                  />
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <ColorPicker
            label="QR Code Color"
            value={styleOptions.dotsColor}
            onChange={(color) => setStyleOptions({ dotsColor: color })}
          />

          {/* Color Palette Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Color Palettes
            </label>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_PALETTES.map((palette) => (
                <button
                  key={palette.name}
                  type="button"
                  onClick={() => setStyleOptions({ dotsColor: palette.qrColor, backgroundColor: palette.bgColor })}
                  className={cn(
                    "group relative h-10 rounded-lg border overflow-hidden hover:ring-2 hover:ring-orange-500 transition-all focus:outline-none focus:ring-2 focus:ring-orange-400",
                    styleOptions.dotsColor === palette.qrColor && styleOptions.backgroundColor === palette.bgColor
                      ? "ring-2 ring-orange-500"
                      : "border-gray-200 dark:border-gray-600"
                  )}
                  title={palette.name}
                >
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ backgroundColor: palette.bgColor }}
                  >
                    <div
                      className="w-5 h-5 rounded-sm"
                      style={{ backgroundColor: palette.qrColor }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <ColorPicker
        label="Background Color"
        value={styleOptions.backgroundColor}
        onChange={(color) => setStyleOptions({ backgroundColor: color })}
      />

      <div className="pt-2">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Tip: Ensure good contrast between colors for reliable scanning.
          Dark QR codes on light backgrounds work best.
        </p>
      </div>
    </div>
  );
});

ColorSection.displayName = 'ColorSection';
