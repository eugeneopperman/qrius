import { useEffect, useRef } from 'react';
import { useQRStore } from '@/stores/qrStore';
import { QR_TYPES } from '@/config/constants';
import type { QRCodeType } from '@/types';

interface KeyboardCallbacks {
  onDownload?: () => void;
  onDownloadWithPicker?: () => void;
  onCopy?: () => void;
  onToggleDarkMode?: () => void;
  onShowHelp?: () => void;
  onOpenReader?: () => void;
  onOpenHistory?: () => void;
  onOpenTemplates?: () => void;
}

export function useKeyboardShortcuts(callbacks: KeyboardCallbacks) {
  const { setActiveType } = useQRStore();

  // Use refs to store callbacks to avoid re-subscribing on every render
  const callbacksRef = useRef<KeyboardCallbacks>(callbacks);
  const setActiveTypeRef = useRef(setActiveType);

  // Update refs when callbacks change (without triggering effect re-run)
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    setActiveTypeRef.current = setActiveType;
  }, [setActiveType]);

  useEffect(() => {
    const typeOrder: readonly QRCodeType[] = QR_TYPES;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const isMac = (navigator as Navigator & { userAgentData?: { platform: string } }).userAgentData?.platform === 'macOS'
        || /mac/i.test(navigator.platform);
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Number keys 1-9 to switch QR type (with Ctrl/Cmd)
      if (cmdOrCtrl && !e.shiftKey && e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key) - 1;
        if (index < typeOrder.length) {
          e.preventDefault();
          setActiveTypeRef.current(typeOrder[index]);
        }
        return;
      }

      // Ctrl/Cmd + S - Download
      if (cmdOrCtrl && !e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        callbacksRef.current.onDownload?.();
        return;
      }

      // Ctrl/Cmd + Shift + S - Download with format picker
      if (cmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        callbacksRef.current.onDownloadWithPicker?.();
        return;
      }

      // Ctrl/Cmd + C - Copy (when not in input)
      if (cmdOrCtrl && !e.shiftKey && e.key.toLowerCase() === 'c') {
        // Only handle if nothing is selected
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) {
          e.preventDefault();
          callbacksRef.current.onCopy?.();
        }
        return;
      }

      // Ctrl/Cmd + D - Toggle dark mode
      if (cmdOrCtrl && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        callbacksRef.current.onToggleDarkMode?.();
        return;
      }

      // ? - Show help
      if (e.key === '?' && !cmdOrCtrl) {
        e.preventDefault();
        callbacksRef.current.onShowHelp?.();
        return;
      }

      // Ctrl/Cmd + R - Open QR Reader
      if (cmdOrCtrl && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        callbacksRef.current.onOpenReader?.();
        return;
      }

      // Ctrl/Cmd + H - Open History
      if (cmdOrCtrl && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        callbacksRef.current.onOpenHistory?.();
        return;
      }

      // Ctrl/Cmd + T - Open Templates
      if (cmdOrCtrl && e.key.toLowerCase() === 't') {
        e.preventDefault();
        callbacksRef.current.onOpenTemplates?.();
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []); // Empty deps - listener is added once, refs handle updates
}

// Re-export shortcuts from constants for backwards compatibility
export { SHORTCUTS as shortcuts } from '@/config/constants';
