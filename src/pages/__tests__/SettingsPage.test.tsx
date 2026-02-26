import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/test-utils';
import SettingsPage from '../SettingsPage';

// Track navigate calls
const mockNavigate = vi.fn();
let mockSearchParams: Record<string, string> = {};

// Mock TanStack Router
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
  useSearch: () => mockSearchParams,
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
}));

// Mock DashboardLayout
vi.mock('@/components/dashboard/DashboardLayout', () => ({
  DashboardLayout: ({ children }: any) => <div data-testid="dashboard-layout">{children}</div>,
}));

// Mock lazy-loaded settings content components
vi.mock('../settings/ProfileSettingsPage', () => ({
  ProfileSettingsContent: () => <div data-testid="profile-settings">Profile Content</div>,
}));

vi.mock('../settings/TeamSettingsPage', () => ({
  TeamSettingsContent: () => <div data-testid="team-settings">Team Content</div>,
}));

vi.mock('../settings/BillingSettingsPage', () => ({
  BillingSettingsContent: () => <div data-testid="billing-settings">Billing Content</div>,
}));

vi.mock('../settings/ApiKeysSettingsPage', () => ({
  ApiKeysSettingsContent: () => <div data-testid="api-keys-settings">API Keys Content</div>,
}));

vi.mock('../settings/DomainsSettingsPage', () => ({
  DomainsSettingsContent: () => <div data-testid="domains-settings">Domains Content</div>,
}));

vi.mock('../settings/SystemSettingsPage', () => ({
  SystemSettingsContent: () => <div data-testid="system-settings">System Content</div>,
}));

describe('SettingsPage', () => {
  beforeEach(() => {
    mockSearchParams = {};
    mockNavigate.mockClear();
  });

  it('renders inside DashboardLayout', () => {
    render(<SettingsPage />);
    expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();
  });

  it('renders "Settings" heading', () => {
    render(<SettingsPage />);
    expect(screen.getByRole('heading', { name: /settings/i })).toBeInTheDocument();
  });

  it('renders settings description text', () => {
    render(<SettingsPage />);
    expect(screen.getByText(/manage your account and organization settings/i)).toBeInTheDocument();
  });

  it('renders all 6 tab labels', () => {
    render(<SettingsPage />);
    expect(screen.getByRole('tab', { name: /profile/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /team/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /billing/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /api keys/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /domains/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /system/i })).toBeInTheDocument();
  });

  it('defaults to Profile tab content', async () => {
    render(<SettingsPage />);
    expect(await screen.findByTestId('profile-settings')).toBeInTheDocument();
  });

  it('shows Team content when tab=team search param is set', async () => {
    mockSearchParams = { tab: 'team' };
    render(<SettingsPage />);
    expect(await screen.findByTestId('team-settings')).toBeInTheDocument();
  });

  it('shows Billing content when tab=billing search param is set', async () => {
    mockSearchParams = { tab: 'billing' };
    render(<SettingsPage />);
    expect(await screen.findByTestId('billing-settings')).toBeInTheDocument();
  });

  it('calls navigate with tab param when a tab is clicked', async () => {
    const { user } = render(<SettingsPage />);
    const teamTab = screen.getByRole('tab', { name: /team/i });
    await user.click(teamTab);
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({
        to: '/settings',
        search: { tab: 'team' },
        replace: true,
      })
    );
  });
});
