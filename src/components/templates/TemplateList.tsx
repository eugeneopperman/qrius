import { memo, useRef, useState, useCallback } from 'react';
import { Plus, Download, Upload, Palette } from 'lucide-react';
import { useTemplateStore } from '@/stores/templateStore';
import { usePlanGate } from '@/hooks/usePlanGate';
import { ProBadge } from '../ui/ProBadge';
import { toast } from '@/stores/toastStore';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { TemplateCard } from './TemplateCard';

interface TemplateListProps {
  compact?: boolean;
}

export const TemplateList = memo(function TemplateList({
  compact = false,
}: TemplateListProps) {
  const {
    templates,
    openWizard,
    deleteTemplate,
    duplicateTemplate,
    applyTemplate,
    exportTemplates,
    importTemplates,
  } = useTemplateStore();

  const { templateLimit, isAuthenticated, isFree } = usePlanGate();
  const isAtLimit = templateLimit !== -1 && templates.length >= templateLimit;

  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [appliedId, setAppliedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleApply = useCallback(
    (id: string) => {
      applyTemplate(id);
      setAppliedId(id);
      const template = templates.find((t) => t.id === id);
      toast.success(`Applied "${template?.name}" template`);

      // Reset applied state after a delay
      setTimeout(() => setAppliedId(null), 2000);
    },
    [applyTemplate, templates]
  );

  const handleEdit = useCallback(
    (id: string) => {
      openWizard(id);
    },
    [openWizard]
  );

  const handleDuplicate = useCallback(
    (id: string) => {
      duplicateTemplate(id);
      toast.success('Template duplicated');
    },
    [duplicateTemplate]
  );

  const handleDelete = useCallback((id: string) => {
    const template = useTemplateStore.getState().templates.find((t) => t.id === id);
    if (template) {
      setDeleteConfirm({ id, name: template.name });
    }
  }, []);

  const confirmDelete = useCallback(() => {
    if (deleteConfirm) {
      deleteTemplate(deleteConfirm.id);
      toast.success(`"${deleteConfirm.name}" deleted`);
      setDeleteConfirm(null);
    }
  }, [deleteConfirm, deleteTemplate]);

  const handleExport = useCallback(() => {
    const json = exportTemplates();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qr-templates.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Templates exported');
  }, [exportTemplates]);

  const handleImport = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const json = event.target?.result as string;
        const success = importTemplates(json);
        if (success) {
          toast.success('Templates imported successfully');
        } else {
          toast.error('Failed to import templates. Invalid file format.');
        }
      };
      reader.readAsText(file);

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [importTemplates]
  );

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              if (isAtLimit) {
                toast.info('Upgrade to Pro for unlimited templates');
                return;
              }
              openWizard();
            }}
            disabled={isAtLimit}
            className="flex-1 sm:flex-none"
          >
            <Plus className="w-4 h-4" />
            New Template
          </Button>
          {isAuthenticated && isFree && templateLimit !== -1 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {templates.length}/{templateLimit} templates
            </span>
          )}
          {isAtLimit && <ProBadge />}
        </div>

        {templates.length > 0 && (
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4" />
              {!compact && <span className="hidden sm:inline">Export</span>}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-4 h-4" />
              {!compact && <span className="hidden sm:inline">Import</span>}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </div>
        )}
      </div>

      {/* Template Grid */}
      {templates.length > 0 ? (
        <div
          className={
            compact
              ? 'space-y-2'
              : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'
          }
        >
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onApply={handleApply}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              isApplied={appliedId === template.id}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Palette className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <h4 className="font-medium text-gray-900 dark:text-white mb-1">
            No templates yet
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Create your first template to save your brand styles
          </p>
          <Button variant="secondary" size="sm" onClick={() => openWizard()}>
            <Plus className="w-4 h-4" />
            Create Template
          </Button>
        </div>
      )}

      {/* Import hint for empty state */}
      {templates.length === 0 && (
        <div className="text-center">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Or import existing templates
          </button>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Delete Template?"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Keep"
        variant="danger"
      />
    </div>
  );
});

TemplateList.displayName = 'TemplateList';
