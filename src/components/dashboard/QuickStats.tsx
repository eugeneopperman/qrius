import { useState } from 'react';
import { QrCode, Scan, TrendingUp, Users, type LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

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
  const [selected, setSelected] = useState(0);

  const stats: { icon: LucideIcon; value: string | number; label: string }[] = [
    { icon: QrCode, value: qrCodesCount, label: 'Total QR Codes' },
    { icon: Scan, value: scansToday, label: 'Scans Today' },
    { icon: TrendingUp, value: scansThisMonth.toLocaleString(), label: 'Scans This Month' },
    { icon: Users, value: teamMembers, label: 'Team Members' },
  ];

  return (
    <>
      {/* Mobile: compact pill bar */}
      <div className="sm:hidden glass rounded-2xl p-3">
        <div className="grid grid-cols-4 gap-1">
          {stats.map((stat, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 rounded-xl min-h-[2.75rem] py-2 transition-colors',
                selected === i
                  ? 'bg-orange-500/10'
                  : 'hover:bg-black/5 dark:hover:bg-white/5'
              )}
            >
              <stat.icon className={cn('w-4 h-4', selected === i ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400')} />
              <span className={cn('text-lg font-bold leading-none', selected === i ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400')}>
                {stat.value}
              </span>
            </button>
          ))}
        </div>
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-1.5">
          {stats[selected].label}
        </p>
      </div>

      {/* Desktop: full stat cards */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
    </>
  );
}
