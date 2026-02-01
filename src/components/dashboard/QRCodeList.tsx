import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { QRCodeCard } from './QRCodeCard';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import {
  Search,
  Plus,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  QrCode,
  Loader2,
} from 'lucide-react';
import type { QRCode } from '../../types/database';

type ViewMode = 'grid' | 'list';
type SortField = 'created_at' | 'total_scans' | 'name';
type SortOrder = 'asc' | 'desc';

interface QRCodeListProps {
  qrCodes: QRCode[];
  isLoading?: boolean;
  onDelete?: (id: string) => void;
}

export function QRCodeList({ qrCodes, isLoading, onDelete }: QRCodeListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Filter and sort QR codes
  const filteredQRCodes = qrCodes
    .filter((qr) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        qr.name?.toLowerCase().includes(query) ||
        qr.destination_url.toLowerCase().includes(query) ||
        qr.short_code.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '');
          break;
        case 'total_scans':
          comparison = a.total_scans - b.total_scans;
          break;
        case 'created_at':
        default:
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search QR codes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Sort dropdown */}
          <div className="relative">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => toggleSort(sortField)}
            >
              {sortOrder === 'asc' ? (
                <SortAsc className="w-4 h-4" />
              ) : (
                <SortDesc className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {sortField === 'created_at'
                  ? 'Date'
                  : sortField === 'total_scans'
                  ? 'Scans'
                  : 'Name'}
              </span>
            </Button>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${
                viewMode === 'grid'
                  ? 'bg-gray-100 dark:bg-gray-800'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <Grid3X3 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${
                viewMode === 'list'
                  ? 'bg-gray-100 dark:bg-gray-800'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <List className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Create button */}
          <Link to="/create">
            <Button size="sm">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Empty state */}
      {filteredQRCodes.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <QrCode className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchQuery ? 'No QR codes found' : 'No QR codes yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {searchQuery
              ? 'Try adjusting your search query'
              : 'Create your first QR code to get started'}
          </p>
          {!searchQuery && (
            <Link to="/create">
              <Button>
                <Plus className="w-4 h-4" />
                Create QR Code
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* Grid view */}
      {viewMode === 'grid' && filteredQRCodes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredQRCodes.map((qrCode) => (
            <QRCodeCard key={qrCode.id} qrCode={qrCode} onDelete={onDelete} />
          ))}
        </div>
      )}

      {/* List view */}
      {viewMode === 'list' && filteredQRCodes.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Name
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 hidden md:table-cell">
                  URL
                </th>
                <th
                  className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                  onClick={() => toggleSort('total_scans')}
                >
                  Scans
                </th>
                <th
                  className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 hidden sm:table-cell"
                  onClick={() => toggleSort('created_at')}
                >
                  Created
                </th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredQRCodes.map((qrCode) => (
                <tr key={qrCode.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <QrCode className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {qrCode.name || `QR ${qrCode.short_code}`}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 md:hidden truncate max-w-[150px]">
                          {qrCode.destination_url}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <a
                      href={qrCode.destination_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 truncate max-w-[200px] block"
                    >
                      {qrCode.destination_url}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {qrCode.total_scans.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(qrCode.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={`/qr-codes/${qrCode.id}`}
                      className="text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300"
                    >
                      View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
