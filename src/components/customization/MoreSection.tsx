import { useState } from 'react';
import { Sparkles, Palette, Printer, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { SmartPresets } from '../features/SmartPresets';
import { PrintTemplates } from '../features/PrintTemplates';
import { TemplateList } from '../templates/TemplateList';

type MoreTab = 'presets' | 'templates' | 'print';

const moreTabs: { id: MoreTab; label: string; icon: React.ElementType; description: string }[] = [
  { id: 'presets', label: 'Smart Presets', icon: Sparkles, description: 'One-click style templates' },
  { id: 'templates', label: 'Brand Templates', icon: Palette, description: 'Save & reuse brand styles' },
  { id: 'print', label: 'Print Templates', icon: Printer, description: 'High-res export sizes' },
];

export function MoreSection() {
  const [activeTab, setActiveTab] = useState<MoreTab | null>(null);

  if (activeTab) {
    return (
      <div className="space-y-4">
        {/* Back button */}
        <button
          onClick={() => setActiveTab(null)}
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          Back to options
        </button>

        {/* Active sub-section content */}
        {activeTab === 'presets' && <SmartPresets />}
        {activeTab === 'templates' && <TemplateList compact />}
        {activeTab === 'print' && <PrintTemplates />}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {moreTabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-200',
              'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700',
              'hover:border-orange-300 dark:hover:border-orange-600 hover:shadow-sm',
              'group'
            )}
          >
            <div className={cn(
              'p-2.5 rounded-xl transition-colors',
              'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
              'group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30 group-hover:text-orange-600 dark:group-hover:text-orange-400'
            )}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-white text-sm">
                {tab.label}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {tab.description}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-orange-500 transition-colors" />
          </button>
        );
      })}
    </div>
  );
}
