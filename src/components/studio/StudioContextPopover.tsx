import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useStudioStore, type PopoverState } from '@/stores/studioStore';
import { useShallow } from 'zustand/react/shallow';
import { Palette, Frame, Image, Type, PaintBucket, Trash2, RotateCcw, Upload } from 'lucide-react';
import { ColorPicker } from '@/components/ui/ColorPicker';

interface PopoverAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

const PopoverContent = memo(function PopoverContent({ popover }: { popover: PopoverState }) {
  const { style, updateStyle, setActivePanel, setPopover } = useStudioStore(
    useShallow((s) => ({
      style: s.style,
      updateStyle: s.updateStyle,
      setActivePanel: s.setActivePanel,
      setPopover: s.setPopover,
    }))
  );

  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: popover.x, y: popover.y });

  // Adjust position to stay in viewport
  useEffect(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    let { x, y } = popover;

    // Keep within viewport horizontally
    if (x + rect.width > window.innerWidth - 16) {
      x = window.innerWidth - rect.width - 16;
    }
    if (x < 16) x = 16;

    // Keep within viewport vertically — prefer above click
    if (y - rect.height < 16) {
      y = popover.y + 40; // flip below
    } else {
      y = y - rect.height;
    }

    setPosition({ x, y });
  }, [popover]);

  // Click outside / Escape to dismiss
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setPopover(null);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPopover(null);
    };

    // Delay listener to avoid immediate dismiss from the click that opened it
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }, 50);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [setPopover]);

  const dismiss = useCallback(() => setPopover(null), [setPopover]);

  const runAction = useCallback(
    (fn: () => void) => {
      fn();
      dismiss();
    },
    [dismiss]
  );

  // Build actions based on zone
  const actions: PopoverAction[] = [];
  const panelIcon = {
    'dots-colors': Palette,
    'frame': Frame,
    'logo': Image,
    'label': Type,
    'background': PaintBucket,
  }[popover.panel];

  switch (popover.panel) {
    case 'dots-colors':
      actions.push({
        label: 'Change Style',
        icon: panelIcon,
        onClick: () => runAction(() => setActivePanel('dots-colors')),
      });
      break;
    case 'frame':
      actions.push({
        label: 'Change Frame',
        icon: Frame,
        onClick: () => runAction(() => setActivePanel('frame')),
      });
      actions.push({
        label: 'Remove Frame',
        icon: Trash2,
        onClick: () => runAction(() => updateStyle({ frameStyle: 'none' })),
        variant: 'danger',
      });
      break;
    case 'logo':
      actions.push({
        label: 'Replace Logo',
        icon: Upload,
        onClick: () => runAction(() => setActivePanel('logo')),
      });
      actions.push({
        label: 'Remove Logo',
        icon: Trash2,
        onClick: () => runAction(() => updateStyle({ logoUrl: undefined })),
        variant: 'danger',
      });
      break;
    case 'label':
      actions.push({
        label: 'Edit Label',
        icon: Type,
        onClick: () => runAction(() => setActivePanel('label')),
      });
      break;
    case 'background':
      actions.push({
        label: 'Change Color',
        icon: PaintBucket,
        onClick: () => runAction(() => setActivePanel('background')),
      });
      actions.push({
        label: 'Reset to White',
        icon: RotateCcw,
        onClick: () => runAction(() => updateStyle({ backgroundColor: '#ffffff' })),
      });
      break;
  }

  // Inline color swatch for dots-colors and background
  const showColorPicker = popover.panel === 'dots-colors' || popover.panel === 'background';
  const colorValue =
    popover.panel === 'dots-colors'
      ? style.dotsColor || '#000000'
      : style.backgroundColor || '#ffffff';
  const handleColorChange = useCallback(
    (color: string) => {
      if (popover.panel === 'dots-colors') {
        updateStyle({ dotsColor: color });
      } else {
        updateStyle({ backgroundColor: color });
      }
    },
    [popover.panel, updateStyle]
  );

  return (
    <div
      ref={ref}
      className="fixed z-[80] bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-1.5 min-w-[160px] animate-in fade-in zoom-in-95 duration-150"
      style={{ left: position.x, top: position.y }}
    >
      {/* Quick color swatch */}
      {showColorPicker && (
        <div className="px-2 py-1.5 border-b border-gray-100 dark:border-gray-700 mb-1">
          <ColorPicker
            value={colorValue}
            onChange={handleColorChange}
            size="sm"
          />
        </div>
      )}

      {/* Action buttons */}
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            onClick={action.onClick}
            className={`flex items-center gap-2 w-full px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
              action.variant === 'danger'
                ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {action.label}
          </button>
        );
      })}
    </div>
  );
});

export const StudioContextPopover = memo(function StudioContextPopover() {
  const popover = useStudioStore(
    useShallow((s) => s.popover)
  );

  if (!popover) return null;

  // Don't show on mobile (touch goes straight to panel)
  if (typeof window !== 'undefined' && window.innerWidth < 1024) return null;

  return createPortal(
    <PopoverContent popover={popover} />,
    document.body
  );
});

StudioContextPopover.displayName = 'StudioContextPopover';
