import { memo, useCallback, useState } from 'react';
import { useStudioStore } from '@/stores/studioStore';
import { useShallow } from 'zustand/react/shallow';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/utils/cn';
import { FRAME_CATEGORIES } from '@/config/constants';
import type { FrameStyle } from '@/types';

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
        'w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-800 transition-all',
        isActive && 'ring-2 ring-orange-500'
      )}
      style={previewStyles[frameId] || {}}
    >
      <div className="w-4 h-4 bg-gray-800 dark:bg-gray-200 rounded-sm" />
    </div>
  );
}

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

const speechPointerOptions = [
  { value: 'bottom' as const, label: 'Bottom' },
  { value: 'top' as const, label: 'Top' },
  { value: 'left' as const, label: 'Left' },
  { value: 'right' as const, label: 'Right' },
];

export const PanelFrame = memo(function PanelFrame() {
  const { style, updateStyle } = useStudioStore(
    useShallow((s) => ({ style: s.style, updateStyle: s.updateStyle }))
  );

  const [showAdvanced, setShowAdvanced] = useState(false);

  const selectedFrame = style.frameStyle || 'none';
  const showBorderColor = BORDER_COLOR_FRAMES.includes(selectedFrame);
  const showBgColor = BG_COLOR_FRAMES.includes(selectedFrame);

  const handleFrameChange = useCallback(
    (frameId: FrameStyle) => {
      updateStyle({ frameStyle: frameId });
    },
    [updateStyle]
  );

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Frame</h3>

      {/* Frame Grid — all 16 types categorized */}
      {FRAME_CATEGORIES.map((category) => (
        <div key={category.label}>
          <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
            {category.label}
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {category.frames.map((frame) => (
              <button
                key={frame.id}
                onClick={() => handleFrameChange(frame.id as FrameStyle)}
                className={cn(
                  'flex flex-col items-center gap-1 p-2 min-h-[56px] rounded-lg border transition-all text-center',
                  selectedFrame === frame.id
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 ring-1 ring-orange-500'
                    : 'border-gray-200 dark:border-gray-700 hover:border-orange-300'
                )}
              >
                <FrameMiniPreview frameId={frame.id} isActive={selectedFrame === frame.id} />
                <span className="text-[9px] font-medium text-gray-600 dark:text-gray-400 leading-tight">
                  {frame.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Speech Bubble Pointer */}
      {selectedFrame === 'speech-bubble' && (
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Pointer Direction</label>
          <div className="flex gap-1.5">
            {speechPointerOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateStyle({ frameSpeechPointer: opt.value })}
                className={cn(
                  'flex-1 px-2 py-1.5 text-[10px] font-medium rounded-md border transition-colors',
                  (style.frameSpeechPointer || 'bottom') === opt.value
                    ? 'border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Gradient Border Colors */}
      {selectedFrame === 'gradient-border' && (
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Gradient Colors</label>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5">
              <input
                type="color"
                value={style.frameGradientColors?.[0] || '#6366F1'}
                onChange={(e) => updateStyle({ frameGradientColors: [e.target.value, style.frameGradientColors?.[1] || '#EC4899'] })}
                className="w-7 h-7 rounded cursor-pointer"
              />
              <span className="text-[10px] text-gray-500">Start</span>
            </label>
            <label className="flex items-center gap-1.5">
              <input
                type="color"
                value={style.frameGradientColors?.[1] || '#EC4899'}
                onChange={(e) => updateStyle({ frameGradientColors: [style.frameGradientColors?.[0] || '#6366F1', e.target.value] })}
                className="w-7 h-7 rounded cursor-pointer"
              />
              <span className="text-[10px] text-gray-500">End</span>
            </label>
          </div>
        </div>
      )}

      {/* Advanced: Border/BG colors, radius, padding */}
      {selectedFrame !== 'none' && (
        <div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            Advanced
          </button>

          {showAdvanced && (
            <div className="mt-2 space-y-3">
              {/* Border/BG Colors */}
              {(showBorderColor || showBgColor) && (
                <div className="flex flex-wrap gap-3">
                  {showBorderColor && (
                    <label className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={style.frameBorderColor || '#374151'}
                        onChange={(e) => updateStyle({ frameBorderColor: e.target.value })}
                        className="w-7 h-7 rounded cursor-pointer"
                      />
                      <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">Border</span>
                    </label>
                  )}
                  {showBgColor && (
                    <label className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={style.frameBgColor || '#1f2937'}
                        onChange={(e) => updateStyle({ frameBgColor: e.target.value })}
                        className="w-7 h-7 rounded cursor-pointer"
                      />
                      <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">BG</span>
                    </label>
                  )}
                </div>
              )}

              {/* Border Radius */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">Border Radius</span>
                  <span className="text-[10px] text-gray-500">{style.frameBorderRadius ?? 8}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={32}
                  value={style.frameBorderRadius ?? 8}
                  onChange={(e) => updateStyle({ frameBorderRadius: Number(e.target.value) })}
                  className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
              </div>

              {/* Padding */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">Padding</span>
                  <span className="text-[10px] text-gray-500">{style.framePadding ?? 8}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={32}
                  value={style.framePadding ?? 8}
                  onChange={(e) => updateStyle({ framePadding: Number(e.target.value) })}
                  className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

PanelFrame.displayName = 'PanelFrame';
