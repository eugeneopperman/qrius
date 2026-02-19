import { memo, useCallback, useState } from 'react';
import { useQRStore } from '@/stores/qrStore';
import { useShallow } from 'zustand/react/shallow';
import {
  Type,
  QrCode,
  Smartphone,
  Camera,
  ArrowRight,
  Download,
  ExternalLink,
  ScanLine,
  Fingerprint,
  Ban,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Input } from '../ui/Input';
import { cn } from '@/utils/cn';
import { LabelWithTooltip } from '../ui/Tooltip';
import { SelectButtonGroup, type SelectButtonOption } from '../ui/SelectButtonGroup';
import { FRAME_CONFIG, FRAME_CATEGORIES } from '@/config/constants';
import type { FrameStyle, FrameFontSize, FrameFontFamily, FrameIcon, FrameIconPosition } from '@/types';

// Frame types that support labels
const LABEL_FRAMES: FrameStyle[] = [
  'bottom-label', 'top-label', 'badge',
  'speech-bubble', 'ribbon', 'sticker',
  'banner-bottom', 'banner-top',
];

// Frame types that support custom border color
const BORDER_COLOR_FRAMES: FrameStyle[] = [
  'simple', 'rounded', 'bottom-label', 'top-label', 'badge',
  'speech-bubble', 'circular', 'ribbon', 'decorative-corners',
  'minimal-line', 'shadow-3d',
];

// Frame types that support background color
const BG_COLOR_FRAMES: FrameStyle[] = [
  'sticker', 'banner-bottom', 'banner-top', 'ribbon',
];

const fontSizeOptions: { value: FrameFontSize; label: string }[] = [
  { value: 'sm', label: 'Small' },
  { value: 'base', label: 'Medium' },
  { value: 'lg', label: 'Large' },
  { value: 'xl', label: 'Extra Large' },
];

const fontFamilyOptions: { value: FrameFontFamily; label: string }[] = [
  { value: 'sans', label: 'Sans' },
  { value: 'serif', label: 'Serif' },
  { value: 'mono', label: 'Mono' },
  { value: 'rounded', label: 'Rounded' },
];

const iconOptions: { value: FrameIcon; label: string; icon: React.ComponentType<{ className?: string }> | null }[] = [
  { value: 'none', label: 'None', icon: Ban },
  { value: 'qr-code', label: 'QR', icon: QrCode },
  { value: 'smartphone', label: 'Phone', icon: Smartphone },
  { value: 'camera', label: 'Camera', icon: Camera },
  { value: 'scan', label: 'Scan', icon: ScanLine },
  { value: 'arrow-right', label: 'Arrow', icon: ArrowRight },
  { value: 'download', label: 'Download', icon: Download },
  { value: 'external-link', label: 'Link', icon: ExternalLink },
  { value: 'finger-print', label: 'Touch', icon: Fingerprint },
];

const iconPositionOptions: { value: FrameIconPosition; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
];

const speechPointerOptions: { value: 'bottom' | 'top' | 'left' | 'right'; label: string }[] = [
  { value: 'bottom', label: 'Bottom' },
  { value: 'top', label: 'Top' },
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
];

