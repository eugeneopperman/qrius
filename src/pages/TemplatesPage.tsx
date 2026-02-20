import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { TemplateList } from '@/components/templates/TemplateList';
import { Palette } from 'lucide-react';

export default function TemplatesPage() {
  return (
    <DashboardLayout>
      <div className="max-w-5xl">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <Palette className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Brand Templates
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Save and reuse your brand styles across QR codes
              </p>
            </div>
          </div>
        </div>

        <TemplateList />
      </div>
    </DashboardLayout>
  );
}
