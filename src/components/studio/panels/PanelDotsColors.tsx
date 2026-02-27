import { memo, useCallback, type ReactNode } from 'react';
import { useStudioStore } from '@/stores/studioStore';
import { useShallow } from 'zustand/react/shallow';
import { Square, Circle } from 'lucide-react';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { Slider } from '@/components/ui/Slider';
import { InlineToggle } from '@/components/ui/Toggle';
import { cn } from '@/utils/cn';
import { COLOR_PALETTES, GRADIENT_PRESETS, DEFAULT_GRADIENT } from '@/config/constants';
import type { DotType, CornerSquareType, GradientOptions, GradientType, QRPattern } from '@/types';

// Dot style SVG previews
function DotPreview({ type }: { type: DotType }) {
  const patterns: Record<DotType, ReactNode> = {
    square: (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <rect x="2" y="2" width="6" height="6" fill="currentColor" />
        <rect x="10" y="2" width="6" height="6" fill="currentColor" />
        <rect x="2" y="10" width="6" height="6" fill="currentColor" />
        <rect x="16" y="10" width="6" height="6" fill="currentColor" />
        <rect x="10" y="16" width="6" height="6" fill="currentColor" />
      </svg>
    ),
    dots: (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <circle cx="5" cy="5" r="3" fill="currentColor" />
        <circle cx="13" cy="5" r="3" fill="currentColor" />
        <circle cx="5" cy="13" r="3" fill="currentColor" />
        <circle cx="19" cy="13" r="3" fill="currentColor" />
        <circle cx="13" cy="19" r="3" fill="currentColor" />
      </svg>
    ),
    rounded: (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <rect x="2" y="2" width="6" height="6" rx="1.5" fill="currentColor" />
        <rect x="10" y="2" width="6" height="6" rx="1.5" fill="currentColor" />
        <rect x="2" y="10" width="6" height="6" rx="1.5" fill="currentColor" />
        <rect x="16" y="10" width="6" height="6" rx="1.5" fill="currentColor" />
        <rect x="10" y="16" width="6" height="6" rx="1.5" fill="currentColor" />
      </svg>
    ),
    'extra-rounded': (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <rect x="2" y="2" width="6" height="6" rx="3" fill="currentColor" />
        <rect x="10" y="2" width="6" height="6" rx="3" fill="currentColor" />
        <rect x="2" y="10" width="6" height="6" rx="3" fill="currentColor" />
        <rect x="16" y="10" width="6" height="6" rx="3" fill="currentColor" />
        <rect x="10" y="16" width="6" height="6" rx="3" fill="currentColor" />
      </svg>
    ),
    classy: (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <path d="M2 2h6v6H2z M10 2h6v6h-6z M2 10h6v6H2z M16 10h6v6h-6z M10 16h6v6h-6z" fill="currentColor" />
        <rect x="4" y="4" width="2" height="2" fill="white" opacity="0.3" />
      </svg>
    ),
    'classy-rounded': (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <rect x="2" y="2" width="6" height="6" rx="1" fill="currentColor" />
        <rect x="10" y="2" width="6" height="6" rx="1" fill="currentColor" />
        <rect x="2" y="10" width="6" height="6" rx="1" fill="currentColor" />
        <rect x="16" y="10" width="6" height="6" rx="1" fill="currentColor" />
        <rect x="10" y="16" width="6" height="6" rx="1" fill="currentColor" />
      </svg>
    ),
  };
  return patterns[type] || patterns.square;
}

const dotStyleOptions: { value: DotType; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'dots', label: 'Dots' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'extra-rounded', label: 'Extra Round' },
  { value: 'classy', label: 'Classy' },
  { value: 'classy-rounded', label: 'Classy Round' },
];

const dotToCornerSquareMap: Record<DotType, CornerSquareType> = {
  'square': 'square',
  'dots': 'dot',
  'rounded': 'extra-rounded',
  'extra-rounded': 'extra-rounded',
  'classy': 'square',
  'classy-rounded': 'extra-rounded',
};