// Mini preview for each frame style
function FrameMiniPreview({ frameId, isActive }: { frameId: string; isActive: boolean }) {
  const previewStyles: Record<string, React.CSSProperties> = {
    'none': {},
    'simple': { border: '2px solid #374151' },
    'rounded': { border: '2px solid #374151', borderRadius: '8px' },
    'bottom-label': { border: '2px solid #374151', borderRadius: '6px' },
    'top-label': { border: '2px solid #374151', borderRadius: '6px' },
    'badge': { border: '2px solid #374151', borderRadius: '6px' },
    'speech-bubble': { border: '2px solid #374151', borderRadius: '6px' },
    'circular': { border: '2px solid #374151', borderRadius: '50%' },
    'ribbon': { border: '2px solid #374151', borderRadius: '6px' },
    'sticker': { backgroundColor: '#FEF3C7', borderRadius: '6px', transform: 'rotate(-1deg)' },
    'gradient-border': { border: '2px solid transparent', borderRadius: '6px', backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #6366F1, #EC4899)', backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box' },
    'decorative-corners': {},
    'minimal-line': {},
    'shadow-3d': { borderRadius: '6px', boxShadow: '3px 3px 0px #d1d5db' },
    'banner-bottom': { borderRadius: '6px', overflow: 'hidden' },
    'banner-top': { borderRadius: '6px', overflow: 'hidden' },
  };

  return (
    <div
      className={cn(
        'w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-800 transition-all',
        isActive && 'ring-2 ring-orange-500'
      )}
      style={previewStyles[frameId] || {}}
    >
      <div className="w-5 h-5 bg-gray-800 dark:bg-gray-200 rounded-sm" />
      {frameId === 'speech-bubble' && (
        <div className="absolute -bottom-1 w-0 h-0" style={{ borderLeft: '3px solid transparent', borderRight: '3px solid transparent', borderTop: '4px solid #374151' }} />
      )}
    </div>
  );
}

export const FrameSection = memo(function FrameSection() {
  const { styleOptions, setStyleOptions } = useQRStore(useShallow((s) => ({ styleOptions: s.styleOptions, setStyleOptions: s.setStyleOptions })));
  const [showAdvanced, setShowAdvanced] = useState(false);

  const selectedFrame = styleOptions.frameStyle || 'none';
  const currentLabel = styleOptions.frameLabel || '';
  const showLabelInput = LABEL_FRAMES.includes(selectedFrame);
  const showBorderColor = BORDER_COLOR_FRAMES.includes(selectedFrame);
  const showBgColor = BG_COLOR_FRAMES.includes(selectedFrame);

  const handleFrameStyleChange = useCallback((style: FrameStyle) => {
    setStyleOptions({ frameStyle: style });
  }, [setStyleOptions]);

  const handleLabelChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setStyleOptions({ frameLabel: e.target.value });
  }, [setStyleOptions]);

  const handleQuickLabel = useCallback((label: string) => {
    setStyleOptions({ frameLabel: label });
  }, [setStyleOptions]);

  const handleFontSizeChange = useCallback((size: FrameFontSize) => {
    setStyleOptions({ frameFontSize: size });
  }, [setStyleOptions]);

  const handleFontFamilyChange = useCallback((family: FrameFontFamily) => {
    setStyleOptions({ frameFontFamily: family });
  }, [setStyleOptions]);

  const handleIconChange = useCallback((icon: FrameIcon) => {
    setStyleOptions({
      frameIcon: icon,
      frameIconPosition: icon === 'none' ? 'none' : (styleOptions.frameIconPosition || 'left')
    });
  }, [setStyleOptions, styleOptions.frameIconPosition]);

  const handleIconPositionChange = useCallback((position: FrameIconPosition) => {
    setStyleOptions({ frameIconPosition: position });
  }, [setStyleOptions]);

  return (
    <div className="space-y-4">
      {/* Frame Template Selection - Visual Picker */}
      <div>
        <LabelWithTooltip
          label="Frame Style"
          tooltip={
            <div className="space-y-1">
              <p className="font-medium">Add a decorative border around your QR code.</p>
              <p className="text-gray-300 dark:text-gray-600">Choose from basic, label, decorative, and shaped frames to make your QR code stand out.</p>
            </div>
          }
          className="mb-3"
        />

        {FRAME_CATEGORIES.map((category) => (
          <div key={category.label} className="mb-3">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
              {category.label}
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {category.frames.map((frame) => (
                <button
                  key={frame.id}
                  onClick={() => handleFrameStyleChange(frame.id as FrameStyle)}
                  aria-pressed={selectedFrame === frame.id}
                  className={cn(
                    'flex flex-col items-center gap-1.5 p-2.5 min-h-[68px] rounded-xl border transition-all text-center touch-manipulation',
                    selectedFrame === frame.id
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 ring-1 ring-orange-500'
                      : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  )}
                >
                  <FrameMiniPreview frameId={frame.id} isActive={selectedFrame === frame.id} />
                  <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400 leading-tight">
                    {frame.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Label Input - Only show if frame supports labels */}
      {showLabelInput && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Type className="w-4 h-4" />
            <LabelWithTooltip
              label="Label Text"
              tooltip="Short call-to-action text displayed with the frame. Keep it brief and actionable for best results."
            />
          </div>

          <Input
            value={currentLabel}
            onChange={handleLabelChange}
            placeholder="Enter label text..."
            maxLength={FRAME_CONFIG.MAX_LABEL_LENGTH}
          />

          {/* Quick Label Suggestions */}
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Quick suggestions:</p>
            <div className="flex flex-wrap gap-1.5">
              {FRAME_CONFIG.DEFAULT_LABELS.map((label) => (
                <button
                  key={label}
                  onClick={() => handleQuickLabel(label)}
                  aria-pressed={currentLabel === label}
                  className={cn(
                    'px-3 py-2 min-h-[36px] text-xs rounded-md border transition-colors touch-manipulation',
                    'focus:outline-none focus:ring-2 focus:ring-orange-400',
                    currentLabel === label
                      ? 'border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 text-gray-600 dark:text-gray-400'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            {currentLabel.length}/{FRAME_CONFIG.MAX_LABEL_LENGTH} characters
          </p>
        </div>
      )}

      {/* Speech Bubble Pointer Direction */}
      {selectedFrame === 'speech-bubble' && (
        <SelectButtonGroup
          label="Pointer Direction"
          options={speechPointerOptions}
          value={styleOptions.frameSpeechPointer || 'bottom'}
          onChange={(dir) => setStyleOptions({ frameSpeechPointer: dir })}
        />
      )}

      {/* Gradient Colors for gradient-border frame */}
      {selectedFrame === 'gradient-border' && (
        <div>
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Gradient Colors</p>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2">
              <input
                type="color"
                value={styleOptions.frameGradientColors?.[0] || '#6366F1'}
                onChange={(e) => setStyleOptions({
                  frameGradientColors: [e.target.value, styleOptions.frameGradientColors?.[1] || '#EC4899']
                })}
                className="w-8 h-8 rounded cursor-pointer"
              />
              <span className="text-xs text-gray-500">Start</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="color"
                value={styleOptions.frameGradientColors?.[1] || '#EC4899'}
                onChange={(e) => setStyleOptions({
                  frameGradientColors: [styleOptions.frameGradientColors?.[0] || '#6366F1', e.target.value]
                })}
                className="w-8 h-8 rounded cursor-pointer"
              />
              <span className="text-xs text-gray-500">End</span>
            </label>
          </div>
        </div>
      )}

      {/* Border & Background Color Controls */}
      {(showBorderColor || showBgColor) && (
        <div className="flex flex-wrap gap-4">
          {showBorderColor && (
            <label className="flex items-center gap-2">
              <input
                type="color"
                value={styleOptions.frameBorderColor || '#374151'}
                onChange={(e) => setStyleOptions({ frameBorderColor: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer"
              />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Border</span>
            </label>
          )}
          {showBgColor && (
            <label className="flex items-center gap-2">
              <input
                type="color"
                value={styleOptions.frameBgColor || '#1f2937'}
                onChange={(e) => setStyleOptions({ frameBgColor: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer"
              />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Background</span>
            </label>
          )}
        </div>
      )}

      {/* Border Radius & Padding Sliders */}
      {selectedFrame !== 'none' && (
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Border Radius</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{styleOptions.frameBorderRadius ?? 8}px</span>
            </div>
            <input
              type="range"
              min={0}
              max={32}
              value={styleOptions.frameBorderRadius ?? 8}
              onChange={(e) => setStyleOptions({ frameBorderRadius: Number(e.target.value) })}
              className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Padding</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{styleOptions.framePadding ?? 8}px</span>
            </div>
            <input
              type="range"
              min={0}
              max={32}
              value={styleOptions.framePadding ?? 8}
              onChange={(e) => setStyleOptions({ framePadding: Number(e.target.value) })}
              className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>
        </div>
      )}

      {/* Advanced Text Options (collapsible) */}
      {showLabelInput && (
        <div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            Text Options
          </button>

          {showAdvanced && (
            <div className="mt-3 space-y-3">
              <SelectButtonGroup
                label="Font Size"
                options={fontSizeOptions}
                value={styleOptions.frameFontSize || 'base'}
                onChange={handleFontSizeChange}
              />

              <SelectButtonGroup
                label="Font Style"
                options={fontFamilyOptions}
                value={styleOptions.frameFontFamily || 'sans'}
                onChange={handleFontFamilyChange}
              />

              <SelectButtonGroup
                label="Icon"
                options={iconOptions as SelectButtonOption<FrameIcon>[]}
                value={styleOptions.frameIcon || 'none'}
                onChange={handleIconChange}
              />

              {styleOptions.frameIcon && styleOptions.frameIcon !== 'none' && (
                <SelectButtonGroup
                  label="Icon Position"
                  options={iconPositionOptions.filter(o => o.value !== 'none')}
                  value={styleOptions.frameIconPosition || 'left'}
                  onChange={handleIconPositionChange}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

FrameSection.displayName = 'FrameSection';
