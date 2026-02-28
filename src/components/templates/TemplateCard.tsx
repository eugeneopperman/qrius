import { memo, useState } from 'react';
import { Edit2, Copy, Trash2, MoreVertical } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { cn } from '@/utils/cn';
import { QRMiniPreview } from '../ui/QRMiniPreview';
import type { QRStyleOptionsForPreview } from '../ui/QRMiniPreview';
import { QR_CONFIG } from '@/config/constants';
import type { BrandTemplate } from '@/types';

interface TemplateCardProps {
  template: BrandTemplate;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TemplateCard = memo(function TemplateCard({
  template,
  onDuplicate,
  onDelete,
}: TemplateCardProps) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className={cn(
        'relative group rounded-2xl border transition-all shadow-sm',
        'bg-white dark:bg-gray-900',
        'border-gray-100 dark:border-gray-800 hover:border-orange-300 hover:shadow-md'
      )}
    >
      {/* QR Thumbnail */}
      <div
        className="flex items-center justify-center p-4 bg-black/5 dark:bg-white/5 rounded-t-2xl cursor-pointer"
        onClick={() => navigate({ to: '/templates/$id/edit', params: { id: template.id } })}
      >
        <QRMiniPreview
          data={QR_CONFIG.GHOST_DATA}
          size={160}
          styleOptions={template.style as QRStyleOptionsForPreview}
        />
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Name + Date + Menu */}
        <div className="flex items-start justify-between gap-2 mb-3">
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
                      navigate({ to: '/templates/$id/edit', params: { id: template.id } });
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

        {/* Edit Button */}
        <button
          onClick={() => navigate({ to: '/templates/$id/edit', params: { id: template.id } })}
          className="w-full py-2 text-xs font-medium rounded-lg transition-colors bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:text-orange-700 dark:hover:text-orange-300"
        >
          Edit
        </button>
      </div>
    </div>
  );
});

TemplateCard.displayName = 'TemplateCard';
