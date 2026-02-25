import { useState, useRef } from 'react';
import { Link2, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface EditUrlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string) => Promise<void>;
  currentUrl: string;
  qrType: string;
  isLoading?: boolean;
}

export function EditUrlModal({ isOpen, onClose, onSubmit, currentUrl, qrType, isLoading }: EditUrlModalProps) {
  const [url, setUrl] = useState(currentUrl);
  const [error, setError] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useFocusTrap(isOpen, dialogRef, {
    initialFocusRef: inputRef,
    onEscape: onClose,
  });

  if (!isOpen) return null;

  const isUrlType = !qrType || qrType === 'url';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) {
      setError('URL is required');
      return;
    }
    if (isUrlType) {
      try {
        const parsed = new URL(trimmed);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
          setError('URL must start with http:// or https://');
          return;
        }
      } catch {
        setError('Please enter a valid URL');
        return;
      }
    }
    setError('');
    try {
      await onSubmit(trimmed);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update URL');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Edit destination URL"
        className="relative glass-heavy rounded-2xl shadow-xl p-6 w-full max-w-md mx-4"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <Link2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Destination URL</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            ref={inputRef}
            label={isUrlType ? 'URL' : 'Content'}
            placeholder={isUrlType ? 'https://example.com' : 'Enter content...'}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            error={error}
            autoFocus
          />

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading} className="flex-1">
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
