import { useQRStore } from '../../stores/qrStore';
import { ColorPicker } from '../ui/ColorPicker';
import { cn } from '../../utils/cn';
import { Tooltip } from '../ui/Tooltip';
import { HelpCircle } from 'lucide-react';
import type { GradientOptions, GradientType } from '../../types';

const defaultGradient: GradientOptions = {
  type: 'linear',
  rotation: 45,
  colorStops: [
    { offset: 0, color: '#6366F1' },
    { offset: 1, color: '#EC4899' },
  ],
};

const gradientPresets: { name: string; gradient: GradientOptions }[] = [
  {
    name: 'Indigo to Pink',
    gradient: { type: 'linear', rotation: 45, colorStops: [{ offset: 0, color: '#6366F1' }, { offset: 1, color: '#EC4899' }] },
  },
  {
    name: 'Blue to Cyan',
    gradient: { type: 'linear', rotation: 90, colorStops: [{ offset: 0, color: '#3B82F6' }, { offset: 1, color: '#06B6D4' }] },
  },
  {
    name: 'Green to Yellow',
    gradient: { type: 'linear', rotation: 135, colorStops: [{ offset: 0, color: '#22C55E' }, { offset: 1, color: '#EAB308' }] },
  },
  {
    name: 'Purple to Orange',
    gradient: { type: 'linear', rotation: 45, colorStops: [{ offset: 0, color: '#8B5CF6' }, { offset: 1, color: '#F97316' }] },
  },
  {
    name: 'Red to Pink',
    gradient: { type: 'radial', colorStops: [{ offset: 0, color: '#EF4444' }, { offset: 1, color: '#EC4899' }] },
  },
  {
    name: 'Teal Radial',
    gradient: { type: 'radial', colorStops: [{ offset: 0, color: '#14B8A6' }, { offset: 1, color: '#0F172A' }] },
  },
];

// Color palette presets for solid colors
const colorPalettes: { name: string; qrColor: string; bgColor: string }[] = [
  { name: 'Classic', qrColor: '#000000', bgColor: '#FFFFFF' },
  { name: 'Indigo', qrColor: '#4F46E5', bgColor: '#FFFFFF' },
  { name: 'Ocean', qrColor: '#0369A1', bgColor: '#F0F9FF' },
  { name: 'Forest', qrColor: '#166534', bgColor: '#F0FDF4' },
  { name: 'Sunset', qrColor: '#C2410C', bgColor: '#FFF7ED' },
  { name: 'Berry', qrColor: '#9D174D', bgColor: '#FDF2F8' },
  { name: 'Slate', qrColor: '#334155', bgColor: '#F8FAFC' },
  { name: 'Inverted', qrColor: '#FFFFFF', bgColor: '#000000' },
];

export function ColorSection() {
  const { styleOptions, setStyleOptions } = useQRStore();

  const useGradient = styleOptions.useGradient ?? false;
  const gradient = styleOptions.gradient ?? defaultGradient;

  const handleToggleGradient = () => {
    if (!useGradient && !styleOptions.gradient) {
      // First time enabling gradient, set default
      setStyleOptions({ useGradient: true, gradient: defaultGradient });
    } else {
      setStyleOptions({ useGradient: !useGradient });
    }
  };

  const updateGradient = (updates: Partial<GradientOptions>) => {
    setStyleOptions({
      gradient: { ...gradient, ...updates },
    });
  };

  const updateColorStop = (index: number, color: string) => {
    const newColorStops = [...gradient.colorStops];
    newColorStops[index] = { ...newColorStops[index], color };
    updateGradient({ colorStops: newColorStops });
  };

  const getGradientPreview = (g: GradientOptions) => {
    const colors = g.colorStops.map((s) => `${s.color} ${s.offset * 100}%`).join(', ');
    if (g.type === 'radial') {
      return `radial-gradient(circle, ${colors})`;
    }
    return `linear-gradient(${g.rotation || 0}deg, ${colors})`;
  };

  return (
    <div className="space-y-4">
      {/* Gradient Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Use Gradient
          </span>
          <Tooltip
            content="Apply a color gradient to your QR code instead of a solid color. Gradients add visual interest but ensure sufficient contrast for reliable scanning."
            position="top"
          >
            <HelpCircle className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 cursor-help" />
          </Tooltip>
        </div>
        <button
          type="button"
          onClick={handleToggleGradient}
          className={cn(
            'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
            useGradient ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
          )}
        >
          <span
            className={cn(
              'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
              useGradient ? 'translate-x-6' : 'translate-x-1'
            )}
          />
        </button>
      </div>

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
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
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
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Rotation: {gradient.rotation}°
              </label>
              <input
                type="range"
                min="0"
                max="360"
                value={gradient.rotation || 0}
                onChange={(e) => updateGradient({ rotation: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0°</span>
                <span>90°</span>
                <span>180°</span>
                <span>270°</span>
                <span>360°</span>
              </div>
            </div>
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
              style={{ background: getGradientPreview(gradient) }}
            />
          </div>

          {/* Gradient Presets */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Presets
            </label>
            <div className="grid grid-cols-3 gap-2">
              {gradientPresets.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setStyleOptions({ gradient: preset.gradient })}
                  className="group relative h-8 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden hover:ring-2 hover:ring-indigo-500 transition-all"
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
              {colorPalettes.map((palette) => (
                <button
                  key={palette.name}
                  type="button"
                  onClick={() => setStyleOptions({ dotsColor: palette.qrColor, backgroundColor: palette.bgColor })}
                  className={cn(
                    "group relative h-10 rounded-lg border overflow-hidden hover:ring-2 hover:ring-indigo-500 transition-all",
                    styleOptions.dotsColor === palette.qrColor && styleOptions.backgroundColor === palette.bgColor
                      ? "ring-2 ring-indigo-500"
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
}
