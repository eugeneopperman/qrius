import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/utils/cn';
import { GOOGLE_FONTS, FONT_CATEGORY_LABELS, FONT_WEIGHT_LABELS, getFontWeights } from '@/config/fonts';
import { useGoogleFont, getFontFamily, preloadFonts } from '@/hooks/useGoogleFont';
import type { GoogleFontCategory } from '@/types';

export interface GoogleFontSelectorProps {
  /** Currently selected font name */
  value?: string;
  /** Callback when font selection changes */
  onChange?: (fontName: string) => void;
  /** Label for the selector */
  label?: string;
  /** Show weight selector alongside font selector */
  showWeightSelector?: boolean;
  /** Currently selected weight (when showWeightSelector is true) */
  weight?: number;
  /** Callback when weight changes */
  onWeightChange?: (weight: number) => void;
}

export function GoogleFontSelector({
  value = '',
  onChange,
  label,
  showWeightSelector = false,
  weight = 400,
  onWeightChange,
}: GoogleFontSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<GoogleFontCategory | 'all'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load the currently selected font
  useGoogleFont(value, weight);

  // Preload popular fonts when dropdown opens
  useEffect(() => {
    if (isOpen) {
      const popularFonts = ['Inter', 'Roboto', 'Open Sans', 'Poppins', 'Montserrat'];
      preloadFonts(popularFonts);
    }
  }, [isOpen]);

  // Filter fonts based on search and category
  const filteredFonts = useMemo(() => {
    let fonts = GOOGLE_FONTS;

    if (activeCategory !== 'all') {
      fonts = fonts.filter((f) => f.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      fonts = fonts.filter((f) => f.name.toLowerCase().includes(query));
    }

    return fonts;
  }, [activeCategory, searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = useCallback(
    (fontName: string) => {
      onChange?.(fontName);
      setIsOpen(false);
      setSearchQuery('');
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      } else if (e.key === 'Enter' && filteredFonts.length > 0) {
        handleSelect(filteredFonts[0].name);
      }
    },
    [filteredFonts, handleSelect]
  );

  const availableWeights = value ? getFontWeights(value) : [400, 700];

  return (
    <div className="space-y-3">
      {/* Font Selector */}
      <div className="relative" ref={dropdownRef}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {label}
          </label>
        )}

        {/* Trigger Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'w-full px-3 py-2.5 min-h-[44px] text-left rounded-lg border transition-colors',
            'flex items-center justify-between gap-2',
            'bg-white dark:bg-gray-800',
            'border-gray-300 dark:border-gray-600',
            'hover:border-indigo-400 dark:hover:border-indigo-500',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500',
            isOpen && 'border-indigo-500 ring-2 ring-indigo-500/20'
          )}
        >
          <span
            className="flex-1 truncate text-gray-900 dark:text-gray-100"
            style={{ fontFamily: value ? getFontFamily(value) : undefined }}
          >
            {value || 'Select a font...'}
          </span>
          <ChevronDown
            className={cn(
              'w-4 h-4 text-gray-400 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg max-h-80 overflow-hidden">
            {/* Search */}
            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search fonts..."
                className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Category Tabs */}
            <div className="flex gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className={cn(
                  'px-2 py-1 text-xs rounded-md transition-colors',
                  activeCategory === 'all'
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                All
              </button>
              {(['sans-serif', 'serif', 'display'] as GoogleFontCategory[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    'px-2 py-1 text-xs rounded-md transition-colors',
                    activeCategory === cat
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                >
                  {FONT_CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>

            {/* Font List */}
            <div className="max-h-48 overflow-y-auto">
              {filteredFonts.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                  No fonts found
                </div>
              ) : (
                filteredFonts.map((font) => (
                  <FontOption
                    key={font.name}
                    name={font.name}
                    category={font.category}
                    isSelected={font.name === value}
                    onClick={() => handleSelect(font.name)}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Weight Selector */}
      {showWeightSelector && value && (
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
            Font Weight
          </label>
          <div className="flex flex-wrap gap-1.5">
            {availableWeights.map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => onWeightChange?.(w)}
                className={cn(
                  'px-3 py-2 min-h-[36px] text-xs rounded-md border transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-orange-400',
                  weight === w
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                    : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 text-gray-600 dark:text-gray-400'
                )}
              >
                {FONT_WEIGHT_LABELS[w] || w}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Font option component with lazy font loading
function FontOption({
  name,
  category,
  isSelected,
  onClick,
}: {
  name: string;
  category: GoogleFontCategory;
  isSelected: boolean;
  onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  // Load font on hover for preview
  useGoogleFont(isHovered || isSelected ? name : undefined);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      className={cn(
        'w-full px-3 py-2.5 text-left flex items-center justify-between gap-2 transition-colors',
        'hover:bg-gray-50 dark:hover:bg-gray-700/50',
        isSelected && 'bg-indigo-50 dark:bg-indigo-900/30'
      )}
    >
      <div className="flex-1 min-w-0">
        <span
          className={cn(
            'block text-sm truncate',
            isSelected
              ? 'text-indigo-700 dark:text-indigo-300 font-medium'
              : 'text-gray-900 dark:text-gray-100'
          )}
          style={{ fontFamily: isHovered || isSelected ? getFontFamily(name) : undefined }}
        >
          {name}
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500 capitalize">
          {category.replace('-', ' ')}
        </span>
      </div>
      {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />}
    </button>
  );
}

GoogleFontSelector.displayName = 'GoogleFontSelector';
