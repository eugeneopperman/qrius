import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { useStudioStore } from '../studioStore';
import { useTemplateStore } from '../templateStore';
import type { BrandTemplate, BrandTemplateStyle } from '@/types';

// ============================================================================
// Helpers
// ============================================================================

const DEFAULT_STYLE: BrandTemplateStyle = {
  dotsColor: '#000000',
  backgroundColor: '#ffffff',
  dotsType: 'square',
  cornersSquareType: 'square',
  cornersDotType: 'square',
  errorCorrectionLevel: 'H',
  qrRoundness: 0,
  qrPattern: 'solid',
  frameBorderRadius: 0,
  frameStyle: 'none',
};

function makeTemplate(overrides: Partial<BrandTemplate> = {}): BrandTemplate {
  return {
    id: 'tpl-123',
    name: 'Test Template',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    style: { ...DEFAULT_STYLE, dotsColor: '#ff0000' },
    ...overrides,
  };
}

function resetStore() {
  useStudioStore.setState({
    templateId: null,
    templateName: 'Untitled Template',
    style: { ...DEFAULT_STYLE },
    activePanel: null,
    undoStack: [],
    redoStack: [],
    isDirty: false,
    originalStyle: null,
    _undoTimer: null,
  });
}

// ============================================================================
// Tests
// ============================================================================

