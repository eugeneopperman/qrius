import { useEffect, useState } from 'react';
import { useParams, useRouter } from '@tanstack/react-router';
import { useStudioStore } from '@/stores/studioStore';
import { useTemplateCRUD } from '@/hooks/useTemplateCRUD';
import { StudioLayout } from '@/components/studio/StudioLayout';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { toast } from '@/stores/toastStore';

export default function TemplateStudioPage() {
  const router = useRouter();
  // Try to read $id param — will be undefined for /templates/new
  const params = useParams({ strict: false }) as { id?: string };
  const templateId = params.id;

  const initNew = useStudioStore((s) => s.initNew);
  const initFromTemplate = useStudioStore((s) => s.initFromTemplate);
  const { getTemplate, isLoading } = useTemplateCRUD();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // For new templates, initialize immediately
    if (!templateId) {
      initNew();
      setInitialized(true);
      return;
    }

    // For editing, wait for templates to load
    if (isLoading) return;

    const template = getTemplate(templateId);
    if (template) {
      initFromTemplate(template);
      setInitialized(true);
    } else {
      toast.error('Template not found');
      router.navigate({ to: '/templates' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId, isLoading]);

  return (
    <DashboardLayout>
      {(!templateId || initialized) ? (
        <StudioLayout />
      ) : (
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse text-gray-400">Loading template...</div>
        </div>
      )}
    </DashboardLayout>
  );
}
