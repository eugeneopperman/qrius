import { memo, useCallback, useState } from 'react';
import { useStudioStore } from '@/stores/studioStore';
import { useShallow } from 'zustand/react/shallow';
import {
  Ban,
  QrCode,
  Smartphone,
  Camera,
  ArrowRight,
  Download,
  ExternalLink,
  ScanLine,
  Fingerprint,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { SelectButtonGroup, type SelectButtonOption } from '@/components/ui/SelectButtonGroup';
import { cn } from '@/utils/cn';
import { FRAME_CONFIG } from '@/config/constants';
import type { FrameFontSize, FrameFontFamily, FrameIcon, FrameIconPosition } from '@/types';

const fontSizeOptions: { value: FrameFontSize; label: string }[] = [
  { value: 'sm', label: 'Small' },
  { value: 'base', label: 'Medium' },
  { value: 'lg', label: 'Large' },
  { value: 'xl', label: 'XL' },
];

const fontFamilyOptions: { value: FrameFontFamily; label: string }[] = [
  { value: 'sans', label: 'Sans' },
  { value: 'serif', label: 'Serif' },
  { value: 'mono', label: 'Mono' },
  { value: 'rounded', label: 'Rounded' },
];

const iconOptions: { value: FrameIcon; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'none', label: 'None', icon: Ban },
  { value: 'qr-code', label: 'QR', icon: QrCode },
  { value: 'smartphone', label: 'Phone', icon: Smartphone },
  { value: 'camera', label: 'Camera', icon: Camera },
  { value: 'scan', label: 'Scan', icon: ScanLine },
  { value: 'arrow-right', label: 'Arrow', icon: ArrowRight },
  { value: 'download', label: 'DL', icon: Download },
  { value: 'external-link', label: 'Link', icon: ExternalLink },
  { value: 'finger-print', label: 'Touch', icon: Fingerprint },
];

const iconPositionOptions: { value: FrameIconPosition; label: string }[] = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
];

// Label-supporting frame types
const LABEL_FRAMES = [
  'bottom-label', 'top-label', 'badge',
  'speech-bubble', 'ribbon', 'sticker',
  'banner-bottom', 'banner-top',
];

export const PanelLabel = memo(function PanelLabel() {
  const { style, updateStyle } = useStudioStore(
    useShallow((s) => ({ style: s.style, updateStyle: s.updateStyle }))
  );

  const [showIcons, setShowIcons] = useState(false);
  const frameStyle = style.frameStyle || 'none';
  const supportsLabel = LABEL_FRAMES.includes(frameStyle);
  const currentLabel = style.frameLabel || '';

  const handleLabelChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateStyle({ frameLabel: e.target.value });
    },
    [updateStyle]
  );

  const handleIconChange = useCallback(
    (icon: FrameIcon) => {
      updateStyle({
        frameIcon: icon,
        frameIconPosition: icon === 'none' ? 'none' : (style.frameIconPosition || 'left'),
      });
    },
    [updateStyle, style.frameIconPosition]
  );

  if (!supportsLabel) {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Label</h3>
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Select a frame that supports labels (bottom label, badge, banner, etc.) to add text.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Label</h3>

      {/* Label Text */}
      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Text</label>
        <Input
          value={currentLabel}
          onChange={handleLabelChange}
          placeholder="Enter label text..."
          maxLength={FRAME_CONFIG.MAX_LABEL_LENGTH}
        />
        <p className="text-[10px] text-gray-400 mt-1">
          {currentLabel.length}/{FRAME_CONFIG.MAX_LABEL_LENGTH}
        </p>
      </div>

      {/* Quick Suggestions */}
      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Suggestions</label>
        <div className="flex flex-wrap gap-1">
          {FRAME_CONFIG.DEFAULT_LABELS.map((label) => (
            <button
              key={label}
              onClick={() => updateStyle({ frameLabel: label })}
              className={cn(
                'px-2 py-1 text-[10px] rounded-md border transition-colors',
                currentLabel === label
                  ? 'border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300'
                  : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-orange-300'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Font Size</label>
        <SelectButtonGroup
          options={fontSizeOptions}
          value={style.frameFontSize || 'base'}
          onChange={(v) => updateStyle({ frameFontSize: v })}
          size="sm"
        />
      </div>

      {/* Font Family */}
      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Font Style</label>
        <SelectButtonGroup
          options={fontFamilyOptions}
          value={style.frameFontFamily || 'sans'}
          onChange={(v) => updateStyle({ frameFontFamily: v })}
          size="sm"
        />
      </div>

      {/* Icon Section (collapsible) */}
      <div>
        <button
          onClick={() => setShowIcons(!showIcons)}
          className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          {showIcons ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          Icon
        </button>

        {showIcons && (
          <div className="mt-2 space-y-3">
            <SelectButtonGroup
              options={iconOptions as SelectButtonOption<FrameIcon>[]}
              value={style.frameIcon || 'none'}
              onChange={handleIconChange}
              size="sm"
            />

            {style.frameIcon && style.frameIcon !== 'none' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Position</label>
                <SelectButtonGroup
                  options={iconPositionOptions}
                  value={style.frameIconPosition || 'left'}
                  onChange={(v) => updateStyle({ frameIconPosition: v })}
                  size="sm"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

PanelLabel.displayName = 'PanelLabel';
