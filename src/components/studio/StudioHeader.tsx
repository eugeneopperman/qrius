import { memo, useState, useRef, useEffect, useCallback } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowLeft, Undo2, Redo2, Save } from 'lucide-react';
import { useStudioStore } from '@/stores/studioStore';
import { useShallow } from 'zustand/react/shallow';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

export const StudioHeader = memo(function StudioHeader() {
  const {
    templateName,
    setTemplateName,
    isDirty,
    save,
    undo,
    redo,
    undoStack,
    redoStack,
  } = useStudioStore(
    useShallow((s) => ({
      templateName: s.templateName,
      setTemplateName: s.setTemplateName,
      isDirty: s.isDirty,
      save: s.save,
      undo: s.undo,
      redo: s.redo,
      undoStack: s.undoStack,
      redoStack: s.redoStack,
    }))
  );

  const [isEditingName, setIsEditingName] = useState(false);
  const [editValue, setEditValue] = useState(templateName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(templateName);
  }, [templateName]);

  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingName]);

  const handleNameSubmit = useCallback(() => {
    const trimmed = editValue.trim();
    if (trimmed) {
      setTemplateName(trimmed);
    } else {
      setEditValue(templateName);
    }
    setIsEditingName(false);
  }, [editValue, templateName, setTemplateName]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleNameSubmit();
      } else if (e.key === 'Escape') {
        setEditValue(templateName);
        setIsEditingName(false);
      }
    },
    [handleNameSubmit, templateName]
  );

  const handleSave = useCallback(() => {
    save();
  }, [save]);

  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-black/[0.06] dark:border-white/[0.06] flex-shrink-0">
      {/* Left: Back + Name */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Link
          to="/templates"
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Templates</span>
        </Link>

        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 flex-shrink-0" />

        {isEditingName ? (
          <input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={handleKeyDown}
            className="text-sm font-medium bg-transparent border-b-2 border-orange-500 outline-none text-gray-900 dark:text-white min-w-[120px] max-w-[300px]"
            maxLength={50}
          />
        ) : (
          <button
            onClick={() => setIsEditingName(true)}
            className="text-sm font-medium text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition-colors truncate max-w-[300px]"
            title="Click to rename"
          >
            {templateName}
          </button>
        )}

        {isDirty && (
          <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" title="Unsaved changes" />
        )}
      </div>

      {/* Right: Undo/Redo + Save */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={undo}
          disabled={undoStack.length === 0}
          className={cn(
            'p-2 rounded-lg transition-colors',
            undoStack.length > 0
              ? 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
          )}
          title="Undo (Cmd+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={redo}
          disabled={redoStack.length === 0}
          className={cn(
            'p-2 rounded-lg transition-colors',
            redoStack.length > 0
              ? 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
          )}
          title="Redo (Cmd+Shift+Z)"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />

        <Button variant="primary" size="sm" onClick={handleSave}>
          <Save className="w-4 h-4" />
          Save
        </Button>
      </div>
    </div>
  );
});

StudioHeader.displayName = 'StudioHeader';
