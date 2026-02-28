/**
 * Unified CRUD adapter for brand templates.
 * Routes to database (authenticated) or localStorage (unauthenticated).
 */

import { useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useTemplates } from './queries/useTemplates';
import { useTemplateStore } from '@/stores/templateStore';
import { useQRStore } from '@/stores/qrStore';
import type { BrandTemplate, BrandTemplateStyle } from '@/types';

export function useTemplateCRUD() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = !!user;

  const db = useTemplates();
  const localTemplates = useTemplateStore((s) => s.templates);

  const templates = isAuthenticated ? db.templates : localTemplates;
  const isLoading = isAuthenticated ? db.isLoading : false;

  const saveTemplate = useCallback(
    async (name: string, style: BrandTemplateStyle, existingId?: string): Promise<string> => {
      if (isAuthenticated) {
        if (existingId) {
          const result = await db.updateTemplate({ id: existingId, name, style });
          return result.id;
        } else {
          const result = await db.createTemplate({ name, style });
          return result.id;
        }
      } else {
        const store = useTemplateStore.getState();
        if (existingId) {
          store.openWizard(existingId);
          store.updateDraft({ name, style });
          const id = store.saveTemplate();
          store.closeWizard();
          return id;
        } else {
          store.openWizard();
          store.updateDraft({ name, style });
          const id = store.saveTemplate();
          store.closeWizard();
          return id;
        }
      }
    },
    [isAuthenticated, db]
  );

  const deleteTemplate = useCallback(
    async (id: string): Promise<void> => {
      if (isAuthenticated) {
        await db.deleteTemplate(id);
      } else {
        useTemplateStore.getState().deleteTemplate(id);
      }
    },
    [isAuthenticated, db]
  );

  const duplicateTemplate = useCallback(
    async (id: string): Promise<void> => {
      const template = templates.find((t) => t.id === id);
      if (!template) return;

      if (isAuthenticated) {
        await db.createTemplate({
          name: `${template.name} (Copy)`,
          style: { ...template.style },
        });
      } else {
        useTemplateStore.getState().duplicateTemplate(id);
      }
    },
    [isAuthenticated, templates, db]
  );

  const getTemplate = useCallback(
    (id: string): BrandTemplate | undefined => {
      return templates.find((t) => t.id === id);
    },
    [templates]
  );

  const applyTemplate = useCallback(
    (id: string): void => {
      const template = templates.find((t) => t.id === id);
      if (!template) return;
      useQRStore.getState().setStyleOptions({ ...template.style });
    },
    [templates]
  );

  const exportTemplates = useCallback((): string => {
    return JSON.stringify(templates, null, 2);
  }, [templates]);

  const importTemplates = useCallback(
    async (json: string): Promise<boolean> => {
      try {
        const imported = JSON.parse(json) as BrandTemplate[];
        if (!Array.isArray(imported)) return false;

        const valid = imported.filter(
          (t) =>
            typeof t.name === 'string' &&
            t.name.length > 0 &&
            typeof t.style === 'object' &&
            t.style !== null
        );

        if (valid.length === 0) return false;

        if (isAuthenticated) {
          const result = await db.migrateFromLocalStorage(
            valid.map((t) => ({ name: t.name, style: t.style }))
          );
          return result.imported > 0;
        } else {
          return useTemplateStore.getState().importTemplates(json);
        }
      } catch {
        return false;
      }
    },
    [isAuthenticated, db]
  );

  return {
    templates,
    isLoading,
    saveTemplate,
    deleteTemplate,
    duplicateTemplate,
    getTemplate,
    applyTemplate,
    exportTemplates,
    importTemplates,
  };
}
