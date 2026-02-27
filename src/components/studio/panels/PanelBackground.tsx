import { memo } from 'react';
import { useStudioStore } from '@/stores/studioStore';
import { useShallow } from 'zustand/react/shallow';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { cn } from '@/utils/cn';

const BG_PRESETS = [
  { color: '#ffffff', label: 'White' },
  { color: '#f8fafc', label: 'Slate 50' },
  { color: '#f0f9ff', label: 'Sky 50' },
  { color: '#f0fdf4', label: 'Green 50' },
  { color: '#fef3c7', label: 'Amber 100' },
  { color: '#fdf2f8', label: 'Pink 50' },
  { color: '#faf5ff', label: 'Purple 50' },
  { color: '#fff7ed', label: 'Orange 50' },
  { color: '#f5f5f4', label: 'Stone 100' },
  { color: '#fefce8', label: 'Yellow 50' },
  { color: '#ecfdf5', label: 'Emerald 50' },
  { color: '#000000', label: 'Black' },
];

export const PanelBackground = memo(function PanelBackground() {
  const { style, updateStyle } = useStudioStore(
    useShallow((s) => ({ style: s.style, updateStyle: s.updateStyle }))
  );

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Background</h3>

      <ColorPicker
        label="Background Color"
        value={style.backgroundColor || '#ffffff'}
        onChange={(c) => updateStyle({ backgroundColor: c })}
      />

      {/* Presets */}
      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
          Presets
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {BG_PRESETS.map((preset) => (
            <button
              key={preset.color}
              onClick={() => updateStyle({ backgroundColor: preset.color })}
              className={cn(
                'w-full h-8 rounded-lg border transition-all hover:ring-2 hover:ring-orange-400',
                style.backgroundColor === preset.color
                  ? 'ring-2 ring-orange-500'
                  : 'border-gray-200 dark:border-gray-600'
              )}
              style={{ backgroundColor: preset.color }}
              title={preset.label}
            />
          ))}
        </div>
      </div>

      <p className="text-[10px] text-gray-500 dark:text-gray-400">
        Dark QR codes on light backgrounds work best for reliable scanning.
      </p>
    </div>
  );
});

PanelBackground.displayName = 'PanelBackground';
