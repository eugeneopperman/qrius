import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useAdminStats } from '@/hooks/queries/useAdminStats';
import type { AdminStats } from '@/hooks/queries/useAdminStats';
import {
  Users,
  UserPlus,
  QrCode,
  ScanLine,
  Smartphone,
  Monitor,
  Tablet,
  Activity,
  TrendingUp,
  Loader2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// --- Stat Card ---
function StatCard({ icon: Icon, label, value, sub }: { icon: LucideIcon; label: string; value: string | number; sub?: string }) {
  return (
    <div className="glass rounded-2xl p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">{typeof value === 'number' ? value.toLocaleString() : value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{label}</p>
        {sub && <p className="text-[10px] text-gray-400 dark:text-gray-500">{sub}</p>}
      </div>
    </div>
  );
}

// --- Horizontal Bar ---
function Bar({ label, value, max, color = 'bg-orange-500' }: { label: string; value: number; max: number; color?: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-28 truncate text-gray-600 dark:text-gray-400 text-right shrink-0">{label}</span>
      <div className="flex-1 bg-black/5 dark:bg-white/5 rounded-full h-4 overflow-hidden">
        <div className={`${color} h-full rounded-full transition-all`} style={{ width: `${Math.max(pct, 1)}%` }} />
      </div>
      <span className="w-14 text-right text-gray-700 dark:text-gray-300 font-medium shrink-0">{value.toLocaleString()}</span>
    </div>
  );
}

// --- Country flag helper ---
function countryFlag(code: string): string {
  if (!code || code.length !== 2) return '';
  const offset = 0x1F1E6;
  return String.fromCodePoint(
    code.charCodeAt(0) - 65 + offset,
    code.charCodeAt(1) - 65 + offset,
  );
}

// --- Device icon helper ---
function deviceIcon(type: string) {
  const t = type.toLowerCase();
  if (t === 'mobile') return Smartphone;
  if (t === 'tablet') return Tablet;
  return Monitor;
}

// --- Section wrapper ---
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{title}</h2>
      {children}
    </div>
  );
}

// --- Loading skeleton ---
function Skeleton() {
  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
          <span className="text-gray-500 dark:text-gray-400 text-sm">Loading admin stats...</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass rounded-2xl p-4 h-20 animate-pulse" />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

// --- Main component ---
function AdminContent({ data }: { data: AdminStats }) {
  const { users, qrCodes, scans } = data;

  const planMax = Math.max(...users.planDistribution.map(p => p.count), 1);
  const statusMax = Math.max(...qrCodes.statusDistribution.map(s => s.count), 1);
  const countryMax = Math.max(...scans.topCountries.map(c => c.count), 1);
  const deviceMax = Math.max(...scans.deviceBreakdown.map(d => d.count), 1);

  return (
    <div className="space-y-8">
      {/* Users */}
      <Section title="Users">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <StatCard icon={Users} label="Total Users" value={users.total} />
          <StatCard icon={Activity} label="Active Today" value={users.activeToday} />
          <StatCard icon={UserPlus} label="Signups Today" value={users.signupsToday} />
          <StatCard icon={TrendingUp} label="Signups This Month" value={users.signupsThisMonth} sub={`${users.signupsThisWeek} this week`} />
        </div>
        {users.planDistribution.length > 0 && (
          <div className="glass rounded-2xl p-4 space-y-2">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Plan Distribution</h3>
            {users.planDistribution.map(p => (
              <Bar key={p.plan} label={p.plan} value={p.count} max={planMax} />
            ))}
          </div>
        )}
      </Section>

      {/* QR Codes */}
      <Section title="QR Codes">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          <StatCard icon={QrCode} label="Total QR Codes" value={qrCodes.total} />
          <StatCard icon={QrCode} label="Created Today" value={qrCodes.createdToday} />
          <StatCard icon={QrCode} label="Created This Week" value={qrCodes.createdThisWeek} />
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          {qrCodes.statusDistribution.length > 0 && (
            <div className="glass rounded-2xl p-4 space-y-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status Breakdown</h3>
              {qrCodes.statusDistribution.map(s => (
                <Bar
                  key={s.status}
                  label={s.status}
                  value={s.count}
                  max={statusMax}
                  color={s.status === 'active' ? 'bg-green-500' : s.status === 'draft' ? 'bg-amber-500' : 'bg-gray-400'}
                />
              ))}
            </div>
          )}
          {qrCodes.topScanned.length > 0 && (
            <div className="glass rounded-2xl p-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Top 10 Most Scanned</h3>
              <div className="space-y-1.5">
                {qrCodes.topScanned.map((qr, i) => (
                  <div key={qr.id} className="flex items-center gap-2 text-sm">
                    <span className="w-5 text-gray-400 text-right shrink-0">{i + 1}.</span>
                    <span className="flex-1 truncate text-gray-700 dark:text-gray-300">{qr.name}</span>
                    <span className="font-medium text-gray-900 dark:text-white shrink-0">{qr.totalScans.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Section>

      {/* Scans */}
      <Section title="Scans">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <StatCard icon={ScanLine} label="Total Scans" value={scans.total} />
          <StatCard icon={ScanLine} label="Today" value={scans.today} />
          <StatCard icon={ScanLine} label="This Week" value={scans.thisWeek} />
          <StatCard icon={ScanLine} label="This Month" value={scans.thisMonth} />
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          {scans.topCountries.length > 0 && (
            <div className="glass rounded-2xl p-4 space-y-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Top Countries</h3>
              {scans.topCountries.map(c => (
                <Bar
                  key={c.countryCode}
                  label={`${countryFlag(c.countryCode)} ${c.countryCode}`}
                  value={c.count}
                  max={countryMax}
                />
              ))}
            </div>
          )}
          {scans.deviceBreakdown.length > 0 && (
            <div className="glass rounded-2xl p-4 space-y-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Device Breakdown</h3>
              {scans.deviceBreakdown.map(d => {
                const DevIcon = deviceIcon(d.deviceType);
                return (
                  <div key={d.deviceType} className="flex items-center gap-2 text-sm">
                    <DevIcon className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="w-24 truncate text-gray-600 dark:text-gray-400">{d.deviceType}</span>
                    <div className="flex-1 bg-black/5 dark:bg-white/5 rounded-full h-4 overflow-hidden">
                      <div className="bg-orange-500 h-full rounded-full transition-all" style={{ width: `${Math.max((d.count / deviceMax) * 100, 1)}%` }} />
                    </div>
                    <span className="w-14 text-right text-gray-700 dark:text-gray-300 font-medium shrink-0">{d.count.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data, isLoading, error, refetch } = useAdminStats();

  if (isLoading) return <Skeleton />;

  if (error || !data) {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-6 max-w-6xl mx-auto">
          <div className="glass rounded-2xl p-8 text-center">
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="text-gray-700 dark:text-gray-300 mb-4">{error?.message || 'Failed to load admin stats'}</p>
            <button onClick={() => refetch()} className="btn btn-primary inline-flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Platform Admin</h1>
          <button onClick={() => refetch()} className="btn btn-sm inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
        <AdminContent data={data} />
      </div>
    </DashboardLayout>
  );
}
