import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@/components/ui/Tabs';
import {
  BarChart2,
  Globe,
  Laptop,
  Link2,
  Calendar,
  TrendingUp,
  Clock,
} from 'lucide-react';

interface AnalyticsChartsProps {
  totalScans: number;
  scansToday: number;
  scansThisWeek: number;
  scansThisMonth: number;
  topCountries: { countryCode: string; count: number }[];
  deviceBreakdown: { deviceType: string; count: number }[];
  browserBreakdown: { browser: string; count: number }[];
  osBreakdown: { os: string; count: number }[];
  referrerBreakdown: { referrer: string; count: number }[];
  scansByHour: { hour: number; count: number }[];
  scansByDay: { date: string; count: number }[];
  topRegions: { region: string; count: number }[];
  topCountryForRegions: string | null;
}

// Convert 2-letter country code to flag emoji
function countryFlag(code: string): string {
  const upper = code.toUpperCase();
  if (upper.length !== 2) return '';
  const offset = 0x1F1E6 - 65; // Regional Indicator Symbol Letter A
  return String.fromCodePoint(upper.charCodeAt(0) + offset, upper.charCodeAt(1) + offset);
}

// Format hour as 12-hour string
function formatHour(h: number): string {
  if (h === 0) return '12 AM';
  if (h < 12) return `${h} AM`;
  if (h === 12) return '12 PM';
  return `${h - 12} PM`;
}

// Format date as short label
function formatDayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Reusable horizontal bar row
function HorizontalBar({
  label,
  count,
  max,
  total,
}: {
  label: string;
  count: number;
  max: number;
  total: number;
}) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  const pctOfTotal = total > 0 ? ((count / total) * 100).toFixed(1) : '0';

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-700 dark:text-gray-300 w-20 sm:w-32 truncate flex-shrink-0">
        {label}
      </span>
      <div className="flex-1 h-6 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full bg-orange-500 rounded-full transition-all duration-500"
          style={{ width: `${Math.max(pct, 1)}%` }}
        />
      </div>
      <span className="text-sm font-medium text-gray-900 dark:text-white w-12 text-right flex-shrink-0">
        {count}
      </span>
      <span className="text-xs text-gray-500 dark:text-gray-400 w-12 text-right flex-shrink-0">
        {pctOfTotal}%
      </span>
    </div>
  );
}

