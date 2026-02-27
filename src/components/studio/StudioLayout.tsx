import { memo, useEffect, useCallback, useState } from 'react';
import { useStudioStore } from '@/stores/studioStore';
import { StudioHeader } from './StudioHeader';
import { StudioCanvas } from './StudioCanvas';
import { StudioPanel } from './StudioPanel';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

const PANEL_KEYS: Record<string, 'dots-colors' | 'frame' | 'logo' | 'label' | 'background'> = {
  '1': 'dots-colors',
  '2': 'frame',
  '3': 'logo',
  '4': 'label',
  '5': 'background',
};

export const StudioLayout = memo(function StudioLayout() {
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);

  // Keyboard shortcuts: Cmd+Z undo, Cmd+Shift+Z redo, Cmd+S save, 1-5 panel switch
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore inside inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const isMac = /mac/i.test(navigator.platform);
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Cmd+Z — undo
      if (cmdOrCtrl && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        useStudioStore.getState().undo();
        return;
      }

      // Cmd+Shift+Z — redo
      if (cmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        useStudioStore.getState().redo();
        return;
      }

      // Cmd+S — save
      if (cmdOrCtrl && !e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        useStudioStore.getState().save();
        return;
      }

      // Number keys 1-5 to switch panels (without modifier)
      if (!cmdOrCtrl && !e.altKey && e.key in PANEL_KEYS) {
        e.preventDefault();
        const panel = PANEL_KEYS[e.key];
        const current = useStudioStore.getState().activePanel;
        useStudioStore.getState().setActivePanel(current === panel ? null : panel);
        return;
      }

      // Escape — close panel
      if (e.key === 'Escape') {
        useStudioStore.getState().setActivePanel(null);
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // beforeunload guard for unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (useStudioStore.getState().isDirty) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  const handleConfirmLeave = useCallback(() => {
    setShowLeaveDialog(false);
    if (pendingNavigation) {
      pendingNavigation();
      setPendingNavigation(null);
    }
  }, [pendingNavigation]);

  const handleCancelLeave = useCallback(() => {
    setShowLeaveDialog(false);
    setPendingNavigation(null);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      <StudioHeader />

      {/* Desktop: side-by-side | Mobile: stacked */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Panel (left on desktop, bottom on mobile) */}
        <div className="order-2 lg:order-1 lg:w-80 flex-shrink-0 border-t lg:border-t-0 lg:border-r border-black/[0.06] dark:border-white/[0.06] flex flex-col overflow-hidden max-h-[40vh] lg:max-h-none">
          <StudioPanel />
        </div>

        {/* Canvas (center) */}
        <div className="order-1 lg:order-2 flex-1 min-h-0 overflow-hidden">
          <StudioCanvas />
        </div>
      </div>

      {/* Leave confirmation */}
      <ConfirmDialog
        isOpen={showLeaveDialog}
        onClose={handleCancelLeave}
        onConfirm={handleConfirmLeave}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to leave? Your changes will be lost."
        confirmLabel="Leave"
        cancelLabel="Stay"
        variant="danger"
      />
    </div>
  );
});

StudioLayout.displayName = 'StudioLayout';
