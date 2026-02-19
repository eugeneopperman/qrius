import { useTemplateStore } from '@/stores/templateStore';
import { useQRStore } from '@/stores/qrStore';
import { toast } from '@/stores/toastStore';
import { Button } from '../ui/Button';
import { cn } from '@/utils/cn';
import { Plus, Check, Palette } from 'lucide-react';
import type { BrandTemplate } from '@/types';

export function TemplatePickerSection() {
  const { templates, applyTemplate, openWizard } = useTemplateStore();
  const { styleOptions } = useQRStore();

  const handleApply = (template: BrandTemplate) => {
    applyTemplate(template.id);
    toast.success(`Template "${template.name}" applied`);
  };

  // Check if a template is currently active by comparing key style properties
  const isActive = (template: BrandTemplate) => {
    return (
      styleOptions.dotsColor === template.style.dotsColor &&
      styleOptions.backgroundColor === template.style.backgroundColor
    );
  };

  if (templates.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <Palette className="w-6 h-6 text-gray-400" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
          No templates yet
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Save your favorite styles as reusable templates
        </p>
        <Button variant="secondary" size="sm" onClick={() => openWizard()}>
          <Plus className="w-4 h-4" />
          Create Template
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {templates.map((template) => {
          const active = isActive(template);
          return (
            <button
              key={template.id}
              onClick={() => handleApply(template)}
              className={cn(
                'relative p-3 rounded-xl border transition-all text-left',
                active
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 ring-1 ring-orange-500'
                  : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              )}
            >
              {active && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              {/* Color preview */}
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-6 h-6 rounded-md border border-gray-200 dark:border-gray-700"
                  style={{ backgroundColor: template.style.dotsColor }}
                />
                <div
                  className="w-6 h-6 rounded-md border border-gray-200 dark:border-gray-700"
                  style={{ backgroundColor: template.style.backgroundColor }}
                />
              </div>
              <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                {template.name}
              </p>
            </button>
          );
        })}

        {/* Create New */}
        <button
          onClick={() => openWizard()}
          className="p-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-orange-400 hover:bg-orange-50/50 dark:hover:bg-orange-900/10 transition-all flex flex-col items-center justify-center gap-1 min-h-[80px]"
        >
          <Plus className="w-5 h-5 text-gray-400" />
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">New</span>
        </button>
      </div>
    </div>
  );
}
