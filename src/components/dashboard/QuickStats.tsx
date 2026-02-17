import { QrCode, Scan, TrendingUp, Users } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
}

function StatCard({ title, value, change, changeType = 'neutral', icon }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 card-hover">
      <div className="flex items-center justify-between">
        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
          {icon}
        </div>
        {change && (
          <span
            className={`text-sm font-medium ${
              changeType === 'positive'
                ? 'text-green-600 dark:text-green-400'
                : changeType === 'negative'
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {change}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      </div>
    </div>
  );
}

interface QuickStatsProps {
  qrCodesCount: number;
  scansToday: number;
  scansThisMonth: number;
  teamMembers: number;
}

export function QuickStats({ qrCodesCount, scansToday, scansThisMonth, teamMembers }: QuickStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total QR Codes"
        value={qrCodesCount}
        icon={<QrCode className="w-5 h-5 text-orange-600 dark:text-orange-400" />}
      />
      <StatCard
        title="Scans Today"
        value={scansToday}
        change="+12%"
        changeType="positive"
        icon={<Scan className="w-5 h-5 text-orange-600 dark:text-orange-400" />}
      />
      <StatCard
        title="Scans This Month"
        value={scansThisMonth.toLocaleString()}
        change="+8%"
        changeType="positive"
        icon={<TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />}
      />
      <StatCard
        title="Team Members"
        value={teamMembers}
        icon={<Users className="w-5 h-5 text-orange-600 dark:text-orange-400" />}
      />
    </div>
  );
}
