import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { usePlanGate } from '@/hooks/usePlanGate';
import { useCustomDomain } from '@/hooks/queries/useCustomDomain';
import { toast } from '@/stores/toastStore';
import {
  Globe,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Trash2,
  RefreshCw,
  ArrowUpRight,
} from 'lucide-react';

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'verified':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
          <CheckCircle2 className="w-3 h-3" />
          Verified
        </span>
      );
    case 'verifying':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
          <Clock className="w-3 h-3" />
          Verifying
        </span>
      );
    case 'failed':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
          <AlertCircle className="w-3 h-3" />
          Failed
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
          <Clock className="w-3 h-3" />
          Pending
        </span>
      );
  }
}

export function DomainsSettingsContent() {
  const { canUse } = usePlanGate();
  const {
    domain,
    isLoading,
    addDomain,
    isAdding,
    verifyDomain,
    isVerifying,
    removeDomain,
    isRemoving,
  } = useCustomDomain();

  const [newDomain, setNewDomain] = useState('');
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  const canUseWhiteLabel = canUse('white_label');

  const handleAddDomain = async () => {
    if (!newDomain.trim()) return;

    try {
      await addDomain(newDomain.trim().toLowerCase());
      toast.success('Domain added! Configure your DNS to continue.');
      setNewDomain('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add domain');
    }
  };

  const handleVerify = async () => {
    try {
      await verifyDomain();
      toast.success('DNS check complete');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Verification failed');
    }
  };

  const handleRemove = async () => {
    try {
      await removeDomain();
      toast.success('Custom domain removed');
      setShowRemoveConfirm(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove domain');
    }
  };

  const handleCopyCname = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Custom Domain</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Use your own domain for QR code tracking URLs
        </p>
      </div>

      {/* Plan gate */}
      {!canUseWhiteLabel && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-4">
            <Globe className="w-8 h-8 text-orange-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Custom Domains for Business
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Use your own domain (e.g., <code className="text-sm bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">track.yourcompany.com</code>) for branded QR code tracking URLs. Available on the Business plan.
          </p>
          <Button onClick={() => window.location.href = '/settings?tab=billing'}>
            <ArrowUpRight className="w-4 h-4" />
            Upgrade to Business
          </Button>
        </div>
      )}

      {/* Main content (Business tier) */}
      {canUseWhiteLabel && (
        <>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
            </div>
          ) : domain ? (
            /* Domain configured */
            <div className="space-y-6">
              {/* Domain status card */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white font-mono">
                        {domain.domain}
                      </h2>
                      <StatusBadge status={domain.status} />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {domain.status === 'verified'
                        ? `All new QR codes will use https://${domain.domain}/r/...`
                        : 'Configure your DNS records to complete setup'}
                    </p>
                  </div>
                </div>

                {/* CNAME instructions for non-verified domains */}
                {domain.status !== 'verified' && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                      DNS Configuration
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      Add the following CNAME record to your DNS provider:
                    </p>

                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 font-mono text-sm">
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">CNAME Record</div>
                          <div className="text-gray-900 dark:text-white truncate">
                            {domain.domain} &rarr; {domain.cname_target}
                          </div>
                        </div>
                        <button
                          onClick={() => handleCopyCname(`${domain.domain} CNAME ${domain.cname_target}`)}
                          className="flex-shrink-0 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                          title="Copy CNAME record"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {domain.last_check_error && (
                      <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
                        Last check: {domain.last_check_error}
                      </p>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="mt-6 flex items-center gap-3">
                  {domain.status !== 'verified' && (
                    <Button onClick={handleVerify} disabled={isVerifying}>
                      {isVerifying ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                      {isVerifying ? 'Checking...' : 'Verify DNS'}
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    onClick={() => setShowRemoveConfirm(true)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove Domain
                  </Button>
                </div>
              </div>

              {/* Info about verified domain */}
              {domain.status === 'verified' && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-200 dark:border-green-800 p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-300">
                        Domain verified and active
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                        New QR codes will automatically use <code className="bg-green-100 dark:bg-green-800 px-1.5 py-0.5 rounded">https://{domain.domain}/r/...</code> as their tracking URL. Existing QR codes will still use the previous URL.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* No domain configured */
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Add Custom Domain
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Enter a domain or subdomain you own (e.g., <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">track.yourcompany.com</code>).
                You'll need to add a CNAME record with your DNS provider.
              </p>

              <div className="flex items-center gap-3">
                <Input
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="track.yourcompany.com"
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddDomain();
                  }}
                />
                <Button onClick={handleAddDomain} disabled={isAdding || !newDomain.trim()}>
                  {isAdding ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Globe className="w-4 h-4" />
                  )}
                  {isAdding ? 'Adding...' : 'Add Domain'}
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Remove confirmation */}
      <ConfirmDialog
        isOpen={showRemoveConfirm}
        onClose={() => setShowRemoveConfirm(false)}
        onConfirm={handleRemove}
        title="Remove Custom Domain"
        message={`Are you sure you want to remove ${domain?.domain || 'this domain'}? New QR codes will revert to using the default tracking URL.`}
        confirmLabel={isRemoving ? 'Removing...' : 'Remove'}
        cancelLabel="Cancel"
        variant="danger"
      />
    </div>
  );
}

export default function DomainsSettingsPage() {
  return <DomainsSettingsContent />;
}
