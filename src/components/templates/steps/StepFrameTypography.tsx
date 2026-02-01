import { memo, useCallback } from 'react';
import { Frame, Type } from 'lucide-react';
import { Input } from '../../ui/Input';
import { Slider } from '../../ui/Slider';
import { GoogleFontSelector } from '../../ui/GoogleFontSelector';
import { cn } from '../../../utils/cn';
import { FRAME_CONFIG } from '../../../config/constants';
import type { BrandTemplateStyle, FrameStyle, FrameFontSize } from '../../../types';

interface StepFrameTypographyProps {
  style: BrandTemplateStyle;
  onStyleChange: (updates: Partial<BrandTemplateStyle>) => void;
}

const FRAME_TEMPLATES: { id: FrameStyle; label: string; hasLabel: boolean }[] = [
  { id: 'none', label: 'None', hasLabel: false },
  { id: 'simple', label: 'Simple Border', hasLabel: false },
  { id: 'rounded', label: 'Rounded Border', hasLabel: false },
  { id: 'bottom-label', label: 'Bottom Label', hasLabel: true },
  { id: 'top-label', label: 'Top Label', hasLabel: true },
  { id: 'badge', label: 'Badge Style', hasLabel: true },
];

const FONT_SIZE_OPTIONS: { value: FrameFontSize; label: string }[] = [
  { value: 'sm', label: 'Small' },
  { value: 'base', label: 'Medium' },
  { value: 'lg', label: 'Large' },
  { value: 'xl', label: 'Extra Large' },
];

export const StepFrameTypography = memo(function StepFrameTypography({
  style,
  onStyleChange,
}: StepFrameTypographyProps) {
  const frameStyle = style.frameStyle || 'none';
  const frameLabel = style.frameLabel || '';
  const frameBorderRadius = style.frameBorderRadius ?? 8;
  const showLabelOptions = FRAME_TEMPLATES.find((f) => f.id === frameStyle)?.hasLabel;

  const handleFrameStyleChange = useCallback(
    (newStyle: FrameStyle) => {
      onStyleChange({ frameStyle: newStyle });
    },
    [onStyleChange]
  );

  const handleQuickLabel = useCallback(
    (label: string) => {
      onStyleChange({ frameLabel: label });
    },
    [onStyleChange]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
          <Frame className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Frame & Typography
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Add a decorative frame and customize the label typography.
          </p>
        </div>
      </div>

      {/* Frame Style Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Frame Style
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {FRAME_TEMPLATES.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => handleFrameStyleChange(template.id)}
              aria-pressed={frameStyle === template.id}
              className={cn(
                'p-3 min-h-[44px] text-xs font-medium rounded-lg border transition-all text-center',
                frameStyle === template.id
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-400'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-300'
              )}
            >
              {template.label}
            </button>
          ))}
        </div>
      </div>

      {/* Frame Border Radius */}
      {frameStyle !== 'none' && (
        <Slider
          label="Frame Roundness"
          value={frameBorderRadius}
          onChange={(value) => onStyleChange({ frameBorderRadius: value })}
          min={0}
          max={32}
          step={4}
          unit="px"
          showTicks
          tickLabels={['0px', '16px', '32px']}
        />
      )}

      {/* Label Options (only for frames that support labels) */}
      {showLabelOptions && (
        <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Type className="w-4 h-4" />
            <span className="text-sm font-medium">Label Options</span>
          </div>

          {/* Label Text */}
          <div className="space-y-2">
            <Input
              label="Label Text"
              value={frameLabel}
              onChange={(e) => onStyleChange({ frameLabel: e.target.value })}
              placeholder="Enter label text..."
              maxLength={FRAME_CONFIG.MAX_LABEL_LENGTH}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {frameLabel.length}/{FRAME_CONFIG.MAX_LABEL_LENGTH} characters
            </p>
          </div>

          {/* Quick Label Suggestions */}
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Quick suggestions:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {FRAME_CONFIG.DEFAULT_LABELS.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleQuickLabel(label)}
                  aria-pressed={frameLabel === label}
                  className={cn(
                    'px-3 py-2 min-h-[36px] text-xs rounded-md border transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-indigo-500/50',
                    frameLabel === label
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 text-gray-600 dark:text-gray-400'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Google Font Selector */}
          <GoogleFontSelector
            label="Font Family"
            value={style.googleFontFamily}
            onChange={(fontName) => onStyleChange({ googleFontFamily: fontName })}
            showWeightSelector
            weight={style.googleFontWeight || 500}
            onWeightChange={(weight) => onStyleChange({ googleFontWeight: weight })}
          />

          {/* Font Size */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Font Size
            </label>
            <div className="flex flex-wrap gap-1.5">
              {FONT_SIZE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onStyleChange({ frameFontSize: option.value })}
                  className={cn(
                    'px-3 py-2 min-h-[36px] text-xs rounded-md border transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-indigo-500/50',
                    (style.frameFontSize || 'base') === option.value
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 text-gray-600 dark:text-gray-400'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      {frameStyle !== 'none' && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-xs text-green-700 dark:text-green-300">
            Tip: Frames with labels help guide users to scan and can include a
            call-to-action like "Scan Me" or "Learn More".
          </p>
        </div>
      )}
    </div>
  );
});

StepFrameTypography.displayName = 'StepFrameTypography';
