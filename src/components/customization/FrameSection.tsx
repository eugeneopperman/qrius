import { memo, useCallback } from 'react';
import { useQRStore } from '../../stores/qrStore';
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
  Ban
} from 'lucide-react';
import { Input } from '../ui/Input';
import { cn } from '../../utils/cn';
import { LabelWithTooltip } from '../ui/Tooltip';
import { SelectButtonGroup, type SelectButtonOption } from '../ui/SelectButtonGroup';
import { FRAME_CONFIG } from '../../config/constants';
import type { FrameStyle, FrameFontSize, FrameFontFamily, FrameIcon, FrameIconPosition } from '../../types';

const frameTemplates: { id: FrameStyle; label: string; hasLabel: boolean }[] = [
  { id: 'none', label: 'None', hasLabel: false },
  { id: 'simple', label: 'Simple Border', hasLabel: false },
  { id: 'rounded', label: 'Rounded Border', hasLabel: false },
  { id: 'bottom-label', label: 'Bottom Label', hasLabel: true },
  { id: 'top-label', label: 'Top Label', hasLabel: true },
  { id: 'badge', label: 'Badge Style', hasLabel: true },
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

export const FrameSection = memo(function FrameSection() {
  const { styleOptions, setStyleOptions } = useQRStore();

  const selectedFrame = styleOptions.frameStyle || 'none';
  const currentLabel = styleOptions.frameLabel || '';
  const showLabelInput = frameTemplates.find(f => f.id === selectedFrame)?.hasLabel;

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
      {/* Frame Template Selection */}
      <div>
        <LabelWithTooltip
          label="Frame Style"
          tooltip={
            <div className="space-y-1">
              <p className="font-medium">Add a decorative border around your QR code.</p>
              <p className="text-gray-300 dark:text-gray-600">Frames with labels help guide users to scan and can include a call-to-action like "Scan Me" or "Learn More".</p>
            </div>
          }
          className="mb-2"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {frameTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleFrameStyleChange(template.id)}
              aria-pressed={selectedFrame === template.id}
              className={cn(
                'p-3 min-h-[44px] text-xs font-medium rounded-lg border transition-all text-center touch-manipulation',
                selectedFrame === template.id
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-400'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-300'
              )}
            >
              {template.label}
            </button>
          ))}
        </div>
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
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                      : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 text-gray-600 dark:text-gray-400'
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

          {/* Icon Position - only show if an icon is selected */}
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
  );
});

FrameSection.displayName = 'FrameSection';
