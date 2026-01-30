import { useEffect, useCallback } from 'react';
import { useQRStore } from '../stores/qrStore';
import type { QRCodeType } from '../types';

export function useKeyboardShortcuts(callbacks: {
  onDownload?: () => void;
  onDownloadWithPicker?: () => void;
  onCopy?: () => void;
  onToggleDarkMode?: () => void;
  onShowHelp?: () => void;
  onOpenReader?: () => void;
  onOpenHistory?: () => void;
}) {
  const { setActiveType } = useQRStore();

  const typeOrder: QRCodeType[] = [
    'url',
    'text',
    'email',
    'phone',
    'sms',
    'wifi',
    'vcard',
    'event',
    'location',
  ];

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Number keys 1-9 to switch QR type (with Ctrl/Cmd)
      if (cmdOrCtrl && !e.shiftKey && e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key) - 1;
        if (index < typeOrder.length) {
          e.preventDefault();
          setActiveType(typeOrder[index]);
        }
        return;
      }

      // Ctrl/Cmd + S - Download
      if (cmdOrCtrl && !e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        callbacks.onDownload?.();
        return;
      }

      // Ctrl/Cmd + Shift + S - Download with format picker
      if (cmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        callbacks.onDownloadWithPicker?.();
        return;
      }

      // Ctrl/Cmd + C - Copy (when not in input)
      if (cmdOrCtrl && !e.shiftKey && e.key.toLowerCase() === 'c') {
        // Only handle if nothing is selected
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) {
          e.preventDefault();
          callbacks.onCopy?.();
        }
        return;
      }

      // Ctrl/Cmd + D - Toggle dark mode
      if (cmdOrCtrl && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        callbacks.onToggleDarkMode?.();
        return;
      }

      // ? - Show help
      if (e.key === '?' && !cmdOrCtrl) {
        e.preventDefault();
        callbacks.onShowHelp?.();
        return;
      }

      // Ctrl/Cmd + R - Open QR Reader
      if (cmdOrCtrl && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        callbacks.onOpenReader?.();
        return;
      }

      // Ctrl/Cmd + H - Open History
      if (cmdOrCtrl && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        callbacks.onOpenHistory?.();
        return;
      }
    },
    [setActiveType, callbacks]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

export const shortcuts = [
  { keys: ['Ctrl', '1-9'], description: 'Switch QR code type' },
  { keys: ['Ctrl', 'S'], description: 'Download QR code (PNG)' },
  { keys: ['Ctrl', 'Shift', 'S'], description: 'Download with format picker' },
  { keys: ['Ctrl', 'C'], description: 'Copy QR code to clipboard' },
  { keys: ['Ctrl', 'D'], description: 'Toggle dark mode' },
  { keys: ['Ctrl', 'R'], description: 'Open QR code reader' },
  { keys: ['Ctrl', 'H'], description: 'Open history' },
  { keys: ['?'], description: 'Show keyboard shortcuts' },
];
