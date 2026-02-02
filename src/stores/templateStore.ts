/**
 * Template Store for Brand Template Wizard
 * Manages wizard state, template CRUD, and migration from legacy BrandKits
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BrandTemplate, BrandTemplateStyle, BrandKit, DotType, CornerSquareType } from '../types';
import { useQRStore } from './qrStore';
import { useSettingsStore } from './settingsStore';

// ============================================================================
// Types
// ============================================================================

export type WizardStep = 1 | 2 | 3 | 4;

interface TemplateStore {
  // Wizard state
  isOpen: boolean;
  currentStep: WizardStep;
  editingTemplateId: string | null;
  draft: Partial<BrandTemplate>;

  // Navigation
  openWizard: (templateId?: string) => void;
  closeWizard: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: WizardStep) => void;

  // Draft management
  updateDraft: (updates: Partial<BrandTemplate>) => void;
  updateDraftStyle: (updates: Partial<BrandTemplateStyle>) => void;
  resetDraft: () => void;

  // Template CRUD
  templates: BrandTemplate[];
  saveTemplate: () => string;
  deleteTemplate: (id: string) => void;
  duplicateTemplate: (id: string) => void;
  getTemplate: (id: string) => BrandTemplate | undefined;

  // Import/Export
  exportTemplates: () => string;
  importTemplates: (json: string) => boolean;

  // Application
  applyTemplate: (id: string) => void;

  // Migration
  migrateFromBrandKits: () => number;
  hasMigrated: boolean;
}

// ============================================================================
// Default Values
// ============================================================================

const DEFAULT_TEMPLATE_STYLE: BrandTemplateStyle = {
  dotsColor: '#000000',
  backgroundColor: '#ffffff',
  dotsType: 'square',
  cornersSquareType: 'square',
  cornersDotType: 'square',
  errorCorrectionLevel: 'H',
  qrRoundness: 0,
  frameBorderRadius: 0,
};

const getEmptyDraft = (): Partial<BrandTemplate> => ({
  name: '',
  style: { ...DEFAULT_TEMPLATE_STYLE },
});

// ============================================================================
// QR Roundness Mapping
// ============================================================================

/**
 * Maps qrRoundness (0-100%) to dot type
 */
export function roundnessToDotType(roundness: number): DotType {
  if (roundness < 25) return 'square';
  if (roundness < 50) return 'rounded';
  if (roundness < 75) return 'extra-rounded';
  return 'dots';
}

/**
 * Maps qrRoundness (0-100%) to corner square type
 */
export function roundnessToCornerSquareType(roundness: number): CornerSquareType {
  if (roundness < 33) return 'square';
  if (roundness < 66) return 'extra-rounded';
  return 'dot';
}

/**
 * Maps dot type back to roundness percentage
 */
export function dotTypeToRoundness(dotType: DotType): number {
  switch (dotType) {
    case 'square': return 0;
    case 'rounded': return 25;
    case 'classy': return 25;
    case 'extra-rounded': return 50;
    case 'classy-rounded': return 50;
    case 'dots': return 100;
    default: return 0;
  }
}

// ============================================================================
// Store Implementation
// ============================================================================

