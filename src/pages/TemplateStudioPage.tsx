import { useEffect } from 'react';
import { useParams, useRouter } from '@tanstack/react-router';
import { useStudioStore } from '@/stores/studioStore';
import { useTemplateStore } from '@/stores/templateStore';
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
  const getTemplate = useTemplateStore((s) => s.getTemplate);

  useEffect(() => {
    if (templateId) {
      const template = getTemplate(templateId);
      if (template) {
        initFromTemplate(template);
      } else {
        toast.error('Template not found');
        router.navigate({ to: '/templates' });
      }
    } else {
      initNew();
    }
    // Only run on mount / param change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId]);

  return (
    <DashboardLayout>
      <StudioLayout />
    </DashboardLayout>
  );
}
