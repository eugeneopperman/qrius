import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useAdminModeration, useModerationAction, type ModerationReport } from '@/hooks/queries/useAdminModeration';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Loader2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  User,
  Clock,
  Ban,
  CheckCircle,
  XCircle,
} from 'lucide-react';

const TABS = [
  { key: 'pending', label: 'Pending', icon: ShieldAlert },
  { key: 'reviewed', label: 'Reviewed', icon: ShieldCheck },
  { key: 'actioned', label: 'Actioned', icon: ShieldX },
  { key: 'dismissed', label: 'Dismissed', icon: Shield },
] as const;

const REASON_COLORS: Record<string, string> = {
  phishing: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  malware: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  scam: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  spam: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  inappropriate: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  copyright: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  other: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function ReportCard({ report, onAction }: { report: ModerationReport; onAction: (reportId: string, action: string) => void }) {
  const [confirming, setConfirming] = useState<string | null>(null);

  const handleAction = (action: string) => {
    if (action === 'suspend_qr' || action === 'suspend_user') {
      if (confirming !== action) {
        setConfirming(action);
        return;
      }
    }
    setConfirming(null);
    onAction(report.id, action);
  };

  return (
    <div className="glass rounded-xl p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${REASON_COLORS[report.reason] || REASON_COLORS.other}`}>
              {report.reason}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${report.source === 'auto' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
              {report.source === 'auto' ? 'Auto-flagged' : 'User report'}
            </span>
            {report.qr_moderation_status === 'suspended' && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                Suspended
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {report.reported_url || report.qr_destination_url || 'Unknown URL'}
          </p>
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo(report.created_at)}
            </span>
            <span>Code: <code className="bg-black/5 dark:bg-white/5 px-1 rounded">{report.short_code}</code></span>
            {report.reporter_email && (
              <span className="inline-flex items-center gap-1 truncate">
                <User className="w-3 h-3" />
                {report.reporter_email}
              </span>
            )}
          </div>
        </div>
        {report.reported_url && (
          <a
            href={report.reported_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 shrink-0"
            title="Open URL (caution)"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>

      {report.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 bg-black/5 dark:bg-white/5 rounded-lg p-2">
          {report.description}
        </p>
      )}

      {report.admin_notes && (
        <p className="text-xs text-gray-500 dark:text-gray-400 italic">
          Admin: {report.admin_notes} — {report.reviewed_by}
        </p>
      )}

      {report.status === 'pending' && (
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => handleAction('approve')}
            className="btn btn-sm inline-flex items-center gap-1.5 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Approve
          </button>
          <button
            onClick={() => handleAction('suspend_qr')}
            className={`btn btn-sm inline-flex items-center gap-1.5 ${confirming === 'suspend_qr' ? 'bg-red-600 text-white hover:bg-red-700' : 'text-red-700 dark:text-red-400 border border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20'}`}
          >
            <ShieldX className="w-3.5 h-3.5" />
            {confirming === 'suspend_qr' ? 'Confirm Suspend QR' : 'Suspend QR'}
          </button>
          <button
            onClick={() => handleAction('suspend_user')}
            className={`btn btn-sm inline-flex items-center gap-1.5 ${confirming === 'suspend_user' ? 'bg-red-800 text-white hover:bg-red-900' : 'text-red-700 dark:text-red-400 border border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20'}`}
          >
            <Ban className="w-3.5 h-3.5" />
            {confirming === 'suspend_user' ? 'Confirm Ban User' : 'Ban User'}
          </button>
          <button
            onClick={() => handleAction('dismiss')}
            className="btn btn-sm inline-flex items-center gap-1.5 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <XCircle className="w-3.5 h-3.5" />
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminModerationPage() {
  const [activeTab, setActiveTab] = useState('pending');
  const { data, isLoading, error, refetch } = useAdminModeration(activeTab);
  const actionMutation = useModerationAction();

  const handleAction = (reportId: string, action: string) => {
    actionMutation.mutate({ reportId, action: action as 'approve' | 'suspend_qr' | 'suspend_user' | 'dismiss' });
  };

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Content Moderation</h1>
          <button onClick={() => refetch()} className="btn btn-sm inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 overflow-x-auto">
          {TABS.map(({ key, label, icon: Icon }) => {
            const count = data?.counts[key as keyof typeof data.counts] ?? 0;
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === key
                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
                {count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === key
                      ? 'bg-orange-200 dark:bg-orange-800/50'
                      : 'bg-black/5 dark:bg-white/10'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {isLoading && (
          <div className="flex items-center gap-2 py-12 justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
            <span className="text-gray-500 dark:text-gray-400 text-sm">Loading reports...</span>
          </div>
        )}

        {error && (
          <div className="glass rounded-2xl p-8 text-center">
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="text-gray-700 dark:text-gray-300 mb-4">{error.message}</p>
            <button onClick={() => refetch()} className="btn btn-primary inline-flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        )}

        {data && !isLoading && (
          <div className="space-y-3">
            {data.reports.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No {activeTab} reports</p>
              </div>
            ) : (
              data.reports.map((report) => (
                <ReportCard key={report.id} report={report} onAction={handleAction} />
              ))
            )}
          </div>
        )}

        {actionMutation.isPending && (
          <div className="fixed bottom-4 right-4 bg-black/80 text-white px-4 py-2 rounded-lg text-sm inline-flex items-center gap-2 z-50">
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
