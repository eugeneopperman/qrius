import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { AnalyticsCharts } from '../AnalyticsCharts';

// Shared empty props for the component
function makeProps(overrides: Partial<Parameters<typeof AnalyticsCharts>[0]> = {}) {
  return {
    totalScans: 100,
    scansToday: 5,
    scansThisWeek: 30,
    scansThisMonth: 80,
    topCountries: [
      { countryCode: 'US', count: 40 },
      { countryCode: 'GB', count: 20 },
    ],
    deviceBreakdown: [{ deviceType: 'mobile', count: 60 }, { deviceType: 'desktop', count: 40 }],
    browserBreakdown: [{ browser: 'Chrome', count: 50 }, { browser: 'Safari', count: 30 }],
    osBreakdown: [{ os: 'Android', count: 45 }, { os: 'iOS', count: 35 }],
    referrerBreakdown: [{ referrer: 'google.com', count: 25 }],
    scansByHour: Array.from({ length: 24 }, (_, i) => ({ hour: i, count: i % 3 })),
    scansByDay: Array.from({ length: 7 }, (_, i) => ({
      date: `2026-02-${String(20 + i).padStart(2, '0')}`,
      count: 10 + i * 2,
    })),
    topRegions: [{ region: 'California', count: 15 }, { region: 'Texas', count: 10 }],
    topCountryForRegions: 'US',
    ...overrides,
  };
}

