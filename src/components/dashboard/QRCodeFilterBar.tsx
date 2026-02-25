import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, ChevronDown, Plus, ArrowUpDown } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { cn } from '@/utils/cn';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import type { QRCodeFolder } from '@/hooks/queries/useQRCodeFolders';

interface StatusCounts {
  all: number;
  active: number;
  paused: number;
}

interface QRCodeFilterBarProps {
  status: 'all' | 'active' | 'paused';
  onStatusChange: (status: 'all' | 'active' | 'paused') => void;
  counts: StatusCounts;
  folderId: string | undefined;
  onFolderChange: (folderId: string | undefined) => void;
  folders: QRCodeFolder[];
  search: string;
  onSearchChange: (search: string) => void;
  sort: 'created_at' | 'total_scans' | 'name';
  order: 'asc' | 'desc';
  onSortChange: (sort: 'created_at' | 'total_scans' | 'name', order: 'asc' | 'desc') => void;
  onCreateFolder: () => void;
}

const STATUS_TABS: { key: 'all' | 'active' | 'paused'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'paused', label: 'Paused' },
];

const SORT_OPTIONS: { key: 'created_at' | 'total_scans' | 'name'; label: string }[] = [
  { key: 'created_at', label: 'Date Created' },
  { key: 'total_scans', label: 'Scans' },
  { key: 'name', label: 'Name' },
];

export function QRCodeFilterBar({
  status,
  onStatusChange,
  counts,
  folderId,
  onFolderChange,
  folders,
  search,
  onSearchChange,
  sort,
  order,
  onSortChange,
  onCreateFolder,
}: QRCodeFilterBarProps) {
  const [localSearch, setLocalSearch] = useState(search);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleSearchInput = useCallback((value: string) => {
    setLocalSearch(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearchChange(value);
    }, 300);
  }, [onSearchChange]);

  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  // Sync external search changes
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  const selectedFolder = folders.find((f) => f.id === folderId);
  const folderLabel = folderId === undefined
    ? 'All Folders'
    : folderId === 'none'
      ? 'Unfiled'
      : selectedFolder?.name || 'Folder';

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Status tabs */}
      <div className="flex items-center gap-1 rounded-lg bg-black/[0.03] dark:bg-white/[0.03] p-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onStatusChange(tab.key)}
            className={cn(
              'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              status === tab.key
                ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            )}
          >
            {tab.label}
            <span className="ml-1.5 text-xs opacity-70">
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Folder dropdown */}
      <Dropdown
        align="left"
        trigger={({ toggle }) => (
          <button
            onClick={toggle}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-black/[0.08] dark:border-white/[0.08] hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
          >
            {selectedFolder && (
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: selectedFolder.color }}
              />
            )}
            <span className="text-gray-700 dark:text-gray-300">{folderLabel}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>
        )}
      >
        {({ close }) => (
          <div className="min-w-[200px] py-1">
            <button
              onClick={() => { onFolderChange(undefined); close(); }}
              className={cn(
                'w-full px-3 py-2 text-left text-sm hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors',
                folderId === undefined && 'text-orange-600 dark:text-orange-400 font-medium'
              )}
            >
              All Folders
            </button>
            <button
              onClick={() => { onFolderChange('none'); close(); }}
              className={cn(
                'w-full px-3 py-2 text-left text-sm hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors',
                folderId === 'none' && 'text-orange-600 dark:text-orange-400 font-medium'
              )}
            >
              Unfiled
            </button>
            {folders.length > 0 && (
              <div className="border-t border-black/[0.04] dark:border-white/[0.04] my-1" />
            )}
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => { onFolderChange(folder.id); close(); }}
                className={cn(
                  'w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors',
                  folderId === folder.id && 'text-orange-600 dark:text-orange-400 font-medium'
                )}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: folder.color }}
                />
                <span className="flex-1 truncate">{folder.name}</span>
                <span className="text-xs text-gray-400">{folder.qrCodeCount}</span>
              </button>
            ))}
            <div className="border-t border-black/[0.04] dark:border-white/[0.04] my-1" />
            <button
              onClick={() => { onCreateFolder(); close(); }}
              className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 text-orange-600 dark:text-orange-400 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New Folder
            </button>
          </div>
        )}
      </Dropdown>

      {/* Search */}
      <div className="flex-1 min-w-[180px] max-w-xs">
        <Input
          placeholder="Search QR codes..."
          value={localSearch}
          onChange={(e) => handleSearchInput(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      {/* Sort dropdown */}
      <Dropdown
        align="right"
        trigger={({ toggle }) => (
          <button
            onClick={toggle}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-black/[0.08] dark:border-white/[0.08] hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300">
              {SORT_OPTIONS.find((o) => o.key === sort)?.label}
            </span>
          </button>
        )}
      >
        {({ close }) => (
          <div className="min-w-[160px] py-1">
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.key}
                onClick={() => {
                  if (sort === option.key) {
                    onSortChange(sort, order === 'desc' ? 'asc' : 'desc');
                  } else {
                    onSortChange(option.key, 'desc');
                  }
                  close();
                }}
                className={cn(
                  'w-full px-3 py-2 text-left text-sm flex items-center justify-between hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors',
                  sort === option.key && 'text-orange-600 dark:text-orange-400 font-medium'
                )}
              >
                {option.label}
                {sort === option.key && (
                  <span className="text-xs opacity-70">{order === 'desc' ? '↓' : '↑'}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </Dropdown>

      {/* Create button */}
      <Link to="/create">
        <Button variant="primary" size="sm">
          <Plus className="w-4 h-4 mr-1.5" />
          Create QR Code
        </Button>
      </Link>
    </div>
  );
}
