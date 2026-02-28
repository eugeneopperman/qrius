import { useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { TemplateList } from '@/components/templates/TemplateList';
import { useAuthStore } from '@/stores/authStore';
import { useTemplates } from '@/hooks/queries/useTemplates';
import { toast } from '@/stores/toastStore';
import type { BrandTemplate } from '@/types';

/** One-time migration of localStorage templates to the database */
function useLocalStorageMigration() {
  const user = useAuthStore((s) => s.user);
  const { migrateFromLocalStorage } = useTemplates();

  useEffect(() => {
    if (!user) return;

    // Check if migration already completed
    const migrated = localStorage.getItem('qr-templates-migrated');
    if (migrated) return;

    // Read localStorage templates
    const raw = localStorage.getItem('qr-templates-storage');
    if (!raw) {
      localStorage.setItem('qr-templates-migrated', 'true');
      return;
    }

    try {
      const parsed = JSON.parse(raw) as { state?: { templates?: BrandTemplate[] } };
      const templates = parsed?.state?.templates;
      if (!Array.isArray(templates) || templates.length === 0) {
        localStorage.setItem('qr-templates-migrated', 'true');
        return;
      }

      // Send to migration endpoint
      migrateFromLocalStorage(
        templates.map((t) => ({ name: t.name || 'Untitled', style: t.style }))
      )
        .then((result) => {
          localStorage.setItem('qr-templates-migrated', 'true');
          if (result.imported > 0) {
            toast.success(`Migrated ${result.imported} template${result.imported > 1 ? 's' : ''} to your account`);
          }
        })
        .catch(() => {
          // Don't set migrated flag — will retry next visit
          if (import.meta.env.DEV) {
            console.warn('Template migration failed, will retry');
          }
        });
    } catch {
      localStorage.setItem('qr-templates-migrated', 'true');
    }
  }, [user, migrateFromLocalStorage]);
}

export default function TemplatesPage() {
  useLocalStorageMigration();

  return (
    <DashboardLayout>
      <div className="max-w-5xl animate-slide-up-page">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Brand Templates
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Save and reuse your brand styles across QR codes
          </p>
        </div>

        <TemplateList />
      </div>
    </DashboardLayout>
  );
}