// Stat card used in Overview
function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
}) {
  return (
    <div className="glass rounded-2xl p-4">
      <Icon className="w-5 h-5 text-orange-500 mb-2" />
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}

export function AnalyticsCharts({
  totalScans,
  scansToday,
  scansThisWeek,
  scansThisMonth,
  topCountries,
  deviceBreakdown,
  browserBreakdown,
  osBreakdown,
  referrerBreakdown,
  scansByHour,
  scansByDay,
  topRegions,
  topCountryForRegions,
}: AnalyticsChartsProps) {
  if (totalScans === 0) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <BarChart2 className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          No scan data yet
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Share your QR code to start collecting analytics.
        </p>
      </div>
    );
  }

  const maxDaily = Math.max(...scansByDay.map((d) => d.count), 1);
  const maxHourly = Math.max(...scansByHour.map((h) => h.count), 1);
  const countryTotal = topCountries.reduce((s, c) => s + c.count, 0);
  const deviceTotal = deviceBreakdown.reduce((s, d) => s + d.count, 0);
  const browserTotal = browserBreakdown.reduce((s, b) => s + b.count, 0);
  const osTotal = osBreakdown.reduce((s, o) => s + o.count, 0);
  const referrerTotal = referrerBreakdown.reduce((s, r) => s + r.count, 0);
  const regionTotal = topRegions.reduce((s, r) => s + r.count, 0);

  return (
    <div className="glass rounded-2xl">
      <TabGroup>
        <div className="px-6 pt-4 border-b border-divider">
          <TabList>
            <Tab icon={BarChart2}>Overview</Tab>
            <Tab icon={Globe}>Geography</Tab>
            <Tab icon={Laptop}>Technology</Tab>
            <Tab icon={Link2}>Sources</Tab>
          </TabList>
        </div>

        <TabPanels className="p-6">
          {/* Overview */}
          <TabPanel>
            <div className="space-y-6">
              {/* Stat cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard icon={BarChart2} label="Total Scans" value={totalScans} />
                <StatCard icon={Calendar} label="Today" value={scansToday} />
                <StatCard icon={TrendingUp} label="This Week" value={scansThisWeek} />
                <StatCard icon={TrendingUp} label="This Month" value={scansThisMonth} />
              </div>

              {/* Daily bar chart */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Daily Scans (Last 30 days)
                </h4>
                <div className="flex items-end gap-[2px] h-32">
                  {scansByDay.map((day) => {
                    const heightPct = maxDaily > 0 ? (day.count / maxDaily) * 100 : 0;
                    return (
                      <div
                        key={day.date}
                        className="flex-1 group relative"
                        title={`${formatDayLabel(day.date)}: ${day.count} scans`}
                      >
                        <div className="w-full bg-black/5 dark:bg-white/5 rounded-t h-32 flex items-end">
                          <div
                            className="w-full bg-orange-500 rounded-t transition-all duration-300 hover:bg-orange-400"
                            style={{ height: `${Math.max(heightPct, day.count > 0 ? 4 : 0)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-400">{formatDayLabel(scansByDay[0]?.date || '')}</span>
                  <span className="text-xs text-gray-400">{formatDayLabel(scansByDay[scansByDay.length - 1]?.date || '')}</span>
                </div>
              </div>

              {/* Hourly distribution */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Hourly Distribution (Last 7 days)
                </h4>
                <div className="flex items-end gap-[2px] h-20">
                  {scansByHour.map((h) => {
                    const heightPct = maxHourly > 0 ? (h.count / maxHourly) * 100 : 0;
                    return (
                      <div
                        key={h.hour}
                        className="flex-1 group relative"
                        title={`${formatHour(h.hour)}: ${h.count} scans`}
                      >
                        <div className="w-full bg-black/5 dark:bg-white/5 rounded-t h-20 flex items-end">
                          <div
                            className="w-full bg-orange-400 rounded-t transition-all duration-300 hover:bg-orange-300"
                            style={{ height: `${Math.max(heightPct, h.count > 0 ? 5 : 0)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-400">12 AM</span>
                  <span className="text-xs text-gray-400">6 AM</span>
                  <span className="text-xs text-gray-400">12 PM</span>
                  <span className="text-xs text-gray-400">6 PM</span>
                  <span className="text-xs text-gray-400">11 PM</span>
                </div>
              </div>
            </div>
          </TabPanel>

          {/* Geography */}
          <TabPanel>
            <div className="space-y-6">
              {/* Countries */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Top Countries
                </h4>
                {topCountries.length === 0 ? (
                  <p className="text-sm text-gray-400 dark:text-gray-500">No geographic data available</p>
                ) : (
                  <div className="space-y-2">
                    {topCountries.map((c) => (
                      <HorizontalBar
                        key={c.countryCode}
                        label={`${countryFlag(c.countryCode)} ${c.countryCode}`}
                        count={c.count}
                        max={topCountries[0]?.count || 1}
                        total={countryTotal}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Regions for top country */}
              {topRegions.length > 0 && topCountryForRegions && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Top Regions — {countryFlag(topCountryForRegions)} {topCountryForRegions}
                  </h4>
                  <div className="space-y-2">
                    {topRegions.slice(0, 10).map((r) => (
                      <HorizontalBar
                        key={r.region}
                        label={r.region}
                        count={r.count}
                        max={topRegions[0]?.count || 1}
                        total={regionTotal}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabPanel>

          {/* Technology */}
          <TabPanel>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Browsers */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Browsers
                  </h4>
                  {browserBreakdown.length === 0 ? (
                    <p className="text-sm text-gray-400 dark:text-gray-500">No browser data</p>
                  ) : (
                    <div className="space-y-2">
                      {browserBreakdown.map((b) => (
                        <HorizontalBar
                          key={b.browser}
                          label={b.browser}
                          count={b.count}
                          max={browserBreakdown[0]?.count || 1}
                          total={browserTotal}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Operating Systems */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Operating Systems
                  </h4>
                  {osBreakdown.length === 0 ? (
                    <p className="text-sm text-gray-400 dark:text-gray-500">No OS data</p>
                  ) : (
                    <div className="space-y-2">
                      {osBreakdown.map((o) => (
                        <HorizontalBar
                          key={o.os}
                          label={o.os}
                          count={o.count}
                          max={osBreakdown[0]?.count || 1}
                          total={osTotal}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Device types */}
              {deviceBreakdown.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Device Types
                  </h4>
                  <div className="space-y-2">
                    {deviceBreakdown.map((d) => (
                      <HorizontalBar
                        key={d.deviceType}
                        label={d.deviceType.charAt(0).toUpperCase() + d.deviceType.slice(1)}
                        count={d.count}
                        max={deviceBreakdown[0]?.count || 1}
                        total={deviceTotal}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabPanel>

          {/* Sources */}
          <TabPanel>
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Traffic Sources
              </h4>
              {referrerBreakdown.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500">No referrer data available</p>
              ) : (
                <div className="space-y-2">
                  {referrerBreakdown.map((r) => (
                    <HorizontalBar
                      key={r.referrer}
                      label={r.referrer}
                      count={r.count}
                      max={referrerBreakdown[0]?.count || 1}
                      total={referrerTotal}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
}