describe('studioStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetStore();
    // Reset template store
    useTemplateStore.setState({ templates: [], isOpen: false, editingTemplateId: null });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // --------------------------------------------------------------------------
  // Initialization
  // --------------------------------------------------------------------------

  describe('initNew', () => {
    it('resets to default state', () => {
      useStudioStore.getState().updateStyle({ dotsColor: '#ff0000' });
      useStudioStore.getState().initNew();

      const state = useStudioStore.getState();
      expect(state.templateId).toBeNull();
      expect(state.templateName).toBe('Untitled Template');
      expect(state.style.dotsColor).toBe('#000000');
      expect(state.isDirty).toBe(false);
      expect(state.undoStack).toHaveLength(0);
      expect(state.redoStack).toHaveLength(0);
    });
  });

  describe('initFromTemplate', () => {
    it('loads template data into state', () => {
      const template = makeTemplate();
      useStudioStore.getState().initFromTemplate(template);

      const state = useStudioStore.getState();
      expect(state.templateId).toBe('tpl-123');
      expect(state.templateName).toBe('Test Template');
      expect(state.style.dotsColor).toBe('#ff0000');
      expect(state.isDirty).toBe(false);
      expect(state.originalStyle).not.toBeNull();
      expect(state.originalStyle?.dotsColor).toBe('#ff0000');
    });

    it('clears undo/redo stacks', () => {
      useStudioStore.setState({ undoStack: [{ ...DEFAULT_STYLE }], redoStack: [{ ...DEFAULT_STYLE }] });
      useStudioStore.getState().initFromTemplate(makeTemplate());

      expect(useStudioStore.getState().undoStack).toHaveLength(0);
      expect(useStudioStore.getState().redoStack).toHaveLength(0);
    });
  });

  // --------------------------------------------------------------------------
  // Style Updates
  // --------------------------------------------------------------------------

  describe('updateStyle', () => {
    it('updates style and sets isDirty', () => {
      useStudioStore.getState().updateStyle({ dotsColor: '#00ff00' });

      const state = useStudioStore.getState();
      expect(state.style.dotsColor).toBe('#00ff00');
      expect(state.isDirty).toBe(true);
    });

    it('pushes to undo stack after debounce', () => {
      useStudioStore.getState().updateStyle({ dotsColor: '#111111' });
      expect(useStudioStore.getState().undoStack).toHaveLength(0);

      vi.advanceTimersByTime(500);
      expect(useStudioStore.getState().undoStack).toHaveLength(1);
      expect(useStudioStore.getState().undoStack[0].dotsColor).toBe('#000000'); // previous
    });

    it('debounces rapid changes', () => {
      useStudioStore.getState().updateStyle({ dotsColor: '#111111' });
      vi.advanceTimersByTime(200);
      useStudioStore.getState().updateStyle({ dotsColor: '#222222' });
      vi.advanceTimersByTime(200);
      useStudioStore.getState().updateStyle({ dotsColor: '#333333' });
      vi.advanceTimersByTime(500);

      // Only one push to undo stack (the most recent debounce fires)
      expect(useStudioStore.getState().undoStack).toHaveLength(1);
    });

    it('clears redo stack on new change', () => {
      // Setup: make a change and undo it
      useStudioStore.getState().updateStyle({ dotsColor: '#aaa' });
      vi.advanceTimersByTime(500);
      useStudioStore.getState().undo();
      expect(useStudioStore.getState().redoStack).toHaveLength(1);

      // New change should clear redo
      useStudioStore.getState().updateStyle({ dotsColor: '#bbb' });
      vi.advanceTimersByTime(500);
      expect(useStudioStore.getState().redoStack).toHaveLength(0);
    });
  });

  // --------------------------------------------------------------------------
  // Undo / Redo
  // --------------------------------------------------------------------------

  describe('undo', () => {
    it('reverts to previous style', () => {
      useStudioStore.getState().updateStyle({ dotsColor: '#red' });
      vi.advanceTimersByTime(500);

      useStudioStore.getState().undo();
      expect(useStudioStore.getState().style.dotsColor).toBe('#000000');
    });

    it('pushes current style to redo stack', () => {
      useStudioStore.getState().updateStyle({ dotsColor: '#red' });
      vi.advanceTimersByTime(500);

      useStudioStore.getState().undo();
      expect(useStudioStore.getState().redoStack).toHaveLength(1);
      expect(useStudioStore.getState().redoStack[0].dotsColor).toBe('#red');
    });

    it('does nothing if undo stack is empty', () => {
      const styleBefore = { ...useStudioStore.getState().style };
      useStudioStore.getState().undo();
      expect(useStudioStore.getState().style).toEqual(styleBefore);
    });
  });

  describe('redo', () => {
    it('re-applies undone change', () => {
      useStudioStore.getState().updateStyle({ dotsColor: '#123456' });
      vi.advanceTimersByTime(500);
      useStudioStore.getState().undo();

      useStudioStore.getState().redo();
      expect(useStudioStore.getState().style.dotsColor).toBe('#123456');
    });

    it('does nothing if redo stack is empty', () => {
      const styleBefore = { ...useStudioStore.getState().style };
      useStudioStore.getState().redo();
      expect(useStudioStore.getState().style).toEqual(styleBefore);
    });
  });

  // --------------------------------------------------------------------------
  // Template Name
  // --------------------------------------------------------------------------

  describe('setTemplateName', () => {
    it('updates name and sets dirty', () => {
      useStudioStore.getState().setTemplateName('My Template');

      const state = useStudioStore.getState();
      expect(state.templateName).toBe('My Template');
      expect(state.isDirty).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // Active Panel
  // --------------------------------------------------------------------------

  describe('setActivePanel', () => {
    it('sets active panel', () => {
      useStudioStore.getState().setActivePanel('dots-colors');
      expect(useStudioStore.getState().activePanel).toBe('dots-colors');
    });

    it('can set to null', () => {
      useStudioStore.getState().setActivePanel('frame');
      useStudioStore.getState().setActivePanel(null);
      expect(useStudioStore.getState().activePanel).toBeNull();
    });
  });

  // --------------------------------------------------------------------------
  // Save
  // --------------------------------------------------------------------------

  describe('save', () => {
    it('creates new template in templateStore', () => {
      useStudioStore.getState().setTemplateName('Brand A');
      useStudioStore.getState().updateStyle({ dotsColor: '#abcdef' });
      vi.advanceTimersByTime(500);

      const id = useStudioStore.getState().save();
      expect(id).toBeTruthy();
      expect(useStudioStore.getState().isDirty).toBe(false);
      expect(useStudioStore.getState().templateId).toBe(id);

      // Verify in template store
      const templates = useTemplateStore.getState().templates;
      expect(templates).toHaveLength(1);
      expect(templates[0].name).toBe('Brand A');
      expect(templates[0].style.dotsColor).toBe('#abcdef');
    });

    it('updates existing template', () => {
      // First save
      useStudioStore.getState().setTemplateName('Brand A');
      const id = useStudioStore.getState().save();

      // Edit and save again
      useStudioStore.getState().setTemplateName('Brand A v2');
      useStudioStore.getState().updateStyle({ dotsColor: '#999999' });
      vi.advanceTimersByTime(500);

      const id2 = useStudioStore.getState().save();
      expect(id2).toBe(id);

      const templates = useTemplateStore.getState().templates;
      expect(templates).toHaveLength(1);
      expect(templates[0].name).toBe('Brand A v2');
      expect(templates[0].style.dotsColor).toBe('#999999');
    });
  });

  // --------------------------------------------------------------------------
  // canUndo / canRedo
  // --------------------------------------------------------------------------

  describe('canUndo / canRedo', () => {
    it('canUndo is false initially', () => {
      expect(useStudioStore.getState().canUndo()).toBe(false);
    });

    it('canUndo is true after a change', () => {
      useStudioStore.getState().updateStyle({ dotsColor: '#aaa' });
      vi.advanceTimersByTime(500);
      expect(useStudioStore.getState().canUndo()).toBe(true);
    });

    it('canRedo is false initially', () => {
      expect(useStudioStore.getState().canRedo()).toBe(false);
    });

    it('canRedo is true after undo', () => {
      useStudioStore.getState().updateStyle({ dotsColor: '#aaa' });
      vi.advanceTimersByTime(500);
      useStudioStore.getState().undo();
      expect(useStudioStore.getState().canRedo()).toBe(true);
    });
  });
});
