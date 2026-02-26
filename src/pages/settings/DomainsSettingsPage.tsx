import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { usePlanGate } from '@/hooks/usePlanGate';
import { useCustomDomain } from '@/hooks/queries/useCustomDomain';
import { toast } from '@/stores/toastStore';
import { QueryError } from '@/components/ui/QueryError';
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
  Zap,
  Lock,
} from 'lucide-react';

// Will be set to a real domain once configured (e.g., qrius.app)
// Until then, subdomain creation is disabled and the API returns 503
const SUBDOMAIN_BASE_DOMAIN: string | null = null;

function isAppSubdomain(domainStr: string): boolean {
  if (!SUBDOMAIN_BASE_DOMAIN) return false;
  return domainStr.endsWith(`.${SUBDOMAIN_BASE_DOMAIN}`);
}

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
    error: domainError,
    addDomain,
    isAdding,
    verifyDomain,
    isVerifying,
    removeDomain,
    isRemoving,
  } = useCustomDomain();

  const [subdomainLabel, setSubdomainLabel] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  const canUseWhiteLabel = canUse('white_label');

  const handleAddSubdomain = async () => {
    const label = subdomainLabel.trim().toLowerCase();
    if (!label) return;

    try {
      await addDomain({ type: 'subdomain', subdomain: label });
      toast.success('Subdomain created and ready to use!');
      setSubdomainLabel('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create subdomain');
    }
  };

  const handleAddCustomDomain = async () => {
    const d = customDomain.trim().toLowerCase();
    if (!d) return;

    try {
      await addDomain({ type: 'custom', domain: d });
      toast.success('Domain added! Configure your DNS to continue.');
      setCustomDomain('');
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
      toast.success('Domain removed');
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

  const isDomainAppSubdomain = domain ? isAppSubdomain(domain.domain) : false;

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Branded Domain</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Use a custom domain for QR code tracking URLs
        </p>
      </div>

      {domainError ? (
        <QueryError message="Failed to load domain settings." />
      ) : isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
        </div>
      ) : domain ? (
        /* Domain configured — show status */
        <div className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white font-mono">
                    {domain.domain}
                  </h2>
                  <StatusBadge status={domain.status} />
                  {isDomainAppSubdomain && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                      App Subdomain
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {domain.status === 'verified'
                    ? `All new QR codes will use https://${domain.domain}/r/...`
                    : 'Configure your DNS records to complete setup'}
                </p>
              </div>
            </div>

            {/* CNAME instructions for non-verified custom domains (not subdomains) */}
            {domain.status !== 'verified' && !isDomainAppSubdomain && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                  DNS Configuration
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Add the following CNAME record to your DNS provider:
                </p>

                <div className="bg-black/5 dark:bg-white/5 rounded-lg p-4 font-mono text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">CNAME Record</div>
                      <div className="text-gray-900 dark:text-white truncate">
                        {domain.domain} &rarr; {domain.cname_target}
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopyCname(`${domain.domain} CNAME ${domain.cname_target}`)}
                      className="flex-shrink-0 btn-icon text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      aria-label="Copy CNAME record"
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
              {domain.status !== 'verified' && !isDomainAppSubdomain && (
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
        /* No domain configured — show two options side by side */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card A: App Subdomain (any plan) */}
          <div className={`glass rounded-2xl p-6 flex flex-col ${!SUBDOMAIN_BASE_DOMAIN ? 'opacity-75' : ''}`}>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                App Subdomain
              </h2>
            </div>
            <span className="inline-flex self-start items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 mb-3">
              All plans
            </span>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex-1">
              {SUBDOMAIN_BASE_DOMAIN
                ? 'Get a branded subdomain instantly. No DNS setup needed.'
                : 'App subdomains are coming soon. Get a branded URL like my-brand.qrius.app with no DNS setup.'}
            </p>

            {SUBDOMAIN_BASE_DOMAIN ? (
              <div className="space-y-3">
                <div className="flex items-center">
                  <Input
                    value={subdomainLabel}
                    onChange={(e) => setSubdomainLabel(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="my-brand"
                    className="rounded-r-none flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddSubdomain();
                    }}
                  />
                  <div className="flex items-center px-3 h-10 bg-black/5 dark:bg-white/5 border border-l-0 border-white/20 dark:border-white/10 rounded-r-lg text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    .{SUBDOMAIN_BASE_DOMAIN}
                  </div>
                </div>
                <Button
                  onClick={handleAddSubdomain}
                  disabled={isAdding || !subdomainLabel.trim() || subdomainLabel.trim().length < 3}
                  className="w-full"
                >
                  {isAdding ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                  {isAdding ? 'Creating...' : 'Create Subdomain'}
                </Button>
              </div>
            ) : (
              <div className="mt-auto">
                <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-black/5 dark:bg-white/5 text-gray-500 dark:text-gray-400">
                  Coming Soon
                </span>
              </div>
            )}
          </div>

          {/* Card B: Custom Domain (Business only) */}
          <div className={`glass rounded-2xl p-6 flex flex-col ${!canUseWhiteLabel ? 'opacity-75' : ''}`}>
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Custom Domain
              </h2>
            </div>
            {canUseWhiteLabel ? (
              <span className="inline-flex self-start items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 mb-3">
                Business
              </span>
            ) : (
              <span className="inline-flex self-start items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500/12 dark:bg-orange-400/10 text-orange-700 dark:text-orange-400 mb-3">
                <Lock className="w-3 h-3" />
                Business plan
              </span>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex-1">
              Use your own domain (e.g., <code className="bg-black/5 dark:bg-white/5 px-1 py-0.5 rounded text-xs">track.acme.com</code>). Requires DNS setup.
            </p>

            <div className="space-y-3">
              <Input
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="track.yourcompany.com"
                disabled={!canUseWhiteLabel}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddCustomDomain();
                }}
              />
              {canUseWhiteLabel ? (
                <Button
                  onClick={handleAddCustomDomain}
                  disabled={isAdding || !customDomain.trim()}
                  className="w-full"
                >
                  {isAdding ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Globe className="w-4 h-4" />
                  )}
                  {isAdding ? 'Adding...' : 'Add Domain'}
                </Button>
              ) : (
                <Button
                  onClick={() => window.location.href = '/settings?tab=billing'}
                  variant="secondary"
                  className="w-full"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  Upgrade to Business
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Remove confirmation */}
      <ConfirmDialog
        isOpen={showRemoveConfirm}
        onClose={() => setShowRemoveConfirm(false)}
        onConfirm={handleRemove}
        title="Remove Domain"
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
