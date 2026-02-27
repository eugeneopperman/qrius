import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FolderPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { cn } from '@/utils/cn';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, color: string) => Promise<void>;
  isLoading?: boolean;
}

const COLOR_SWATCHES = [
  { color: '#F97316', label: 'Orange' },
  { color: '#3B82F6', label: 'Blue' },
  { color: '#22C55E', label: 'Green' },
  { color: '#8B5CF6', label: 'Purple' },
  { color: '#EC4899', label: 'Pink' },
  { color: '#6B7280', label: 'Gray' },
];

export function CreateFolderModal({ isOpen, onClose, onSubmit, isLoading }: CreateFolderModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#6B7280');
  const [error, setError] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useFocusTrap(isOpen, dialogRef, {
    initialFocusRef: inputRef,
    onEscape: onClose,
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Folder name is required');
      return;
    }
    if (trimmed.length > 100) {
      setError('Folder name must be 100 characters or fewer');
      return;
    }
    setError('');
    try {
      await onSubmit(trimmed, color);
      setName('');
      setColor('#6B7280');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create folder');
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Create folder"
        className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20">
            <FolderPlus className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">New Folder</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            ref={inputRef}
            label="Name"
            placeholder="e.g. Marketing, Events"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={error}
            autoFocus
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
            <div className="flex gap-2">
              {COLOR_SWATCHES.map((swatch) => (
                <button
                  key={swatch.color}
                  type="button"
                  aria-label={swatch.label}
                  onClick={() => setColor(swatch.color)}
                  className={cn(
                    'w-8 h-8 rounded-full transition-all',
                    color === swatch.color
                      ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900'
                      : 'hover:scale-110'
                  )}
                  style={{
                    backgroundColor: swatch.color,
                    ...(color === swatch.color ? { '--tw-ring-color': swatch.color } as React.CSSProperties : {}),
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading} className="flex-1">
              {isLoading ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
