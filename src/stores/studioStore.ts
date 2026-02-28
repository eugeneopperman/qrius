/**
 * Studio Store — manages Template Studio session state with undo/redo.
 * NOT persisted — each studio session starts fresh.
 */

import { create } from 'zustand';
import { useTemplateStore } from './templateStore';
import { toast } from './toastStore';
import type { BrandTemplate, BrandTemplateStyle } from '@/types';

export type StudioPanel = 'dots-colors' | 'frame' | 'logo' | 'label' | 'background' | null;

const LABEL_SUPPORTING_FRAMES = [
  'bottom-label', 'top-label', 'badge',
  'speech-bubble', 'ribbon', 'sticker',
  'banner-bottom', 'banner-top',
];

const DEFAULT_STYLE: BrandTemplateStyle = {
  dotsColor: '#000000',
  backgroundColor: '#ffffff',
  dotsType: 'square',
  cornersSquareType: 'square',
  cornersDotType: 'square',
  errorCorrectionLevel: 'H',
  qrRoundness: undefined,
  qrPattern: 'solid',
  frameBorderRadius: 0,
  frameStyle: 'none',
};

const MAX_UNDO_STACK = 50;

export interface PopoverState {
  panel: NonNullable<StudioPanel>;
  x: number;
  y: number;
}

interface StudioState {
  templateId: string | null;
  templateName: string;
  style: BrandTemplateStyle;
  activePanel: StudioPanel;
  undoStack: BrandTemplateStyle[];
  redoStack: BrandTemplateStyle[];
  isDirty: boolean;
  originalStyle: BrandTemplateStyle | null;
  hasInteracted: boolean;
  popover: PopoverState | null;

  // Debounce timer for undo pushes
  _undoTimer: ReturnType<typeof setTimeout> | null;

  // Actions
  initNew: () => void;
  initFromTemplate: (template: BrandTemplate) => void;
  updateStyle: (updates: Partial<BrandTemplateStyle>) => void;
  setActivePanel: (panel: StudioPanel) => void;
  setTemplateName: (name: string) => void;
  setPopover: (popover: PopoverState | null) => void;
  undo: () => void;
  redo: () => void;
  save: (dbSave?: (name: string, style: BrandTemplateStyle, id?: string) => Promise<string>) => string;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

export const useStudioStore = create<StudioState>()((set, get) => ({
  templateId: null,
  templateName: 'Untitled Template',
  style: { ...DEFAULT_STYLE },
  activePanel: null,
  undoStack: [],
  redoStack: [],
  isDirty: false,
  originalStyle: null,
  hasInteracted: false,
  popover: null,
  _undoTimer: null,

  initNew: () => {
    set({
      templateId: null,
      templateName: 'Untitled Template',
      style: { ...DEFAULT_STYLE },
      activePanel: null,
      undoStack: [],
      redoStack: [],
      isDirty: false,
      originalStyle: null,
      hasInteracted: false,
      popover: null,
    });
  },

  initFromTemplate: (template: BrandTemplate) => {
    const style = { ...DEFAULT_STYLE, ...template.style };
    set({
      templateId: template.id,
      templateName: template.name,
      style,
      activePanel: null,
      undoStack: [],
      redoStack: [],
      isDirty: false,
      originalStyle: { ...style },
      hasInteracted: false,
      popover: null,
    });
  },

  updateStyle: (updates: Partial<BrandTemplateStyle>) => {
    const state = get();
    const prevStyle = { ...state.style };
    const newStyle = { ...state.style, ...updates };

    // Auto-populate label when switching to a label-supporting frame with no label
    if (
      updates.frameStyle &&
      LABEL_SUPPORTING_FRAMES.includes(updates.frameStyle) &&
      !newStyle.frameLabel
    ) {
      newStyle.frameLabel = 'Scan Me';
    }

    // Debounced undo push — avoids flooding during slider drags
    if (state._undoTimer) clearTimeout(state._undoTimer);
    const timer = setTimeout(() => {
      const current = get();
      const stack = [...current.undoStack, prevStyle];
      if (stack.length > MAX_UNDO_STACK) stack.shift();
      set({ undoStack: stack, redoStack: [], _undoTimer: null });
    }, 500);

    set({
      style: newStyle,
      isDirty: true,
      _undoTimer: timer,
    });
  },

  setActivePanel: (panel: StudioPanel) => {
    set({ activePanel: panel, hasInteracted: true });
  },

  setPopover: (popover: PopoverState | null) => {
    set({ popover });
  },

  setTemplateName: (name: string) => {
    set({ templateName: name, isDirty: true });
  },

  undo: () => {
    const { undoStack, style, _undoTimer } = get();
    if (_undoTimer) {
      clearTimeout(_undoTimer);
      set({ _undoTimer: null });
    }
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    set({
      style: prev,
      undoStack: undoStack.slice(0, -1),
      redoStack: [...get().redoStack, style],
      isDirty: true,
    });
  },

  redo: () => {
    const { redoStack, style } = get();
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    set({
      style: next,
      redoStack: redoStack.slice(0, -1),
      undoStack: [...get().undoStack, style],
      isDirty: true,
    });
  },

  save: (dbSave) => {
    const { templateId, templateName, style } = get();

    // DB mode: delegate to async handler
    if (dbSave) {
      dbSave(templateName, style, templateId || undefined)
        .then((savedId) => {
          set({ templateId: savedId, isDirty: false, originalStyle: { ...style } });
          toast.success(templateId ? 'Template updated!' : 'Template created!');
        })
        .catch((err: Error) => {
          if (err.message?.includes('limit reached')) {
            toast.error('Template limit reached. Upgrade to Pro for unlimited templates.');
          } else {
            toast.error('Failed to save template');
          }
        });
      return templateId || 'saving';
    }

    // localStorage mode: synchronous save via templateStore
    const templateStore = useTemplateStore.getState();

    if (templateId) {
      // Update existing
      templateStore.openWizard(templateId);
      templateStore.updateDraft({ name: templateName, style });
      const savedId = templateStore.saveTemplate();
      templateStore.closeWizard();
      set({ isDirty: false, originalStyle: { ...style } });
      toast.success('Template updated!');
      return savedId;
    } else {
      // Create new
      templateStore.openWizard();
      templateStore.updateDraft({ name: templateName, style });
      const savedId = templateStore.saveTemplate();
      templateStore.closeWizard();
      if (!savedId) {
        toast.error('Template limit reached. Upgrade to Pro for unlimited templates.');
        return '';
      }
      set({ templateId: savedId, isDirty: false, originalStyle: { ...style } });
      toast.success('Template created!');
      return savedId;
    }
  },

  canUndo: () => get().undoStack.length > 0,
  canRedo: () => get().redoStack.length > 0,
}));

// Selectors
export const selectActivePanel = (s: StudioState) => s.activePanel;
export const selectStyle = (s: StudioState) => s.style;
export const selectIsDirty = (s: StudioState) => s.isDirty;
export const selectTemplateName = (s: StudioState) => s.templateName;
