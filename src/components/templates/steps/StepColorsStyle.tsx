import { memo, useCallback } from 'react';
import { Palette, Square, Circle } from 'lucide-react';
import { ColorPicker } from '../../ui/ColorPicker';
import { Slider } from '../../ui/Slider';
import { InlineToggle } from '../../ui/Toggle';
import { cn } from '../../../utils/cn';
import { COLOR_PALETTES, GRADIENT_PRESETS, DEFAULT_GRADIENT } from '../../../config/constants';
import type { BrandTemplateStyle, GradientOptions, GradientType, QRPattern } from '../../../types';

interface StepColorsStyleProps {
  style: BrandTemplateStyle;
  onStyleChange: (updates: Partial<BrandTemplateStyle>) => void;
}

export const StepColorsStyle = memo(function StepColorsStyle({
  style,
  onStyleChange,
}: StepColorsStyleProps) {
  const useGradient = style.useGradient ?? false;
  const gradient = style.gradient ?? DEFAULT_GRADIENT;
  const qrRoundness = style.qrRoundness ?? 0;
  const qrPattern = style.qrPattern ?? 'solid';

  const handleToggleGradient = useCallback(() => {
    if (!useGradient && !style.gradient) {
      onStyleChange({ useGradient: true, gradient: DEFAULT_GRADIENT });
    } else {
      onStyleChange({ useGradient: !useGradient });
    }
  }, [useGradient, style.gradient, onStyleChange]);

  const updateGradient = useCallback(
    (updates: Partial<GradientOptions>) => {
      onStyleChange({
        gradient: { ...gradient, ...updates },
      });
    },
    [gradient, onStyleChange]
  );

  const updateColorStop = useCallback(
    (index: number, color: string) => {
      const newColorStops = [...gradient.colorStops];
      newColorStops[index] = { ...newColorStops[index], color };
      updateGradient({ colorStops: newColorStops });
    },
    [gradient.colorStops, updateGradient]
  );

  const getGradientPreview = (g: GradientOptions) => {
    const colors = g.colorStops.map((s) => `${s.color} ${s.offset * 100}%`).join(', ');
    if (g.type === 'radial') {
      return `radial-gradient(circle, ${colors})`;
    }
    return `linear-gradient(${g.rotation || 0}deg, ${colors})`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
          <Palette className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Colors & Style
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Customize the appearance of your QR code with colors and patterns.
          </p>
        </div>
      </div>

      {/* QR Pattern Toggle */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          QR Pattern
        </label>
        <div className="flex gap-2">
          {(['solid', 'dots'] as QRPattern[]).map((pattern) => (
            <button
              key={pattern}
              type="button"
              onClick={() => onStyleChange({ qrPattern: pattern })}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-lg border transition-colors',
                qrPattern === pattern
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                  : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              )}
            >
              {pattern === 'solid' ? (
                <Square className="w-4 h-4" />
              ) : (
                <Circle className="w-4 h-4" />
              )}
              <span className="capitalize">{pattern}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {qrPattern === 'solid'
            ? 'Square modules that appear connected'
            : 'Circular dots that are clearly separated'}
        </p>
      </div>

      {/* QR Roundness Slider - only show for solid pattern */}
      {qrPattern === 'solid' && (
        <div className="space-y-2">
          <Slider
            label="Corner Roundness"
            value={qrRoundness}
            onChange={(value) => onStyleChange({ qrRoundness: value })}
            min={0}
            max={100}
            step={25}
            unit="%"
            showTicks
            tickLabels={['Sharp', 'Slight', 'Rounded', 'More']}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Adds slight rounding to module corners
          </p>
        </div>
      )}

      {/* Gradient Toggle */}
      <InlineToggle
        checked={useGradient}
        onChange={handleToggleGradient}
        label="Use Gradient"
      />

      {useGradient ? (
        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
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
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Rotation (linear only) */}
          {gradient.type === 'linear' && (
            <Slider
              label="Rotation"
              value={gradient.rotation || 0}
              onChange={(value) => updateGradient({ rotation: value })}
              min={0}
              max={360}
              step={15}
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
              className="h-10 rounded-lg border border-gray-200 dark:border-gray-600"
              style={{ background: getGradientPreview(gradient) }}
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
                  onClick={() => onStyleChange({ gradient: preset.gradient })}
                  className="group relative h-10 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden hover:ring-2 hover:ring-indigo-500 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
        </div>
      ) : (
        <div className="space-y-4">
          {/* Solid QR Color */}
          <ColorPicker
            label="QR Code Color"
            value={style.dotsColor || '#000000'}
            onChange={(color) => onStyleChange({ dotsColor: color })}
          />

          {/* Color Palettes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Color Palettes
            </label>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_PALETTES.map((palette) => (
                <button
                  key={palette.name}
                  type="button"
                  onClick={() =>
                    onStyleChange({
                      dotsColor: palette.qrColor,
                      backgroundColor: palette.bgColor,
                    })
                  }
                  className={cn(
                    'group relative h-12 rounded-lg border overflow-hidden hover:ring-2 hover:ring-indigo-500 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500',
                    style.dotsColor === palette.qrColor &&
                      style.backgroundColor === palette.bgColor
                      ? 'ring-2 ring-indigo-500'
                      : 'border-gray-200 dark:border-gray-600'
                  )}
                  title={palette.name}
                >
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ backgroundColor: palette.bgColor }}
                  >
                    <div
                      className="w-6 h-6 rounded-sm"
                      style={{ backgroundColor: palette.qrColor }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Background Color */}
      <ColorPicker
        label="Background Color"
        value={style.backgroundColor || '#ffffff'}
        onChange={(color) => onStyleChange({ backgroundColor: color })}
      />

      {/* Contrast Tip */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-xs text-blue-700 dark:text-blue-300">
          Tip: Ensure good contrast between colors for reliable scanning.
          Dark QR codes on light backgrounds work best.
        </p>
      </div>
    </div>
  );
});

StepColorsStyle.displayName = 'StepColorsStyle';
