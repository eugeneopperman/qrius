import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '../../utils/cn';
import { useClickOutside } from '../../hooks/useClickOutside';

interface ColorPickerProps {
  label?: string;
  value: string;
  onChange: (color: string) => void;
  presets?: string[];
}

const defaultPresets = [
  '#000000', '#374151', '#6B7280', '#9CA3AF',
  '#EF4444', '#F97316', '#EAB308', '#22C55E',
  '#14B8A6', '#06B6D4', '#3B82F6', '#6366F1',
  '#8B5CF6', '#A855F7', '#EC4899', '#F43F5E',
];

export function ColorPicker({ label, value, onChange, presets = defaultPresets }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const presetRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleClose = useCallback(() => setIsOpen(false), []);
  const containerRef = useClickOutside<HTMLDivElement>(handleClose, isOpen);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Handle keyboard navigation in color presets
  const handlePresetKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    const cols = 8; // Grid columns on desktop
    const totalPresets = presets.length;

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        setFocusedIndex((index + 1) % totalPresets);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        setFocusedIndex((index - 1 + totalPresets) % totalPresets);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(Math.min(index + cols, totalPresets - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(Math.max(index - cols, 0));
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onChange(presets[index]);
        setIsOpen(false);
        break;
    }
  }, [presets, onChange]);

  // Focus the correct preset when focusedIndex changes
  useEffect(() => {
    if (focusedIndex >= 0 && presetRefs.current[focusedIndex]) {
      presetRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex]);

  // Reset focus index when closing
  useEffect(() => {
    if (!isOpen) {
      setFocusedIndex(-1);
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (/^#[0-9A-Fa-f]{6}$/.test(newValue)) {
      onChange(newValue);
    }
  };

  const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <div
          className="flex items-center gap-2 p-2 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-white dark:bg-gray-800"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div
            className="w-8 h-8 rounded-md border border-gray-200 dark:border-gray-600 shrink-0"
            style={{ backgroundColor: value }}
          />
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 bg-transparent text-sm font-mono text-gray-900 dark:text-white focus:outline-none uppercase"
            placeholder="#000000"
          />
          <input
            type="color"
            value={value}
            onChange={handleColorInputChange}
            className="w-6 h-6 cursor-pointer bg-transparent border-0"
            title="Pick a color"
          />
        </div>

        {isOpen && (
          <div
            className="absolute z-50 mt-2 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 w-full"
            role="listbox"
            aria-label="Color presets"
          >
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {presets.map((color, index) => (
                <button
                  key={color}
                  ref={(el) => { presetRefs.current[index] = el; }}
                  type="button"
                  role="option"
                  aria-selected={value === color}
                  aria-label={`Select color ${color}`}
                  tabIndex={focusedIndex === index || (focusedIndex === -1 && index === 0) ? 0 : -1}
                  className={cn(
                    'w-10 h-10 sm:w-8 sm:h-8 rounded-md border-2 transition-transform hover:scale-110 touch-manipulation',
                    'focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-1',
                    value === color
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                      : 'border-transparent'
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    onChange(color);
                    setIsOpen(false);
                  }}
                  onKeyDown={(e) => handlePresetKeyDown(e, index)}
                  onFocus={() => setFocusedIndex(index)}
                  title={color}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