export const PanelDotsColors = memo(function PanelDotsColors() {
  const { style, updateStyle } = useStudioStore(
    useShallow((s) => ({
      style: s.style,
      updateStyle: s.updateStyle,
    }))
  );

  const useGradient = style.useGradient ?? false;
  const gradient = style.gradient ?? DEFAULT_GRADIENT;
  const qrRoundness = style.qrRoundness ?? 0;
  const qrPattern = style.qrPattern ?? 'solid';

  const handleDotStyleChange = useCallback(
    (dotType: DotType) => {
      const cornerSquareType = dotToCornerSquareMap[dotType];
      const cornerDotType = cornerSquareType === 'dot' ? 'dot' : cornerSquareType === 'extra-rounded' ? 'extra-rounded' : 'square';
      updateStyle({ dotsType: dotType, cornersSquareType: cornerSquareType, cornersDotType: cornerDotType });
    },
    [updateStyle]
  );

  const handleToggleGradient = useCallback(() => {
    if (!useGradient && !style.gradient) {
      updateStyle({ useGradient: true, gradient: DEFAULT_GRADIENT });
    } else {
      updateStyle({ useGradient: !useGradient });
    }
  }, [useGradient, style.gradient, updateStyle]);

  const updateGradient = useCallback(
    (updates: Partial<GradientOptions>) => {
      updateStyle({ gradient: { ...gradient, ...updates } });
    },
    [gradient, updateStyle]
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
    return g.type === 'radial'
      ? `radial-gradient(circle, ${colors})`
      : `linear-gradient(${g.rotation || 0}deg, ${colors})`;
  };

  return (
    <div className="space-y-5">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Style & Colors</h3>

      {/* Dot Style Grid */}
      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Dot Style</label>
        <div className="grid grid-cols-3 gap-2">
          {dotStyleOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleDotStyleChange(opt.value)}
              className={cn(
                'flex flex-col items-center gap-1 p-2 rounded-lg border transition-all',
                style.dotsType === opt.value
                  ? 'border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300 ring-1 ring-orange-500'
                  : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-orange-300'
              )}
            >
              <div className="w-7 h-7">
                <DotPreview type={opt.value} />
              </div>
              <span className="text-[9px] font-medium">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* QR Pattern */}
      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Pattern</label>
        <div className="flex gap-2">
          {(['solid', 'dots'] as QRPattern[]).map((pattern) => (
            <button
              key={pattern}
              onClick={() => updateStyle({ qrPattern: pattern })}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors capitalize',
                qrPattern === pattern
                  ? 'border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-orange-300'
              )}
            >
              {pattern === 'solid' ? <Square className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
              {pattern}
            </button>
          ))}
        </div>
      </div>

      {/* Roundness */}
      {qrPattern === 'solid' && (
        <Slider
          label="Roundness"
          value={qrRoundness}
          onChange={(v) => updateStyle({ qrRoundness: v })}
          min={0}
          max={100}
          step={25}
          unit="%"
          showTicks
          tickLabels={['Sharp', 'Slight', 'Round', 'More']}
        />
      )}

      {/* Gradient Toggle */}
      <InlineToggle
        checked={useGradient}
        onChange={handleToggleGradient}
        label="Use Gradient"
      />

      {useGradient ? (
        <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <div className="flex gap-2">
            {(['linear', 'radial'] as GradientType[]).map((type) => (
              <button
                key={type}
                onClick={() => updateGradient({ type })}
                className={cn(
                  'flex-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors capitalize',
                  gradient.type === type
                    ? 'border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                )}
              >
                {type}
              </button>
            ))}
          </div>

          {gradient.type === 'linear' && (
            <Slider
              label="Rotation"
              value={gradient.rotation || 0}
              onChange={(v) => updateGradient({ rotation: v })}
              min={0}
              max={360}
              step={15}
              unit="°"
            />
          )}

          <div className="space-y-2">
            {gradient.colorStops.map((stop, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 w-8">{i === 0 ? 'Start' : 'End'}</span>
                <div className="flex-1">
                  <ColorPicker value={stop.color} onChange={(c) => updateColorStop(i, c)} />
                </div>
              </div>
            ))}
          </div>

          <div
            className="h-6 rounded-lg border border-gray-200 dark:border-gray-600"
            style={{ background: getGradientPreview(gradient) }}
          />

          <div className="grid grid-cols-3 gap-1.5">
            {GRADIENT_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => updateStyle({ gradient: preset.gradient })}
                className="h-6 rounded-md border border-gray-200 dark:border-gray-600 overflow-hidden hover:ring-2 hover:ring-orange-500 transition-all"
                title={preset.name}
              >
                <div className="w-full h-full" style={{ background: getGradientPreview(preset.gradient) }} />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <ColorPicker
            label="QR Color"
            value={style.dotsColor || '#000000'}
            onChange={(c) => updateStyle({ dotsColor: c })}
          />
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Palettes</label>
            <div className="grid grid-cols-4 gap-1.5">
              {COLOR_PALETTES.map((p) => (
                <button
                  key={p.name}
                  onClick={() => updateStyle({ dotsColor: p.qrColor, backgroundColor: p.bgColor })}
                  className={cn(
                    'relative h-8 rounded-lg border overflow-hidden hover:ring-2 hover:ring-orange-500 transition-all',
                    style.dotsColor === p.qrColor && style.backgroundColor === p.bgColor
                      ? 'ring-2 ring-orange-500'
                      : 'border-gray-200 dark:border-gray-600'
                  )}
                  title={p.name}
                >
                  <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: p.bgColor }}>
                    <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: p.qrColor }} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

PanelDotsColors.displayName = 'PanelDotsColors';