export const useTemplateStore = create<TemplateStore>()(
  persist(
    (set, get) => ({
      // Wizard state
      isOpen: false,
      currentStep: 1,
      editingTemplateId: null,
      draft: getEmptyDraft(),
      hasMigrated: false,

      // Templates
      templates: [],

      // Navigation
      openWizard: (templateId?: string) => {
        if (templateId) {
          const template = get().templates.find((t) => t.id === templateId);
          if (template) {
            set({
              isOpen: true,
              currentStep: 1,
              editingTemplateId: templateId,
              draft: { ...template, style: { ...template.style } },
            });
            return;
          }
        }
        // New template
        set({
          isOpen: true,
          currentStep: 1,
          editingTemplateId: null,
          draft: getEmptyDraft(),
        });
      },

      closeWizard: () => {
        set({
          isOpen: false,
          currentStep: 1,
          editingTemplateId: null,
          draft: getEmptyDraft(),
        });
      },

      nextStep: () => {
        set((state) => ({
          currentStep: Math.min(state.currentStep + 1, 4) as WizardStep,
        }));
      },

      prevStep: () => {
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 1) as WizardStep,
        }));
      },

      goToStep: (step: WizardStep) => {
        set({ currentStep: step });
      },

      // Draft management
      updateDraft: (updates: Partial<BrandTemplate>) => {
        set((state) => ({
          draft: { ...state.draft, ...updates },
        }));
      },

      updateDraftStyle: (updates: Partial<BrandTemplateStyle>) => {
        set((state) => ({
          draft: {
            ...state.draft,
            style: { ...state.draft.style, ...updates } as BrandTemplateStyle,
          },
        }));
      },

      resetDraft: () => {
        set({ draft: getEmptyDraft() });
      },

      // Template CRUD
      saveTemplate: () => {
        const state = get();
        const now = Date.now();

        if (state.editingTemplateId) {
          // Update existing template
          set((s) => ({
            templates: s.templates.map((t) =>
              t.id === state.editingTemplateId
                ? {
                    ...t,
                    ...state.draft,
                    updatedAt: now,
                    style: state.draft.style as BrandTemplateStyle,
                  }
                : t
            ),
          }));
          return state.editingTemplateId;
        } else {
          // Create new template
          const newId = crypto.randomUUID();
          const newTemplate: BrandTemplate = {
            id: newId,
            name: state.draft.name || 'Untitled Template',
            createdAt: now,
            updatedAt: now,
            style: state.draft.style as BrandTemplateStyle,
          };

          set((s) => ({
            templates: [...s.templates, newTemplate],
          }));
          return newId;
        }
      },

      deleteTemplate: (id: string) => {
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        }));
      },

      duplicateTemplate: (id: string) => {
        const template = get().templates.find((t) => t.id === id);
        if (!template) return;

        const now = Date.now();
        const duplicated: BrandTemplate = {
          ...template,
          id: crypto.randomUUID(),
          name: `${template.name} (Copy)`,
          createdAt: now,
          updatedAt: now,
          style: { ...template.style },
        };

        set((state) => ({
          templates: [...state.templates, duplicated],
        }));
      },

      getTemplate: (id: string) => {
        return get().templates.find((t) => t.id === id);
      },

      // Import/Export
      exportTemplates: () => {
        return JSON.stringify(get().templates, null, 2);
      },

      importTemplates: (json: string) => {
        try {
          const imported = JSON.parse(json) as BrandTemplate[];
          if (!Array.isArray(imported)) return false;

          // Validate structure
          const validTemplates = imported.filter(
            (t) =>
              typeof t.id === 'string' &&
              typeof t.name === 'string' &&
              typeof t.style === 'object'
          );

          if (validTemplates.length === 0) return false;

          // Add with new IDs to avoid conflicts
          const now = Date.now();
          const newTemplates = validTemplates.map((t) => ({
            ...t,
            id: crypto.randomUUID(),
            createdAt: now,
            updatedAt: now,
            style: { ...t.style },
          }));

          set((state) => ({
            templates: [...state.templates, ...newTemplates],
          }));

          return true;
        } catch {
          return false;
        }
      },

      // Application
      applyTemplate: (id: string) => {
        const template = get().templates.find((t) => t.id === id);
        if (!template) return;

        const { style } = template;
        const qrStore = useQRStore.getState();

        // Apply to QR store - preserve qrRoundness for smooth rendering
        // The QRPreview will handle the roundness post-processing
        qrStore.setStyleOptions({ ...style });
      },

      // Migration
      migrateFromBrandKits: () => {
        const settingsStore = useSettingsStore.getState();
        const existingKits = settingsStore.brandKits;

        if (existingKits.length === 0) {
          set({ hasMigrated: true });
          return 0;
        }

        const now = Date.now();
        const migratedTemplates: BrandTemplate[] = existingKits.map((kit: BrandKit) => ({
          id: crypto.randomUUID(),
          name: kit.name,
          createdAt: kit.createdAt,
          updatedAt: now,
          style: {
            ...DEFAULT_TEMPLATE_STYLE,
            ...kit.style,
            // Infer roundness from existing dot type
            qrRoundness: kit.style.dotsType
              ? dotTypeToRoundness(kit.style.dotsType)
              : 0,
          },
        }));

        set((state) => ({
          templates: [...state.templates, ...migratedTemplates],
          hasMigrated: true,
        }));

        return migratedTemplates.length;
      },
    }),
    {
      name: 'qr-templates-storage',
      partialize: (state) => ({
        templates: state.templates,
        hasMigrated: state.hasMigrated,
      }),
    }
  )
);

// ============================================================================
// Selectors
// ============================================================================

export const selectIsWizardOpen = (state: TemplateStore) => state.isOpen;
export const selectCurrentStep = (state: TemplateStore) => state.currentStep;
export const selectDraft = (state: TemplateStore) => state.draft;
export const selectTemplates = (state: TemplateStore) => state.templates;
export const selectIsEditing = (state: TemplateStore) => state.editingTemplateId !== null;
