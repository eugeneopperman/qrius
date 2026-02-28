/**
 * Template Store for Brand Template Wizard
 * Manages wizard state and template CRUD
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BrandTemplate, BrandTemplateStyle, DotType, CornerSquareType } from '@/types';
import { useQRStore } from './qrStore';
import { useAuthStore } from './authStore';

const FREE_TEMPLATE_LIMIT = 3;

function isAtTemplateLimit(): boolean {
  const { user, currentOrganization } = useAuthStore.getState();
  if (!user) return false; // unauthenticated = no limit
  const plan = currentOrganization?.plan ?? 'free';
  return plan === 'free';
}

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

  // DB sync
  syncTemplates: (templates: BrandTemplate[]) => void;
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
  qrRoundness: undefined,
  qrPattern: 'solid',
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
          // Check free plan template limit
          if (isAtTemplateLimit() && state.templates.length >= FREE_TEMPLATE_LIMIT) {
            return '';
          }

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

        // Check free plan template limit
        if (isAtTemplateLimit() && get().templates.length >= FREE_TEMPLATE_LIMIT) return;

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

          // Check free plan template limit
          if (isAtTemplateLimit()) {
            const currentCount = get().templates.length;
            const remaining = FREE_TEMPLATE_LIMIT - currentCount;
            if (remaining <= 0) return false;
            validTemplates.splice(remaining);
          }

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

      // DB sync — replaces local templates with database data
      syncTemplates: (templates: BrandTemplate[]) => {
        set({ templates });
      },
    }),
    {
      name: 'qr-templates-storage',
      partialize: (state) => ({
        templates: state.templates,
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
