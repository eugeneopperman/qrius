import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import { SmartPresets } from '../SmartPresets';
import { toast } from '@/stores/toastStore';

vi.mock('@/stores/qrStore', () => ({
  useQRStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      setActiveType: vi.fn(),
      setStyleOptions: vi.fn(),
      setUrlData: vi.fn(),
      setWifiData: vi.fn(),
      setVcardData: vi.fn(),
      setEventData: vi.fn(),
    }),
}));

vi.mock('zustand/react/shallow', () => ({
  useShallow: (fn: unknown) => fn,
}));

vi.mock('@/stores/toastStore', () => ({
  toast: { success: vi.fn() },
}));

describe('SmartPresets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders preset grid', () => {
    render(<SmartPresets />);
    // The grid container should exist with preset buttons
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(8);
  });

  it('renders preset names', () => {
    render(<SmartPresets />);
    expect(screen.getByText('WiFi Guest Network')).toBeInTheDocument();
    expect(screen.getByText('Business Card')).toBeInTheDocument();
    expect(screen.getByText('Marketing Campaign')).toBeInTheDocument();
    expect(screen.getByText('Social Media Link')).toBeInTheDocument();
    expect(screen.getByText('Event Check-in')).toBeInTheDocument();
    expect(screen.getByText('Restaurant Menu')).toBeInTheDocument();
    expect(screen.getByText('Payment Link')).toBeInTheDocument();
    expect(screen.getByText('Minimal Clean')).toBeInTheDocument();
  });

  it('renders preset descriptions', () => {
    render(<SmartPresets />);
    expect(screen.getByText('Share your guest WiFi credentials easily')).toBeInTheDocument();
    expect(screen.getByText('Professional contact card with your details')).toBeInTheDocument();
    expect(screen.getByText('Eye-catching QR for promotional materials')).toBeInTheDocument();
  });

  it('renders one-click templates tagline', () => {
    render(<SmartPresets />);
    expect(screen.getByText('One-click templates for common use cases')).toBeInTheDocument();
  });

  it('clicking a preset shows "Applied!" feedback', async () => {
    const { user } = render(<SmartPresets />);
    const wifiPreset = screen.getByText('WiFi Guest Network').closest('button')!;
    await user.click(wifiPreset);

    await waitFor(() => {
      expect(screen.getByText('Applied!')).toBeInTheDocument();
    });
  });

  it('clicking a preset calls toast with preset name', async () => {
    const { user } = render(<SmartPresets />);
    const wifiPreset = screen.getByText('WiFi Guest Network').closest('button')!;
    await user.click(wifiPreset);

    expect(toast.success).toHaveBeenCalledWith('Applied "WiFi Guest Network" preset');
  });

  it('clicking a url-type preset triggers toast for that preset', async () => {
    const { user } = render(<SmartPresets />);
    const marketingPreset = screen.getByText('Marketing Campaign').closest('button')!;
    await user.click(marketingPreset);

    expect(toast.success).toHaveBeenCalledWith('Applied "Marketing Campaign" preset');
  });

  it('clicking a preset calls onApply callback', async () => {
    const onApply = vi.fn();
    const { user } = render(<SmartPresets onApply={onApply} />);
    const minimalPreset = screen.getByText('Minimal Clean').closest('button')!;
    await user.click(minimalPreset);

    expect(onApply).toHaveBeenCalledTimes(1);
  });

  it('renders style tags (Gradient, Frame, type)', () => {
    render(<SmartPresets />);
    // Marketing Campaign has useGradient: true
    expect(screen.getByText('Gradient')).toBeInTheDocument();
    // Several presets have frame styles other than "none"
    const frameTags = screen.getAllByText('Frame');
    expect(frameTags.length).toBeGreaterThanOrEqual(1);
    // Type tags — there are multiple "url" type presets
    const urlTags = screen.getAllByText('url');
    expect(urlTags.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('wifi')).toBeInTheDocument();
    expect(screen.getByText('vcard')).toBeInTheDocument();
    expect(screen.getByText('event')).toBeInTheDocument();
  });

  it('renders footer customize text', () => {
    render(<SmartPresets />);
    expect(
      screen.getByText('Presets apply both styling and optimal settings. Customize further after applying.')
    ).toBeInTheDocument();
  });
});
