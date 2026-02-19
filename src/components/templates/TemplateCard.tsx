import { memo, useState } from 'react';
import { Edit2, Copy, Trash2, Check, MoreVertical } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useGoogleFont, getFontFamily } from '@/hooks/useGoogleFont';
import type { BrandTemplate } from '@/types';

interface TemplateCardProps {
  template: BrandTemplate;
  onApply: (id: string) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  isApplied?: boolean;
}

export const TemplateCard = memo(function TemplateCard({
  template,
  onApply,
  onEdit,
  onDuplicate,
  onDelete,
  isApplied = false,
}: TemplateCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const { style } = template;

  // Load Google Font for preview if specified
  useGoogleFont(style.googleFontFamily, style.googleFontWeight);

  // Get gradient preview or solid color
  const getColorPreview = () => {
    if (style.useGradient && style.gradient) {
      const colors = style.gradient.colorStops
        .map((s) => `${s.color} ${s.offset * 100}%`)
        .join(', ');
      if (style.gradient.type === 'radial') {
        return `radial-gradient(circle, ${colors})`;
      }
      return `linear-gradient(${style.gradient.rotation || 0}deg, ${colors})`;
    }
    return style.dotsColor || '#000000';
  };

  return (
    <div
      className={cn(
        'relative group rounded-2xl border transition-all shadow-sm',
        'bg-white dark:bg-gray-900',
        isApplied
          ? 'border-orange-500 ring-2 ring-orange-500/20'
          : 'border-gray-100 dark:border-gray-800 hover:border-orange-300 hover:shadow-md'
      )}
    >
      {/* Color Preview Bar */}
      <div
        className="h-2 rounded-t-2xl"
        style={{ background: getColorPreview() }}
      />

      {/* Content */}
      <div className="p-3">
        {/* Template Info */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate">
              {template.name}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(template.updatedAt).toLocaleDateString()}
            </p>
          </div>

          {/* Menu Button */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Template options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 py-1 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-100 dark:border-gray-800 z-20 min-w-[120px]">
                  <button
                    onClick={() => {
                      onEdit(template.id);
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      onDuplicate(template.id);
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Duplicate
                  </button>
                  <hr className="my-1 border-gray-100 dark:border-gray-800" />
                  <button
                    onClick={() => {
                      onDelete(template.id);
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Style Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {style.useGradient && (
            <span className="px-1.5 py-0.5 text-[10px] bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
              Gradient
            </span>
          )}
          {style.frameStyle && style.frameStyle !== 'none' && (
            <span className="px-1.5 py-0.5 text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded capitalize">
              {style.frameStyle.replace('-', ' ')}
            </span>
          )}
          {style.logoUrl && (
            <span className="px-1.5 py-0.5 text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
              Logo
            </span>
          )}
          {style.googleFontFamily && (
            <span
              className="px-1.5 py-0.5 text-[10px] bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded truncate max-w-[80px]"
              style={{ fontFamily: getFontFamily(style.googleFontFamily) }}
            >
              {style.googleFontFamily}
            </span>
          )}
        </div>

        {/* Apply Button */}
        <button
          onClick={() => onApply(template.id)}
          disabled={isApplied}
          className={cn(
            'w-full py-2 text-xs font-medium rounded-lg transition-colors',
            isApplied
              ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 cursor-default flex items-center justify-center gap-1.5'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:text-orange-700 dark:hover:text-orange-300'
          )}
        >
          {isApplied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              Applied
            </>
          ) : (
            'Apply'
          )}
        </button>
      </div>
    </div>
  );
});

TemplateCard.displayName = 'TemplateCard';
