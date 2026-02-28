import { useState, useCallback } from 'react';
import { Link } from '@tanstack/react-router';
import { QrCode, Plus } from 'lucide-react';
import { QueryError } from '@/components/ui/QueryError';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { QRCodeFilterBar } from '@/components/dashboard/QRCodeFilterBar';
import { QRCodeRow } from '@/components/dashboard/QRCodeRow';
import { CreateFolderModal } from '@/components/dashboard/CreateFolderModal';
import { EditUrlModal } from '@/components/dashboard/EditUrlModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Button } from '@/components/ui/Button';
import { useOrganizationQRCodes } from '@/hooks/useOrganizationQRCodes';
import { useQRCodeFolders } from '@/hooks/queries/useQRCodeFolders';
import { toast } from '@/stores/toastStore';
import type { QRCode } from '@/types/database';

export default function QRCodesPage() {
  // Filter state
  const [status, setStatus] = useState<'all' | 'active' | 'paused'>('all');
  const [folderId, setFolderId] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'created_at' | 'total_scans' | 'name'>('created_at');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  // Data
  const { folders, createFolder, isCreating } = useQRCodeFolders();
  const {
    qrCodes,
    counts,
    isLoading,
    error: qrError,
    patchQRCode,
    deleteQRCode,
    refetch,
  } = useOrganizationQRCodes({
    status,
    folderId: folderId === 'none' ? null : folderId,
    search: search || undefined,
    sort,
    order,
  });

  // Modal state
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [editUrlTarget, setEditUrlTarget] = useState<QRCode | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<QRCode | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handlers
  const handleSortChange = useCallback((newSort: 'created_at' | 'total_scans' | 'name', newOrder: 'asc' | 'desc') => {
    setSort(newSort);
    setOrder(newOrder);
  }, []);

  const handleToggleActive = useCallback(async (qr: QRCode) => {
    const newState = !qr.is_active;
    const success = await patchQRCode({ id: qr.id, is_active: newState });
    if (success) {
      toast.success(newState ? 'QR code activated' : 'QR code paused');
    }
  }, [patchQRCode]);

  const handleMoveToFolder = useCallback(async (qr: QRCode, targetFolderId: string | null) => {
    const success = await patchQRCode({ id: qr.id, folder_id: targetFolderId });
    if (success) {
      toast.success(targetFolderId ? 'Moved to folder' : 'Removed from folder');
    }
  }, [patchQRCode]);

  const handleEditUrlSubmit = useCallback(async (url: string) => {
    if (!editUrlTarget) return;
    const success = await patchQRCode({ id: editUrlTarget.id, destination_url: url });
    if (!success) throw new Error('Failed to update URL');
    toast.success('Destination URL updated');
  }, [editUrlTarget, patchQRCode]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const success = await deleteQRCode(deleteTarget.id);
    if (success) {
      toast.success('QR code deleted');
    }
    setIsDeleting(false);
    setDeleteTarget(null);
  }, [deleteTarget, deleteQRCode]);

  const handleCreateFolderSubmit = useCallback(async (name: string, color: string) => {
    await createFolder({ name, color });
    toast.success('Folder created');
  }, [createFolder]);

  return (
    <DashboardLayout>
      <div className="space-y-5 animate-slide-up-page">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">QR Codes</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage and track all your QR codes
            </p>
          </div>
        </div>

        {/* Filter bar */}
        <QRCodeFilterBar
          status={status}
          onStatusChange={setStatus}
          counts={counts}
          folderId={folderId}
          onFolderChange={setFolderId}
          folders={folders}
          search={search}
          onSearchChange={setSearch}
          sort={sort}
          order={order}
          onSortChange={handleSortChange}
          onCreateFolder={() => setCreateFolderOpen(true)}
        />

        {/* QR Code rows */}
        {qrError ? (
          <QueryError message="Failed to load QR codes." retry={refetch} />
        ) : isLoading ? (
          <div className="card-no-blur rounded-2xl overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-black/[0.04] dark:border-white/[0.04] last:border-b-0">
                <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-3 w-32 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                </div>
                <div className="hidden sm:block h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="hidden lg:block h-3 w-16 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                <div className="flex gap-1">
                  <div className="w-7 h-7 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
                  <div className="w-7 h-7 rounded bg-gray-100 dark:bg-gray-800 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : qrCodes.length === 0 ? (
          <div className="card-no-blur rounded-2xl p-12 text-center">
            <QrCode className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {search ? 'No matching QR codes' : 'No QR codes yet'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {search
                ? 'Try a different search term or clear filters.'
                : 'Create your first QR code to get started.'}
            </p>
            {!search && (
              <Link to="/create">
                <Button variant="primary">
                  <Plus className="w-4 h-4 mr-1.5" />
                  Create QR Code
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="card-no-blur rounded-2xl overflow-hidden divide-y divide-black/[0.04] dark:divide-white/[0.04]">
            {qrCodes.map((qr) => (
              <QRCodeRow
                key={qr.id}
                qr={qr}
                folders={folders}
                onEditUrl={setEditUrlTarget}
                onToggleActive={handleToggleActive}
                onMoveToFolder={handleMoveToFolder}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateFolderModal
        isOpen={createFolderOpen}
        onClose={() => setCreateFolderOpen(false)}
        onSubmit={handleCreateFolderSubmit}
        isLoading={isCreating}
      />

      {editUrlTarget && (
        <EditUrlModal
          isOpen={!!editUrlTarget}
          onClose={() => setEditUrlTarget(null)}
          onSubmit={handleEditUrlSubmit}
          currentUrl={editUrlTarget.destination_url}
          qrType={editUrlTarget.qr_type}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => !isDeleting && setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete QR Code"
        message={`Are you sure you want to delete "${deleteTarget?.name || 'this QR code'}"? This action cannot be undone. All scan data will be permanently lost.`}
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
        cancelLabel="Cancel"
        variant="danger"
      />
    </DashboardLayout>
  );
}
