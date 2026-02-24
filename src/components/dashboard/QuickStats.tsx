import { QrCode, Scan, TrendingUp, Users } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

function StatCard({ title, value, icon }: StatCardProps) {
  return (
    <div className="glass rounded-2xl p-6 card-hover">
      <div className="flex items-center justify-between">
        <div className="p-2 bg-orange-500/10 rounded-lg">
          {icon}
        </div>
      </div>
      <div className="mt-4">
        <p className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">{value}</p>
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
        icon={<Scan className="w-5 h-5 text-orange-600 dark:text-orange-400" />}
      />
      <StatCard
        title="Scans This Month"
        value={scansThisMonth.toLocaleString()}
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
