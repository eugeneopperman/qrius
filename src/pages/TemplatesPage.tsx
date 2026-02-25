import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { TemplateList } from '@/components/templates/TemplateList';

export default function TemplatesPage() {
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