describe('AnalyticsCharts', () => {
  describe('empty state', () => {
    it('renders empty state when totalScans is 0', () => {
      render(<AnalyticsCharts {...makeProps({ totalScans: 0 })} />);
      expect(screen.getByText('No scan data yet')).toBeInTheDocument();
      expect(screen.getByText(/Share your QR code/)).toBeInTheDocument();
    });

    it('does not render tabs when totalScans is 0', () => {
      render(<AnalyticsCharts {...makeProps({ totalScans: 0 })} />);
      expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    });
  });

  describe('tab rendering', () => {
    it('renders all four tabs', () => {
      render(<AnalyticsCharts {...makeProps()} />);
      expect(screen.getByRole('tablist')).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Overview/ })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Geography/ })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Technology/ })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Sources/ })).toBeInTheDocument();
    });

    it('shows Overview tab as selected by default', () => {
      render(<AnalyticsCharts {...makeProps()} />);
      expect(screen.getByRole('tab', { name: /Overview/ })).toHaveAttribute('aria-selected', 'true');
    });

    it('switches to Geography tab on click', async () => {
      const { user } = render(<AnalyticsCharts {...makeProps()} />);
      await user.click(screen.getByRole('tab', { name: /Geography/ }));
      expect(screen.getByRole('tab', { name: /Geography/ })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Top Countries')).toBeInTheDocument();
    });

    it('switches to Technology tab on click', async () => {
      const { user } = render(<AnalyticsCharts {...makeProps()} />);
      await user.click(screen.getByRole('tab', { name: /Technology/ }));
      expect(screen.getByText('Browsers')).toBeInTheDocument();
      expect(screen.getByText('Operating Systems')).toBeInTheDocument();
    });

    it('switches to Sources tab on click', async () => {
      const { user } = render(<AnalyticsCharts {...makeProps()} />);
      await user.click(screen.getByRole('tab', { name: /Sources/ }));
      expect(screen.getByText('Traffic Sources')).toBeInTheDocument();
    });
  });

  describe('Overview panel', () => {
    it('renders stat cards with correct values', () => {
      render(<AnalyticsCharts {...makeProps()} />);
      expect(screen.getByText('100')).toBeInTheDocument(); // totalScans
      expect(screen.getByText('5')).toBeInTheDocument();   // scansToday
      expect(screen.getByText('30')).toBeInTheDocument();  // scansThisWeek
      expect(screen.getByText('80')).toBeInTheDocument();  // scansThisMonth
    });

    it('renders stat labels', () => {
      render(<AnalyticsCharts {...makeProps()} />);
      expect(screen.getByText('Total Scans')).toBeInTheDocument();
      expect(screen.getByText('Today')).toBeInTheDocument();
      expect(screen.getByText('This Week')).toBeInTheDocument();
      expect(screen.getByText('This Month')).toBeInTheDocument();
    });

    it('renders daily bar chart section', () => {
      render(<AnalyticsCharts {...makeProps()} />);
      expect(screen.getByText('Daily Scans (Last 30 days)')).toBeInTheDocument();
    });

    it('renders hourly distribution section', () => {
      render(<AnalyticsCharts {...makeProps()} />);
      expect(screen.getByText(/Hourly Distribution/)).toBeInTheDocument();
    });
  });

  describe('Geography panel', () => {
    it('renders country bars with country codes', async () => {
      const { user } = render(<AnalyticsCharts {...makeProps()} />);
      await user.click(screen.getByRole('tab', { name: /Geography/ }));
      expect(screen.getByText('Top Countries')).toBeInTheDocument();
      // Country count values should appear
      expect(screen.getByText('40')).toBeInTheDocument();
      expect(screen.getByText('20')).toBeInTheDocument();
    });

    it('shows empty message when no country data', async () => {
      const { user } = render(<AnalyticsCharts {...makeProps({ topCountries: [] })} />);
      await user.click(screen.getByRole('tab', { name: /Geography/ }));
      expect(screen.getByText('No geographic data available')).toBeInTheDocument();
    });

    it('renders top regions section for top country', async () => {
      const { user } = render(<AnalyticsCharts {...makeProps()} />);
      await user.click(screen.getByRole('tab', { name: /Geography/ }));
      expect(screen.getByText('California')).toBeInTheDocument();
      expect(screen.getByText('Texas')).toBeInTheDocument();
    });

    it('hides regions section when no regions data', async () => {
      const { user } = render(<AnalyticsCharts {...makeProps({ topRegions: [], topCountryForRegions: null })} />);
      await user.click(screen.getByRole('tab', { name: /Geography/ }));
      expect(screen.queryByText('Top Regions')).not.toBeInTheDocument();
    });
  });

  describe('Technology panel', () => {
    it('renders browser and OS breakdowns', async () => {
      const { user } = render(<AnalyticsCharts {...makeProps()} />);
      await user.click(screen.getByRole('tab', { name: /Technology/ }));
      expect(screen.getByText('Chrome')).toBeInTheDocument();
      expect(screen.getByText('Safari')).toBeInTheDocument();
      expect(screen.getByText('Android')).toBeInTheDocument();
      expect(screen.getByText('iOS')).toBeInTheDocument();
    });

    it('renders device types with capitalized labels', async () => {
      const { user } = render(<AnalyticsCharts {...makeProps()} />);
      await user.click(screen.getByRole('tab', { name: /Technology/ }));
      expect(screen.getByText('Mobile')).toBeInTheDocument();
      expect(screen.getByText('Desktop')).toBeInTheDocument();
    });

    it('shows empty message when no browser data', async () => {
      const { user } = render(<AnalyticsCharts {...makeProps({ browserBreakdown: [] })} />);
      await user.click(screen.getByRole('tab', { name: /Technology/ }));
      expect(screen.getByText('No browser data')).toBeInTheDocument();
    });

    it('shows empty message when no OS data', async () => {
      const { user } = render(<AnalyticsCharts {...makeProps({ osBreakdown: [] })} />);
      await user.click(screen.getByRole('tab', { name: /Technology/ }));
      expect(screen.getByText('No OS data')).toBeInTheDocument();
    });

    it('hides device section when no device data', async () => {
      const { user } = render(<AnalyticsCharts {...makeProps({ deviceBreakdown: [] })} />);
      await user.click(screen.getByRole('tab', { name: /Technology/ }));
      expect(screen.queryByText('Device Types')).not.toBeInTheDocument();
    });
  });

  describe('Sources panel', () => {
    it('renders referrer data', async () => {
      const { user } = render(<AnalyticsCharts {...makeProps()} />);
      await user.click(screen.getByRole('tab', { name: /Sources/ }));
      expect(screen.getByText('google.com')).toBeInTheDocument();
    });

    it('shows empty message when no referrer data', async () => {
      const { user } = render(<AnalyticsCharts {...makeProps({ referrerBreakdown: [] })} />);
      await user.click(screen.getByRole('tab', { name: /Sources/ }));
      expect(screen.getByText('No referrer data available')).toBeInTheDocument();
    });
  });
});
