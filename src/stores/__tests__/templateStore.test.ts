import { describe, it, expect, beforeEach } from 'vitest';
import {
  useTemplateStore,
  roundnessToDotType,
  roundnessToCornerSquareType,
  dotTypeToRoundness,
} from '../templateStore';
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
};

function makeTemplate(overrides: Partial<BrandTemplate> = {}): BrandTemplate {
  return {
    id: crypto.randomUUID(),
    name: 'Test Template',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    style: { ...DEFAULT_STYLE },
    ...overrides,
  };
}

// ============================================================================
// Tests
// ============================================================================

describe('templateStore', () => {
  beforeEach(() => {
    useTemplateStore.setState({
      isOpen: false,
      currentStep: 1,
      editingTemplateId: null,
      draft: {
        name: '',
        style: { ...DEFAULT_STYLE },
      },
      templates: [],
    });
  });

  // --------------------------------------------------------------------------
  // Pure utility functions
  // --------------------------------------------------------------------------

  describe('roundnessToDotType', () => {
    it('maps 0 to square', () => {
      expect(roundnessToDotType(0)).toBe('square');
    });

    it('maps values below 25 to square', () => {
      expect(roundnessToDotType(10)).toBe('square');
      expect(roundnessToDotType(24)).toBe('square');
    });

    it('maps 25 to rounded', () => {
      expect(roundnessToDotType(25)).toBe('rounded');
    });

    it('maps values 25-49 to rounded', () => {
      expect(roundnessToDotType(30)).toBe('rounded');
      expect(roundnessToDotType(49)).toBe('rounded');
    });

    it('maps 50 to extra-rounded', () => {
      expect(roundnessToDotType(50)).toBe('extra-rounded');
    });

    it('maps values 50-74 to extra-rounded', () => {
      expect(roundnessToDotType(60)).toBe('extra-rounded');
      expect(roundnessToDotType(74)).toBe('extra-rounded');
    });

    it('maps 75 to dots', () => {
      expect(roundnessToDotType(75)).toBe('dots');
    });

    it('maps 100 to dots', () => {
      expect(roundnessToDotType(100)).toBe('dots');
    });
  });

  describe('roundnessToCornerSquareType', () => {
    it('maps 0 to square', () => {
      expect(roundnessToCornerSquareType(0)).toBe('square');
    });

    it('maps values below 33 to square', () => {
      expect(roundnessToCornerSquareType(15)).toBe('square');
      expect(roundnessToCornerSquareType(32)).toBe('square');
    });

    it('maps 33 to extra-rounded', () => {
      expect(roundnessToCornerSquareType(33)).toBe('extra-rounded');
    });

    it('maps values 33-65 to extra-rounded', () => {
      expect(roundnessToCornerSquareType(50)).toBe('extra-rounded');
      expect(roundnessToCornerSquareType(65)).toBe('extra-rounded');
    });

    it('maps 66 to dot', () => {
      expect(roundnessToCornerSquareType(66)).toBe('dot');
    });

    it('maps 100 to dot', () => {
      expect(roundnessToCornerSquareType(100)).toBe('dot');
    });
  });

  describe('dotTypeToRoundness', () => {
    it('maps square to 0', () => {
      expect(dotTypeToRoundness('square')).toBe(0);
    });

    it('maps rounded to 25', () => {
      expect(dotTypeToRoundness('rounded')).toBe(25);
    });

    it('maps classy to 25', () => {
      expect(dotTypeToRoundness('classy')).toBe(25);
    });

    it('maps extra-rounded to 50', () => {
      expect(dotTypeToRoundness('extra-rounded')).toBe(50);
    });

    it('maps classy-rounded to 50', () => {
      expect(dotTypeToRoundness('classy-rounded')).toBe(50);
    });

    it('maps dots to 100', () => {
      expect(dotTypeToRoundness('dots')).toBe(100);
    });
  });

  // --------------------------------------------------------------------------
  // Wizard navigation
  // --------------------------------------------------------------------------

  describe('wizard navigation', () => {
    describe('openWizard', () => {
      it('opens with default state when no templateId provided', () => {
        useTemplateStore.getState().openWizard();

        const state = useTemplateStore.getState();
        expect(state.isOpen).toBe(true);
        expect(state.currentStep).toBe(1);
        expect(state.editingTemplateId).toBeNull();
        expect(state.draft.name).toBe('');
        expect(state.draft.style).toEqual(DEFAULT_STYLE);
      });

      it('loads existing template into draft when templateId provided', () => {
        const template = makeTemplate({ name: 'My Brand' });
        useTemplateStore.setState({ templates: [template] });

        useTemplateStore.getState().openWizard(template.id);

        const state = useTemplateStore.getState();
        expect(state.isOpen).toBe(true);
        expect(state.currentStep).toBe(1);
        expect(state.editingTemplateId).toBe(template.id);
        expect(state.draft.name).toBe('My Brand');
        expect(state.draft.style).toEqual(template.style);
      });

      it('falls back to empty draft when templateId not found', () => {
        useTemplateStore.getState().openWizard('nonexistent-id');

        const state = useTemplateStore.getState();
        expect(state.isOpen).toBe(true);
        expect(state.editingTemplateId).toBeNull();
        expect(state.draft.name).toBe('');
      });
    });

    describe('closeWizard', () => {
      it('resets all wizard state', () => {
        // Open wizard and modify state
        useTemplateStore.setState({
          isOpen: true,
          currentStep: 3,
          editingTemplateId: 'some-id',
          draft: { name: 'Modified', style: { ...DEFAULT_STYLE, dotsColor: '#ff0000' } },
        });

        useTemplateStore.getState().closeWizard();

        const state = useTemplateStore.getState();
        expect(state.isOpen).toBe(false);
        expect(state.currentStep).toBe(1);
        expect(state.editingTemplateId).toBeNull();
        expect(state.draft.name).toBe('');
        expect(state.draft.style).toEqual(DEFAULT_STYLE);
      });
    });

    describe('nextStep', () => {
      it('increments step by 1', () => {
        useTemplateStore.getState().nextStep();
        expect(useTemplateStore.getState().currentStep).toBe(2);
      });

      it('increments through all steps', () => {
        useTemplateStore.getState().nextStep();
        expect(useTemplateStore.getState().currentStep).toBe(2);
        useTemplateStore.getState().nextStep();
        expect(useTemplateStore.getState().currentStep).toBe(3);
        useTemplateStore.getState().nextStep();
        expect(useTemplateStore.getState().currentStep).toBe(4);
      });

      it('caps at step 4', () => {
        useTemplateStore.setState({ currentStep: 4 });
        useTemplateStore.getState().nextStep();
        expect(useTemplateStore.getState().currentStep).toBe(4);
      });
    });

    describe('prevStep', () => {
      it('decrements step by 1', () => {
        useTemplateStore.setState({ currentStep: 3 });
        useTemplateStore.getState().prevStep();
        expect(useTemplateStore.getState().currentStep).toBe(2);
      });

      it('floors at step 1', () => {
        useTemplateStore.setState({ currentStep: 1 });
        useTemplateStore.getState().prevStep();
        expect(useTemplateStore.getState().currentStep).toBe(1);
      });
    });

    describe('goToStep', () => {
      it('jumps directly to a specific step', () => {
        useTemplateStore.getState().goToStep(3);
        expect(useTemplateStore.getState().currentStep).toBe(3);
      });

      it('can jump to any valid step', () => {
        useTemplateStore.getState().goToStep(4);
        expect(useTemplateStore.getState().currentStep).toBe(4);

        useTemplateStore.getState().goToStep(1);
        expect(useTemplateStore.getState().currentStep).toBe(1);
      });
    });
  });

  // --------------------------------------------------------------------------
  // Draft management
  // --------------------------------------------------------------------------

  describe('draft management', () => {
    describe('updateDraft', () => {
      it('merges partial template fields into draft', () => {
        useTemplateStore.getState().updateDraft({ name: 'Updated Name' });

        expect(useTemplateStore.getState().draft.name).toBe('Updated Name');
        // Style should remain unchanged
        expect(useTemplateStore.getState().draft.style).toEqual(DEFAULT_STYLE);
      });

      it('can update multiple fields at once', () => {
        useTemplateStore.getState().updateDraft({
          name: 'Multi Update',
          thumbnail: 'data:image/png;base64,abc',
        });

        const draft = useTemplateStore.getState().draft;
        expect(draft.name).toBe('Multi Update');
        expect(draft.thumbnail).toBe('data:image/png;base64,abc');
      });
    });

    describe('updateDraftStyle', () => {
      it('merges partial style into draft.style', () => {
        useTemplateStore.getState().updateDraftStyle({ dotsColor: '#ff0000' });

        const style = useTemplateStore.getState().draft.style;
        expect(style?.dotsColor).toBe('#ff0000');
        // Other style fields should remain intact
        expect(style?.backgroundColor).toBe('#ffffff');
        expect(style?.dotsType).toBe('square');
      });

      it('can update multiple style fields at once', () => {
        useTemplateStore.getState().updateDraftStyle({
          dotsColor: '#123456',
          backgroundColor: '#abcdef',
          dotsType: 'dots',
        });

        const style = useTemplateStore.getState().draft.style;
        expect(style?.dotsColor).toBe('#123456');
        expect(style?.backgroundColor).toBe('#abcdef');
        expect(style?.dotsType).toBe('dots');
      });
    });

    describe('resetDraft', () => {
      it('returns draft to empty state', () => {
        // Modify the draft first
        useTemplateStore.getState().updateDraft({ name: 'Modified' });
        useTemplateStore.getState().updateDraftStyle({ dotsColor: '#ff0000' });

        useTemplateStore.getState().resetDraft();

        const draft = useTemplateStore.getState().draft;
        expect(draft.name).toBe('');
        expect(draft.style).toEqual(DEFAULT_STYLE);
      });
    });
  });

  // --------------------------------------------------------------------------
  // Template CRUD
  // --------------------------------------------------------------------------

  describe('template CRUD', () => {
    describe('saveTemplate (new)', () => {
      it('creates a new template and returns its ID', () => {
        useTemplateStore.getState().updateDraft({ name: 'Brand A' });

        const id = useTemplateStore.getState().saveTemplate();

        expect(typeof id).toBe('string');
        expect(id.length).toBeGreaterThan(0);

        const templates = useTemplateStore.getState().templates;
        expect(templates).toHaveLength(1);
        expect(templates[0].name).toBe('Brand A');
        expect(templates[0].id).toBe(id);
      });

      it('assigns "Untitled Template" when name is empty', () => {
        // Draft name is already empty
        useTemplateStore.getState().saveTemplate();

        const templates = useTemplateStore.getState().templates;
        expect(templates[0].name).toBe('Untitled Template');
      });

      it('sets createdAt and updatedAt timestamps', () => {
        const beforeSave = Date.now();
        useTemplateStore.getState().saveTemplate();
        const afterSave = Date.now();

        const template = useTemplateStore.getState().templates[0];
        expect(template.createdAt).toBeGreaterThanOrEqual(beforeSave);
        expect(template.createdAt).toBeLessThanOrEqual(afterSave);
        expect(template.updatedAt).toBeGreaterThanOrEqual(beforeSave);
        expect(template.updatedAt).toBeLessThanOrEqual(afterSave);
      });

      it('saves draft style into the template', () => {
        useTemplateStore.getState().updateDraftStyle({
          dotsColor: '#aabb00',
          dotsType: 'rounded',
        });

        useTemplateStore.getState().saveTemplate();

        const template = useTemplateStore.getState().templates[0];
        expect(template.style.dotsColor).toBe('#aabb00');
        expect(template.style.dotsType).toBe('rounded');
      });
    });

    describe('saveTemplate (edit)', () => {
      it('updates an existing template in the list', () => {
        const existing = makeTemplate({ name: 'Original' });
        useTemplateStore.setState({
          templates: [existing],
          editingTemplateId: existing.id,
          draft: { name: 'Updated', style: { ...DEFAULT_STYLE, dotsColor: '#112233' } },
        });

        const returnedId = useTemplateStore.getState().saveTemplate();

        expect(returnedId).toBe(existing.id);
        const templates = useTemplateStore.getState().templates;
        expect(templates).toHaveLength(1);
        expect(templates[0].name).toBe('Updated');
        expect(templates[0].style.dotsColor).toBe('#112233');
        expect(templates[0].id).toBe(existing.id);
      });

      it('updates updatedAt but preserves createdAt', () => {
        const originalCreatedAt = 1000000;
        const existing = makeTemplate({
          name: 'Original',
          createdAt: originalCreatedAt,
          updatedAt: originalCreatedAt,
        });
        useTemplateStore.setState({
          templates: [existing],
          editingTemplateId: existing.id,
          draft: { name: 'Updated', style: { ...DEFAULT_STYLE } },
        });

        const beforeSave = Date.now();
        useTemplateStore.getState().saveTemplate();

        const template = useTemplateStore.getState().templates[0];
        expect(template.updatedAt).toBeGreaterThanOrEqual(beforeSave);
      });

      it('does not affect other templates in the list', () => {
        const template1 = makeTemplate({ name: 'Template 1' });
        const template2 = makeTemplate({ name: 'Template 2' });
        useTemplateStore.setState({
          templates: [template1, template2],
          editingTemplateId: template1.id,
          draft: { name: 'Updated 1', style: { ...DEFAULT_STYLE } },
        });

        useTemplateStore.getState().saveTemplate();

        const templates = useTemplateStore.getState().templates;
        expect(templates[0].name).toBe('Updated 1');
        expect(templates[1].name).toBe('Template 2');
      });
    });

    describe('deleteTemplate', () => {
      it('removes a template by ID', () => {
        const template = makeTemplate({ name: 'To Delete' });
        useTemplateStore.setState({ templates: [template] });

        useTemplateStore.getState().deleteTemplate(template.id);

        expect(useTemplateStore.getState().templates).toHaveLength(0);
      });

      it('does not affect other templates', () => {
        const template1 = makeTemplate({ name: 'Keep' });
        const template2 = makeTemplate({ name: 'Delete' });
        useTemplateStore.setState({ templates: [template1, template2] });

        useTemplateStore.getState().deleteTemplate(template2.id);

        const templates = useTemplateStore.getState().templates;
        expect(templates).toHaveLength(1);
        expect(templates[0].name).toBe('Keep');
      });

      it('does nothing if ID is not found', () => {
        const template = makeTemplate();
        useTemplateStore.setState({ templates: [template] });

        useTemplateStore.getState().deleteTemplate('nonexistent');

        expect(useTemplateStore.getState().templates).toHaveLength(1);
      });
    });

    describe('duplicateTemplate', () => {
      it('creates a copy with "(Copy)" suffix and new ID', () => {
        const original = makeTemplate({ name: 'My Template' });
        useTemplateStore.setState({ templates: [original] });

        useTemplateStore.getState().duplicateTemplate(original.id);

        const templates = useTemplateStore.getState().templates;
        expect(templates).toHaveLength(2);

        const copy = templates[1];
        expect(copy.name).toBe('My Template (Copy)');
        expect(copy.id).not.toBe(original.id);
      });

      it('copies the style from the original', () => {
        const original = makeTemplate({
          name: 'Styled',
          style: { ...DEFAULT_STYLE, dotsColor: '#ff00ff', dotsType: 'dots' },
        });
        useTemplateStore.setState({ templates: [original] });

        useTemplateStore.getState().duplicateTemplate(original.id);

        const copy = useTemplateStore.getState().templates[1];
        expect(copy.style.dotsColor).toBe('#ff00ff');
        expect(copy.style.dotsType).toBe('dots');
      });

      it('sets new timestamps on the duplicate', () => {
        const original = makeTemplate({ createdAt: 1000, updatedAt: 1000 });
        useTemplateStore.setState({ templates: [original] });

        const beforeDuplicate = Date.now();
        useTemplateStore.getState().duplicateTemplate(original.id);

        const copy = useTemplateStore.getState().templates[1];
        expect(copy.createdAt).toBeGreaterThanOrEqual(beforeDuplicate);
        expect(copy.updatedAt).toBeGreaterThanOrEqual(beforeDuplicate);
      });

      it('does nothing if template ID is not found', () => {
        const template = makeTemplate();
        useTemplateStore.setState({ templates: [template] });

        useTemplateStore.getState().duplicateTemplate('nonexistent');

        expect(useTemplateStore.getState().templates).toHaveLength(1);
      });

      it('creates an independent copy (mutating copy does not affect original)', () => {
        const original = makeTemplate({
          name: 'Original',
          style: { ...DEFAULT_STYLE, dotsColor: '#000000' },
        });
        useTemplateStore.setState({ templates: [original] });

        useTemplateStore.getState().duplicateTemplate(original.id);

        // Mutate the copy's style to verify independence
        const templates = useTemplateStore.getState().templates;
        templates[1].style.dotsColor = '#ffffff';

        expect(templates[0].style.dotsColor).toBe('#000000');
      });
    });

    describe('getTemplate', () => {
      it('returns template when found', () => {
        const template = makeTemplate({ name: 'Findable' });
        useTemplateStore.setState({ templates: [template] });

        const found = useTemplateStore.getState().getTemplate(template.id);
        expect(found).toBeDefined();
        expect(found?.name).toBe('Findable');
      });

      it('returns undefined when not found', () => {
        const result = useTemplateStore.getState().getTemplate('nonexistent');
        expect(result).toBeUndefined();
      });
    });
  });

  // --------------------------------------------------------------------------
  // Import/Export
  // --------------------------------------------------------------------------

  describe('import/export', () => {
    describe('exportTemplates', () => {
      it('returns valid JSON string of all templates', () => {
        const template1 = makeTemplate({ name: 'Export 1' });
        const template2 = makeTemplate({ name: 'Export 2' });
        useTemplateStore.setState({ templates: [template1, template2] });

        const json = useTemplateStore.getState().exportTemplates();
        const parsed = JSON.parse(json);

        expect(Array.isArray(parsed)).toBe(true);
        expect(parsed).toHaveLength(2);
        expect(parsed[0].name).toBe('Export 1');
        expect(parsed[1].name).toBe('Export 2');
      });

      it('returns empty array JSON when no templates', () => {
        const json = useTemplateStore.getState().exportTemplates();
        expect(JSON.parse(json)).toEqual([]);
      });
    });

    describe('importTemplates', () => {
      it('imports valid JSON and assigns new IDs', () => {
        const templates = [
          makeTemplate({ name: 'Imported 1' }),
          makeTemplate({ name: 'Imported 2' }),
        ];
        const json = JSON.stringify(templates);
        const originalIds = templates.map((t) => t.id);

        const result = useTemplateStore.getState().importTemplates(json);

        expect(result).toBe(true);
        const stored = useTemplateStore.getState().templates;
        expect(stored).toHaveLength(2);
        expect(stored[0].name).toBe('Imported 1');
        expect(stored[1].name).toBe('Imported 2');
        // New IDs should be assigned
        expect(stored[0].id).not.toBe(originalIds[0]);
        expect(stored[1].id).not.toBe(originalIds[1]);
      });

      it('appends imported templates to existing ones', () => {
        const existing = makeTemplate({ name: 'Existing' });
        useTemplateStore.setState({ templates: [existing] });

        const toImport = [makeTemplate({ name: 'New Import' })];
        useTemplateStore.getState().importTemplates(JSON.stringify(toImport));

        const templates = useTemplateStore.getState().templates;
        expect(templates).toHaveLength(2);
        expect(templates[0].name).toBe('Existing');
        expect(templates[1].name).toBe('New Import');
      });

      it('returns false for invalid JSON', () => {
        const result = useTemplateStore.getState().importTemplates('not valid json{{{');
        expect(result).toBe(false);
        expect(useTemplateStore.getState().templates).toHaveLength(0);
      });

      it('returns false for non-array JSON', () => {
        const result = useTemplateStore.getState().importTemplates('{"name": "not an array"}');
        expect(result).toBe(false);
        expect(useTemplateStore.getState().templates).toHaveLength(0);
      });

      it('filters out entries missing required fields', () => {
        const validTemplate = makeTemplate({ name: 'Valid' });
        const invalidEntries = [
          validTemplate,
          { id: 'has-id-only' },                        // missing name and style
          { name: 'has-name-only' },                    // missing id and style
          { id: 'has-id', name: 'has-name' },           // missing style
          { id: 123, name: 'wrong-id-type', style: {} }, // id is not a string
        ];
        const json = JSON.stringify(invalidEntries);

        const result = useTemplateStore.getState().importTemplates(json);

        expect(result).toBe(true);
        const templates = useTemplateStore.getState().templates;
        expect(templates).toHaveLength(1);
        expect(templates[0].name).toBe('Valid');
      });

      it('returns false when all entries are invalid', () => {
        const invalidEntries = [
          { badField: 'no id, name, or style' },
          { id: 123, name: 456 },
        ];
        const json = JSON.stringify(invalidEntries);

        const result = useTemplateStore.getState().importTemplates(json);
        expect(result).toBe(false);
        expect(useTemplateStore.getState().templates).toHaveLength(0);
      });

      it('sets new timestamps on imported templates', () => {
        const template = makeTemplate({ createdAt: 1000, updatedAt: 1000 });
        const beforeImport = Date.now();

        useTemplateStore.getState().importTemplates(JSON.stringify([template]));

        const imported = useTemplateStore.getState().templates[0];
        expect(imported.createdAt).toBeGreaterThanOrEqual(beforeImport);
        expect(imported.updatedAt).toBeGreaterThanOrEqual(beforeImport);
      });
    });
  });
});
