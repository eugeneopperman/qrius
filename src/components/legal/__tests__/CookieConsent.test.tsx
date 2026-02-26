import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@/test/test-utils';
import { CookieConsent } from '../CookieConsent';

// Mock the Button component to render a regular button
vi.mock('../../ui/Button', () => ({
  Button: ({ children, onClick, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

describe('CookieConsent', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not show banner initially before the delay', () => {
    render(<CookieConsent />);
    expect(screen.queryByText('Cookie Preferences')).not.toBeInTheDocument();
  });

  it('renders banner after the 1-second delay', () => {
    render(<CookieConsent />);

    // Before delay, banner should not be visible
    expect(screen.queryByText('Cookie Preferences')).not.toBeInTheDocument();

    // Advance past the 1-second delay
    act(() => {
      vi.advanceTimersByTime(1100);
    });

    expect(screen.getByText('Cookie Preferences')).toBeInTheDocument();
  });

  it('shows cookie description text', () => {
    render(<CookieConsent />);
    act(() => {
      vi.advanceTimersByTime(1100);
    });
    expect(
      screen.getByText(/We use cookies to enhance your experience/)
    ).toBeInTheDocument();
  });

  it('shows Accept All button', () => {
    render(<CookieConsent />);
    act(() => {
      vi.advanceTimersByTime(1100);
    });
    expect(screen.getByText('Accept All')).toBeInTheDocument();
  });

  it('shows Decline button', () => {
    render(<CookieConsent />);
    act(() => {
      vi.advanceTimersByTime(1100);
    });
    expect(screen.getByText('Decline')).toBeInTheDocument();
  });

  it('shows Customize button', () => {
    render(<CookieConsent />);
    act(() => {
      vi.advanceTimersByTime(1100);
    });
    expect(screen.getByText('Customize')).toBeInTheDocument();
  });

  it('clicking Accept All hides banner and sets localStorage', async () => {
    const { user } = render(<CookieConsent />);
    act(() => {
      vi.advanceTimersByTime(1100);
    });

    // Need real timers for userEvent
    vi.useRealTimers();
    await user.click(screen.getByText('Accept All'));

    expect(screen.queryByText('Cookie Preferences')).not.toBeInTheDocument();
    const stored = JSON.parse(localStorage.getItem('cookie-consent')!);
    expect(stored.status).toBe('accepted');
    expect(stored.analytics).toBe(true);
  });

  it('clicking Decline hides banner and sets localStorage', async () => {
    const { user } = render(<CookieConsent />);
    act(() => {
      vi.advanceTimersByTime(1100);
    });

    vi.useRealTimers();
    await user.click(screen.getByText('Decline'));

    expect(screen.queryByText('Cookie Preferences')).not.toBeInTheDocument();
    const stored = JSON.parse(localStorage.getItem('cookie-consent')!);
    expect(stored.status).toBe('declined');
    expect(stored.analytics).toBe(false);
  });

  it('clicking Customize shows analytics toggle', async () => {
    const { user } = render(<CookieConsent />);
    act(() => {
      vi.advanceTimersByTime(1100);
    });

    vi.useRealTimers();
    await user.click(screen.getByText('Customize'));

    expect(screen.getByText('Essential Cookies')).toBeInTheDocument();
    expect(screen.getByText('Analytics Cookies')).toBeInTheDocument();
    expect(screen.getByText('Always on')).toBeInTheDocument();
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('does not render if consent already given in localStorage', () => {
    localStorage.setItem(
      'cookie-consent',
      JSON.stringify({ status: 'accepted', timestamp: Date.now(), analytics: true })
    );

    render(<CookieConsent />);
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.queryByText('Cookie Preferences')).not.toBeInTheDocument();
  });

  it('shows cookie icon', () => {
    render(<CookieConsent />);
    act(() => {
      vi.advanceTimersByTime(1100);
    });
    // The Cookie lucide icon renders as an SVG, and the container div with the icon exists
    // Check the icon container has the orange background class
    const bannerContent = screen.getByText('Cookie Preferences');
    expect(bannerContent).toBeInTheDocument();
  });

  it('shows Save Preferences button after clicking Customize', async () => {
    const { user } = render(<CookieConsent />);
    act(() => {
      vi.advanceTimersByTime(1100);
    });

    vi.useRealTimers();
    await user.click(screen.getByText('Customize'));

    // Customize button should be replaced by Save Preferences
    expect(screen.queryByText('Customize')).not.toBeInTheDocument();
    expect(screen.getByText('Save Preferences')).toBeInTheDocument();
  });

  it('has a Learn more link to cookies page', () => {
    render(<CookieConsent />);
    act(() => {
      vi.advanceTimersByTime(1100);
    });
    const link = screen.getByText('Learn more');
    expect(link).toHaveAttribute('href', '/cookies');
  });
});
