import { useRef } from 'react';
import { X, Keyboard } from 'lucide-react';
import { shortcuts } from '@/hooks/useKeyboardShortcuts';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap for accessibility
  useFocusTrap(isOpen, dialogRef, {
    initialFocusRef: closeButtonRef,
    onEscape: onClose,
  });

  if (!isOpen) return null;

  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modKey = isMac ? '⌘' : 'Ctrl';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="keyboard-shortcuts-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={dialogRef}
        className="relative glass-heavy rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-divider">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
            <h2 id="keyboard-shortcuts-title" className="text-lg font-semibold text-gray-900 dark:text-white">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label="Close keyboard shortcuts"
          >
            <X className="w-5 h-5 text-gray-500" aria-hidden="true" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2"
            >
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {shortcut.description}
              </span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, keyIndex) => (
                  <span key={keyIndex}>
                    <kbd className="px-2 py-1 text-xs font-mono bg-black/5 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded border border-white/20 dark:border-white/10">
                      {key === 'Ctrl' ? modKey : key}
                    </kbd>
                    {keyIndex < shortcut.keys.length - 1 && (
                      <span className="mx-1 text-gray-400">+</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-divider bg-black/5 dark:bg-white/5">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Press <kbd className="px-1.5 py-0.5 text-xs font-mono bg-black/5 dark:bg-white/5 rounded">?</kbd> anytime to show this dialog
          </p>
        </div>
      </div>
    </div>
  );
}
